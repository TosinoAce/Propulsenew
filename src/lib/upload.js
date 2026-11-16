import supabase from "./supabase";

const BUCKET = "property-images";
const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/svg+xml"];

/** Returns a message explaining why the file cannot be uploaded, or null when it is fine. */
export const checkImage = (file) => {
  if (!ALLOWED_TYPES.includes(file.type)) return `${file.name}: use a JPG, PNG, WebP or SVG image.`;
  if (file.size > MAX_BYTES) return `${file.name}: the file is over 5 MB. Please use a smaller image.`;
  return null;
};

/**
 * Uploads one image to storage and returns its public address.
 * `folder` keeps listing photos and partner logos apart. Only admins may upload;
 * the storage rules reject everyone else.
 */
export const uploadImage = async (file, folder) => {
  const problem = checkImage(file);
  if (problem) throw new Error(problem);

  const extension = file.name.includes(".") ? file.name.split(".").pop().toLowerCase() : "jpg";
  const path = `${folder}/${crypto.randomUUID()}.${extension}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { cacheControl: "31536000", contentType: file.type, upsert: false });
  if (error) throw error;

  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
};
