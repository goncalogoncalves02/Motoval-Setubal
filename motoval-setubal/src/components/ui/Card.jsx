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
        p-4 sm:p-5 md:p-6
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
        <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-[#1A1A1A] rounded-lg flex items-center justify-center mb-3 sm:mb-4 group-hover:bg-[#FBE013]/10 transition-colors duration-300">
          <Icon className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-[#FBE013]" />
        </div>
      )}
      {title && (
        <h3 className="text-lg sm:text-xl font-bold text-white mb-2 font-[var(--font-heading)]">
          {title}
        </h3>
      )}
      {description && (
        <p className="text-[#9CA3AF] mb-3 sm:mb-4 text-xs sm:text-sm leading-relaxed">
          {description}
        </p>
      )}
      {price && (
        <p className="text-[#FBE013] font-bold text-base sm:text-lg">
          {price}
        </p>
      )}
      {children}
    </div>
  );
};

export default Card;
