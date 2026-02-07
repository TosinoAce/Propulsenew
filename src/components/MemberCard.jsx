import React from "react";
import "./MemberCard.css"

const MemberCard = (props) => {
  return (
    <div className="M-Card">
      <img src={props.memberImg} alt="" />
      <p>{props.name}</p>
      <span>{props.text}</span>
      <div>
        <img src={props.link} alt="" />
        <img src={props.twitter} alt="" />
      </div>
    </div>
  );
};

export default MemberCard;
