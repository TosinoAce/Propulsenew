import { useId } from "react";

/**
 * Form field with the label above and the error below.
 * `children` is a render function that receives the props to spread on the input.
 */
const Field = ({ label, error, hint, className = "", children }) => {
  const id = useId();
  const messageId = `${id}-message`;

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <label htmlFor={id} className="text-sm font-medium text-ink">
        {label}
      </label>
      {children({
        id,
        className: "field-input",
        "aria-invalid": error ? "true" : undefined,
        "aria-describedby": error || hint ? messageId : undefined,
      })}
      {error ? (
        <p id={messageId} className="text-sm text-danger">{error}</p>
      ) : (
        hint && <p id={messageId} className="text-sm text-muted">{hint}</p>
      )}
    </div>
  );
};

export default Field;
