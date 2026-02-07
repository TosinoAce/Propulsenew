import Button from "./button";
import "./Ambition.css";

const Ambition = () => {
  return (
    <section className="AmbitionContainer">
      <div id="AmbitionImageContainer">
        <img src="/image.png" alt="House Image"/>
      </div>
      <div id="AmbitionTextContainer">
        <span>OUR AMBITION</span>
        <h2>Empowering the Next Generation of Renters</h2>
        <p>
          Propulse is driven by a passion to enhance student living experiences.
          We aim to create a platform where students can easily find the perfect
          apartment, ensuring they focus more on their education and less on
          housing stress. Our goal is to revolutionize student housing by
          offering hassle-free, comfortable, and affordable living solutions.
          We’re dedicated to making the rental process simpler, faster, and more
          aligned with the modern needs of students
        </p>
      <Button name="LEARN MORE" />
      </div>
    </section>
  );
};

export default Ambition;
