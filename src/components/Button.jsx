import React from "react";
import './Button.css';

export const Button = ({ label, onClick, disabled }) => {
  return (
    <div className={`button-container ${disabled ? 'disabled' : ''}`} onClick={onClick}>
      {label}
    </div>
  );
}

export default Button;
