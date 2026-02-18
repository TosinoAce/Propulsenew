import ButtonLight from "./ButtonLight";
import SearchWidget from "./SearchWidget";
import "./Hero.css";


const Hero = () => {
  return (
    <>
      <section className="hero">
        <div id="coverText">
          <h2>
            Ready to Find your <br /> Dream <span>Home?</span>
          </h2>
          <p>
            Find the perfect apartment that suits your lifestyle. Whether you&apos;re a
            student or young professional, Propulse makes it easy to find your
            next home with just a few clicks.
          </p>
          <ButtonLight name="EXPLORE NOW" />
        </div>
        <div id="coverImg">
        </div>
        <img id="arrow" src="/Frame.svg" alt="arrow" />
        <SearchWidget />
      </section>
    </>
  );
};

export default Hero;