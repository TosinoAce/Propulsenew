import Reveal from "../Reveal";
import { responsiveImage } from "../../lib/images";

const IMAGES = [1, 2, 3, 4, 5, 6].map((n) => `/photos/gallery-${n}.png`);

/**
 * A slow strip of property photography. The track holds the images twice and slides by
 * half its width, which makes the loop seamless. It pauses on hover and stays still for
 * people who prefer reduced motion.
 */
const Gallery = () => (
  <section className="overflow-hidden py-24 lg:py-28">
    <Reveal className="shell mb-12">
      <h2 className="max-w-3xl text-4xl font-semibold tracking-tighter text-ink sm:text-5xl">
        We curate every property so you see only the best
      </h2>
    </Reveal>

    <div className="flex w-max animate-marquee items-start gap-5 pr-5 hover:[animation-play-state:paused]">
      {[...IMAGES, ...IMAGES].map((src, index) => (
        <img
          key={index}
          {...responsiveImage(src, "320px")}
          alt=""
          loading="lazy"
          aria-hidden={index >= IMAGES.length}
          className={`w-64 shrink-0 rounded-3xl bg-tint object-cover sm:w-80 ${
            index % 2 === 0 ? "aspect-[4/5]" : "mt-10 aspect-[4/5]"
          }`}
        />
      ))}
    </div>
  </section>
);

export default Gallery;
