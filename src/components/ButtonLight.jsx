import "./ButtonLight.css"

const ButtonLight = function ButtonLight(props){
  return (
    <button className="buttonLight" onClick={props.action}>{props.name}</button>
  )
}

export default ButtonLight