// Photos kept in public/photos, public/listings and public/team have compressed WebP copies
// at 640px and 1280px wide (made by `npm run images`). This swaps a photo's address for those
// copies so phones download the small one. Anything else (uploads in Supabase storage,
// logos, SVGs) is returned unchanged.
const LOCAL_PHOTO = /^(\/(?:photos|listings|team)\/[^/]+)\.(?:jpe?g|png)$/i;

/** Props for an <img>: `src` plus, for local photos, `srcSet` and `sizes`. */
export const responsiveImage = (src, sizes = "100vw") => {
  const match = typeof src === "string" ? src.match(LOCAL_PHOTO) : null;
  if (!match) return { src };

  const base = match[1];
  return {
    src: `${base}-1280.webp`,
    srcSet: `${base}-640.webp 640w, ${base}-1280.webp 1280w`,
    sizes,
  };
};

/** Common `sizes` values for the site's layouts. */
export const SIZES = {
  full: "(min-width: 1280px) 1216px, 100vw",
  half: "(min-width: 1024px) 50vw, 100vw",
  third: "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw",
  quarter: "(min-width: 1024px) 25vw, 50vw",
  thumb: "160px",
};
