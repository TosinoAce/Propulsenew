import supabase from "./supabase";

const EMAIL_PATTERN = /^\S+@\S+\.\S+$/;

/** Returns an error message for the form, or null when it is valid. */
export const validateInquiry = ({ name, email, message }) => {
  if (!name?.trim()) return "Please enter your name.";
  if (!EMAIL_PATTERN.test(email?.trim() ?? "")) return "Please enter a valid email address.";
  if (!message?.trim()) return "Please enter a message.";
  return null;
};

/**
 * Stores a message for a realtor (when `property` is given) or a general
 * contact message. Throws if the message could not be saved.
 */
export const sendInquiry = async ({ name, email, phone, message, property, user }) => {
  const { error } = await supabase.from("inquiries").insert({
    property_id: property?.id ?? null,
    realtor_name: property?.realtorName ?? null,
    user_id: user?.id ?? null,
    name: name.trim(),
    email: email.trim(),
    phone: phone?.trim() || null,
    message: message.trim(),
  });

  if (error) throw error;
};

/** Turns a Nigerian phone number into the digits-only form WhatsApp links need. */
export const toWhatsAppNumber = (phone) => {
  const digits = (phone ?? "").replace(/\D/g, "");
  if (!digits) return "";
  return digits.startsWith("0") ? `234${digits.slice(1)}` : digits;
};
