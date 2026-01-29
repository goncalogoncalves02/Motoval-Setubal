import React from 'react';

const Card = ({ 
  children, 
  className = '',
  icon: Icon,
  title,
  description,
  price,
  ...props 
}) => {
  return (
    <div 
      className={`
        bg-[#141414] 
        border border-[#2D2D2D] 
        rounded-xl 
        p-6 
        transition-all 
        duration-300 
        hover:-translate-y-2 
        hover:border-[#FBE013] 
        hover:shadow-[0_20px_40px_rgba(251,224,19,0.1)]
        group
        ${className}
      `}
      {...props}
    >
      {Icon && (
        <div className="w-14 h-14 bg-[#1A1A1A] rounded-lg flex items-center justify-center mb-4 group-hover:bg-[#FBE013]/10 transition-colors duration-300">
          <Icon className="w-7 h-7 text-[#FBE013]" />
        </div>
      )}
      {title && (
        <h3 className="text-xl font-bold text-white mb-2 font-[var(--font-heading)]">
          {title}
        </h3>
      )}
      {description && (
        <p className="text-[#9CA3AF] mb-4 text-sm leading-relaxed">
          {description}
        </p>
      )}
      {price && (
        <p className="text-[#FBE013] font-bold text-lg">
          {price}
        </p>
      )}
      {children}
    </div>
  );
};

export default Card;
