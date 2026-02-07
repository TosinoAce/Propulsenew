import "./button.css"

const Button = function Button(props){
  return (
   <button onClick={props.action} > {props.name}</button>
  )
}

export default Button