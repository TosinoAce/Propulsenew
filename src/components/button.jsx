import "./button.css"

const Button = function Button(props) {
  return (
    <button
      onClick={props.action}
      type={props.type}
      disabled={props.disabled}
    >
      {props.name}
    </button>
  )
}

export default Button