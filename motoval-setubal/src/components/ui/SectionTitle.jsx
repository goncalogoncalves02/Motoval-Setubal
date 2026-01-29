import React from 'react';
import AnimatedSection from './AnimatedSection';

const SectionTitle = ({ title, subtitle, centered = true }) => {
  return (
    <div className={`mb-8 sm:mb-10 md:mb-12 lg:mb-16 ${centered ? 'text-center' : ''}`}>
      <AnimatedSection>
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 sm:mb-5 md:mb-6 font-[var(--font-heading)] leading-tight">
          {title}
        </h2>
      </AnimatedSection>
      {subtitle && (
        <AnimatedSection delay={0.1}>
          <p className="text-[#9CA3AF] text-sm sm:text-base md:text-lg lg:text-xl max-w-3xl mx-auto leading-relaxed">
            {subtitle}
          </p>
        </AnimatedSection>
      )}
    </div>
  );
};

export default SectionTitle;
