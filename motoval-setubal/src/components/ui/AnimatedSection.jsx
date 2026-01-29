import React from 'react';
import useScrollAnimation from '../../hooks/useScrollAnimation';

const AnimatedSection = ({ 
  children, 
  animation = 'fadeUp',
  delay = 0,
  className = '',
  ...props 
}) => {
  const { ref, isVisible } = useScrollAnimation(0.1, true);

  const animations = {
    fadeUp: 'animate-fadeUp',
    fadeIn: 'animate-fadeIn',
    scaleUp: 'animate-scaleUp'
  };

  return (
    <div
      ref={ref}
      className={`
        ${isVisible ? animations[animation] : 'opacity-0'}
        ${className}
      `}
      style={{
        animationDelay: `${delay}s`,
        animationFillMode: 'forwards'
      }}
      {...props}
    >
      {children}
    </div>
  );
};

export default AnimatedSection;
