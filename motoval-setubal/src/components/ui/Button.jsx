import React from 'react';

const Button = ({ 
  children, 
  variant = 'primary', 
  onClick, 
  className = '',
  href,
  ...props 
}) => {
  const baseStyles = 'inline-flex items-center justify-center px-8 py-4 text-base font-semibold rounded-xl transition-all duration-300 cursor-pointer min-h-[56px]';
  
  const variants = {
    primary: 'bg-[#FBE013] text-black hover:bg-[#E5C800] hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(251,224,19,0.4)]',
    secondary: 'border-2 border-white text-white hover:bg-white hover:text-black hover:scale-[1.02]',
    outline: 'border-2 border-[#2D2D2D] text-white hover:border-[#FBE013] hover:text-[#FBE013]'
  };

  const combinedClassName = `${baseStyles} ${variants[variant]} ${className}`;

  if (href) {
    return (
      <a href={href} className={combinedClassName} {...props}>
        {children}
      </a>
    );
  }

  return (
    <button onClick={onClick} className={combinedClassName} {...props}>
      {children}
    </button>
  );
};

export default Button;
