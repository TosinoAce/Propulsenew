import { Heart, MessagesSquare } from "lucide-react";
import Reveal from "../Reveal";
import Spotlight from "../motion/Spotlight";

const cellBase = "relative overflow-hidden rounded-3xl p-8 sm:p-10";

/** Four reasons to use Propulse, laid out as a 2 x 2 bento with uneven column widths. */
const WhyPropulse = () => (
  <section className="shell py-24 lg:py-28">
    <Reveal className="mb-12 max-w-2xl">
      <h2 className="text-4xl font-semibold tracking-tighter text-ink sm:text-5xl">
        Built for people who want to buy with confidence
      </h2>
    </Reveal>

    <div className="grid gap-5 lg:grid-cols-12">
      <Reveal className={`${cellBase} flex min-h-[22rem] flex-col justify-end bg-tint lg:col-span-7`}>
        <img
          src="/Vector-2.png"
          alt=""
          loading="lazy"
          className="pointer-events-none absolute -right-10 -top-10 h-[115%] w-auto max-w-none opacity-95 sm:-right-4"
        />
        <div className="relative max-w-xs">
          <h3 className="text-2xl font-semibold tracking-tight text-ink">Listings picked with care</h3>
          <p className="mt-2 leading-relaxed text-muted">
            Every property is reviewed before it goes live, so you spend time only on real options.
          </p>
        </div>
      </Reveal>

      <Reveal delay={0.08} className="lg:col-span-5">
        <Spotlight tone="dark" className="flex h-full min-h-[22rem] flex-col justify-between rounded-3xl bg-ink p-8 text-white sm:p-10">
        <MessagesSquare className="relative size-10 text-accent" strokeWidth={1.5} aria-hidden="true" />
        <div className="relative">
          <h3 className="text-2xl font-semibold tracking-tight">A direct line to the realtor</h3>
          <p className="mt-2 leading-relaxed text-white/75">
            Each listing names its realtor and gives you three ways to reach them: inquiry, phone
            call or WhatsApp.
          </p>
        </div>
        </Spotlight>
      </Reveal>

      <Reveal className="lg:col-span-5">
        <Spotlight className="flex h-full min-h-[20rem] flex-col justify-between rounded-3xl bg-accent-soft p-8 sm:p-10">
        <Heart className="relative size-10 text-accent-deep" strokeWidth={1.5} aria-hidden="true" />
        <div className="relative">
          <h3 className="text-2xl font-semibold tracking-tight text-ink">Save now, decide later</h3>
          <p className="mt-2 leading-relaxed text-ink-soft">
            Keep a shortlist of the properties you like and come back to compare them whenever
            you are ready.
          </p>
        </div>
        </Spotlight>
      </Reveal>

      <Reveal delay={0.08} className={`${cellBase} flex min-h-[20rem] flex-col justify-end lg:col-span-7`}>
        <img
          src="/image.png"
          alt="A yellow bungalow with a covered porch and a wide front lawn"
          loading="lazy"
          className="absolute inset-0 size-full object-cover transition-transform duration-[1200ms] ease-out-expo hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/30 to-transparent" aria-hidden="true" />
        <div className="relative max-w-sm text-white">
          <h3 className="text-2xl font-semibold tracking-tight">Two states, one search</h3>
          <p className="mt-2 leading-relaxed text-white/85">
            Land and houses in Kwara and Lagos State, side by side and filterable in seconds.
          </p>
        </div>
      </Reveal>
    </div>
  </section>
);

export default WhyPropulse;
