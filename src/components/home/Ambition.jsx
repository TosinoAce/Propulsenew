import Button from "../button";
import Reveal from "../Reveal";
import ScrollText from "../motion/ScrollText";

/** The company's ambition as a single large statement. */
const Ambition = () => (
  <section className="bg-tint">
    <Reveal className="shell py-24 lg:py-32">
      <p className="text-sm font-medium uppercase tracking-[0.18em] text-accent-deep">Our ambition</p>
      <ScrollText
        className="mt-6 max-w-5xl text-3xl font-medium leading-[1.2] tracking-tight text-ink sm:text-4xl lg:text-5xl"
        text="We want owning property to feel simple and transparent, with every listing in one place and the realtor one message away."
      />
      <Button to="/about" variant="secondary" className="mt-10">About Propulse</Button>
    </Reveal>
  </section>
);

export default Ambition;
