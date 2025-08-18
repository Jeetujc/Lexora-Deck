import React, { forwardRef } from 'react';

const Input = forwardRef(({
  label,
  error,
  helperText,
  icon: Icon,
  iconPosition = 'left',
  variant = 'default',
  fullWidth = false,
  className = '',
  ...props
}, ref) => {
  const baseInputClasses = 'block px-3 py-2 text-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variantClasses = {
    default: 'border border-gray-300 rounded-lg bg-white focus:border-transparent',
    filled: 'border-0 rounded-lg bg-gray-100 focus:bg-white focus:ring-2',
  };

  const errorClasses = error 
    ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
    : '';

  const iconClasses = Icon ? (iconPosition === 'left' ? 'pl-10' : 'pr-10') : '';

  return (
    <div className={fullWidth ? 'w-full' : ''}>
      {/* Label */}
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}

      {/* Input Container */}
      <div className="relative">
        {/* Icon */}
        {Icon && (
          <div className={`absolute inset-y-0 ${iconPosition === 'left' ? 'left-0' : 'right-0'} flex items-center ${iconPosition === 'left' ? 'pl-3' : 'pr-3'} pointer-events-none`}>
            <Icon className={`w-4 h-4 ${error ? 'text-red-400' : 'text-gray-400'}`} />
          </div>
        )}

        {/* Input */}
        <input
          ref={ref}
          className={`
            ${baseInputClasses}
            ${variantClasses[variant]}
            ${errorClasses}
            ${iconClasses}
            ${fullWidth ? 'w-full' : ''}
            ${className}
          `}
          {...props}
        />
      </div>

      {/* Helper Text / Error */}
      {(error || helperText) && (
        <p className={`mt-1 text-xs ${error ? 'text-red-600' : 'text-gray-500'}`}>
          {error || helperText}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;