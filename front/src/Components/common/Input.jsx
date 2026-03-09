import React from 'react';
import './Input.css';

const Input = ({
    label,
    id,
    name,
    type = 'text',
    as = 'input',
    value,
    onChange,
    placeholder,
    required = false,
    error,
    helperText,
    disabled = false,
    icon,
    className = '',
    children,
    ...props
}) => {
    const classes = [
        'input-wrapper',
        error && 'input-error',
        disabled && 'input-disabled',
        className
    ].filter(Boolean).join(' ');

    const InputComponent = as;

    return (
        <div className={classes}>
            {label && (
                <label htmlFor={id} className="input-label">
                    {label} {required && <span className="required-star">*</span>}
                </label>
            )}
            <div className={`input-field-container ${icon ? 'has-icon' : ''}`}>
                {icon && <span className="input-icon">{icon}</span>}
                <InputComponent
                    id={id}
                    name={name}
                    type={as === 'input' ? type : undefined}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    required={required}
                    disabled={disabled}
                    className="input-field"
                    {...props}
                >
                    {children}
                </InputComponent>
            </div>
            {(error || helperText) && (
                <p className={`input-message ${error ? 'error' : 'helper'}`}>
                    {error || helperText}
                </p>
            )}
        </div>
    );
};

export default Input;
