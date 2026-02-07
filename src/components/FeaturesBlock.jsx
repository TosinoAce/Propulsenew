const FeaturesBlock = (props) => {
  return (
    <div className={props.active + " " + "featuresBlock"}>
      <img src={props.svg} alt="calendar"/>
      <p>{props.text}</p>
    </div>
  );
};

export default FeaturesBlock;
