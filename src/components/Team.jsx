import React from "react";
import MemberCard from "./MemberCard";
import Partners from "./Partners";
import "./Team.css";

const Team = () => {
  return (
    <section className="Team">
      <div id="TeamMembers">
        <h2>Our Dedicated Team</h2>
        <p className="sub">Passionate Individuals Working Together</p>
        <div id="M-CardContainer">
          <MemberCard text="Co-CEO" name ="Abdullahi Ashiru" memberImg="/placeholder.png" link="/LinkedIn.png" twitter="/twitter.png"/>
          <MemberCard text="Co-CEO" name ="Oluwatosin Joseph" memberImg="/placeholder.png" link="/LinkedIn.png" twitter="/twitter.png"/>
        </div>
      </div>
      <div id="Partners">
        <h2>Our Partners</h2>
        <Partners />
      </div>
    </section>
  );
};

export default Team;
