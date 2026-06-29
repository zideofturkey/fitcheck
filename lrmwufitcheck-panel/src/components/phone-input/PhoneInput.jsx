import { forwardRef, useState } from "react";
import PhoneInputLib from "react-phone-number-input";
import "react-phone-number-input/style.css";

const PhoneInput = forwardRef(
  (
    { value, onChange, disabled, placeholder, className, error, id, ...rest },
    ref,
  ) => {
    return (
      <div className="phone-input-wrapper">
        <PhoneInputLib
          ref={ref}
          id={id}
          international
          defaultCountry="US"
          value={value || ""}
          onChange={(val) => onChange(val || "")}
          disabled={disabled}
          placeholder={placeholder || "+1 234 567 8900"}
          className={`phone-input-container ${error ? "phone-input-error" : ""} ${disabled ? "phone-input-disabled" : ""} ${className || ""}`}
          {...rest}
        />
      </div>
    );
  },
);

PhoneInput.displayName = "PhoneInput";
export default PhoneInput;
