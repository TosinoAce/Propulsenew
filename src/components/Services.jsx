import FeaturesBlock from "./FeaturesBlock";
import Button from "./button";
import "./Services.css";

const Services = () => {
  return (
    <section className="services">
      <div id="serviceImgContainer">
        <p>Services</p>
        <img id="servicesImage"src="/Vector-2.png" alt="Building" />
        <img id="PersonalizedButton" src="/Group.svg" alt="round"/>
        <div id="Personalized">
            <span>PERSONALIZED AGENCY</span>
        </div>
      </div>
      <div id="serviceTextContainer">
        <p id="featuresHeading">FEATURES</p>
        <h2>Tailored Housing Solutions</h2>
        <p id="featuresText">
          Explore a range of curated apartments designed to fit your needs,
          making it easy to find the perfect space that feels like home.
        </p>
        <div className="featuresList">
          <FeaturesBlock svg="/Vector8.svg" text=" FLEXIBLE" active = "active"/>
          <FeaturesBlock svg="/Vector7.svg" text=" FURNISHED" active = " "/>
          <FeaturesBlock svg="/Vector6.svg" text=" SECURE"active = " "/>
        </div>
        <div className="featuresListTwo">
        <FeaturesBlock svg="/ion_pin.svg" text=" CONVENIENT" active = " "/>
        <FeaturesBlock svg="/Vector9.svg" text=" AFFORDABLE" active = " "/>
        </div>
        <Button name="EXPLORE NOW" />
        <img id="serviceArrow" src="/Frame2.svg" alt="arrow"/> 
      </div>
    </section>
  );
};

export default Services;
