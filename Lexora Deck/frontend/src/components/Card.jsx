import React from 'react';

const Card = ({
  title,
  description,
  icon: Icon,
  image,
  children,
  className = '',
  variant = 'default',
  onClick,
}) => {
  const baseClasses = 'rounded-xl transition-all duration-300 cursor-pointer';
  
  const variantClasses = {
    default: 'bg-white shadow-md hover:shadow-xl border border-gray-100 p-6',
    featured: 'bg-gradient-to-br from-blue-50 to-purple-50 shadow-lg hover:shadow-2xl border border-blue-100 p-8',
    minimal: 'bg-white hover:bg-gray-50 border border-gray-200 p-4',
  };

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${className} group`}
      onClick={onClick}
    >
      {/* Image */}
      {image && (
        <div className="mb-4 overflow-hidden rounded-lg">
          <img
            src={image}
            alt={title}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}

      {/* Icon */}
      {Icon && (
        <div className={`mb-4 ${variant === 'featured' ? 'mb-6' : ''}`}>
          <div className={`inline-flex items-center justify-center rounded-lg ${
            variant === 'featured' 
              ? 'w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600' 
              : 'w-12 h-12 bg-blue-100'
          }`}>
            <Icon className={`${
              variant === 'featured' 
                ? 'w-8 h-8 text-white' 
                : 'w-6 h-6 text-blue-600'
            }`} />
          </div>
        </div>
      )}

      {/* Content */}
      <div>
        <h3 className={`font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-200 ${
          variant === 'featured' ? 'text-xl' : 'text-lg'
        }`}>
          {title}
        </h3>
        <p className={`text-gray-600 ${
          variant === 'featured' ? 'text-base' : 'text-sm'
        }`}>
          {description}
        </p>
      </div>

      {/* Children */}
      {children && (
        <div className="mt-4">
          {children}
        </div>
      )}
    </div>
  );
};

export default Card;