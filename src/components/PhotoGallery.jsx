import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ListingImage from "./ListingImage";
import { SIZES } from "../lib/images";

const EASE = [0.16, 1, 0.3, 1];

/**
 * Photo viewer for a listing: one large photo, arrows and arrow keys to step through,
 * and a strip of thumbnails. With a single photo it is just the photo.
 */
const PhotoGallery = ({ images, alt, dimmed = false }) => {
  const [index, setIndex] = useState(0);
  const count = images.length;
  const current = Math.min(index, count - 1);

  // Start again from the first photo when the listing changes
  const firstImage = images[0];
  useEffect(() => {
    setIndex(0);
  }, [firstImage]);

  const step = (delta) => setIndex((value) => (value + delta + count) % count);

  const handleKeyDown = (event) => {
    if (count < 2) return;
    if (event.key === "ArrowLeft") step(-1);
    if (event.key === "ArrowRight") step(1);
  };

  const arrowClass =
    "absolute top-1/2 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-panel/90 text-ink shadow-card backdrop-blur transition duration-300 ease-out-expo hover:bg-ink hover:text-white active:scale-95";

  return (
    <div>
      <div
        className="group relative aspect-[16/10] overflow-hidden rounded-3xl bg-tint shadow-card"
        tabIndex={count > 1 ? 0 : undefined}
        role={count > 1 ? "group" : undefined}
        aria-label={count > 1 ? `Photos of ${alt}, ${current + 1} of ${count}` : undefined}
        onKeyDown={handleKeyDown}
      >
        <AnimatePresence initial={false} mode="popLayout">
          <motion.div
            key={images[current]}
            className="absolute inset-0"
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: EASE }}
          >
            <ListingImage src={images[current]} alt={alt} sizes="(min-width: 1024px) 60vw, 100vw" className={dimmed ? "grayscale" : ""} />
          </motion.div>
        </AnimatePresence>

        {count > 1 && (
          <>
            <button type="button" aria-label="Previous photo" onClick={() => step(-1)} className={`${arrowClass} left-4`}>
              <ChevronLeft className="size-5" strokeWidth={2} aria-hidden="true" />
            </button>
            <button type="button" aria-label="Next photo" onClick={() => step(1)} className={`${arrowClass} right-4`}>
              <ChevronRight className="size-5" strokeWidth={2} aria-hidden="true" />
            </button>
            <p className="absolute bottom-4 right-4 rounded-full bg-ink/75 px-3 py-1 text-sm text-white backdrop-blur" aria-hidden="true">
              {current + 1} / {count}
            </p>
          </>
        )}
      </div>

      {count > 1 && (
        <ul className="mt-3 grid grid-cols-4 gap-3 sm:grid-cols-5">
          {images.map((src, position) => (
            <li key={src}>
              <button
                type="button"
                onClick={() => setIndex(position)}
                aria-label={`Show photo ${position + 1}`}
                aria-current={position === current ? "true" : undefined}
                className={`relative block aspect-[4/3] w-full overflow-hidden rounded-2xl bg-tint transition duration-300 ease-out-expo ${
                  position === current ? "ring-2 ring-ink ring-offset-2 ring-offset-surface" : "opacity-70 hover:opacity-100"
                }`}
              >
                <ListingImage src={src} loading="lazy" sizes={SIZES.thumb} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default PhotoGallery;
