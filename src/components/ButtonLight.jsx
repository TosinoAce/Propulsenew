import "./ButtonLight.css"

const ButtonLight = function ButtonLight(props){
  return (
    <button className="buttonLight">{props.name}</button>
  )
}

export default ButtonLight