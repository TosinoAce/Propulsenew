import { useState } from "react";
import { ImageOff } from "lucide-react";

/**
 * Property photo that fills its parent. If the file is missing or fails to load,
 * a quiet "no photo" panel takes its place instead of a broken-image icon.
 */
const ListingImage = ({ src, alt = "", className = "", ...rest }) => {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-tint text-muted">
        <ImageOff className="size-7" strokeWidth={1.5} aria-hidden="true" />
        <span className="text-sm">Photo unavailable</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={() => setFailed(true)}
      className={`absolute inset-0 size-full object-cover ${className}`}
      {...rest}
    />
  );
};

export default ListingImage;
