import React from 'react';
import AnimatedSection from './AnimatedSection';

const SectionTitle = ({ title, subtitle, centered = true }) => {
  return (
    <div className={`mb-12 ${centered ? 'text-center' : ''}`}>
      <AnimatedSection>
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 font-[var(--font-heading)]">
          {title}
        </h2>
      </AnimatedSection>
      {subtitle && (
        <AnimatedSection delay={0.1}>
          <p className="text-[#9CA3AF] text-lg max-w-2xl mx-auto">
            {subtitle}
          </p>
        </AnimatedSection>
      )}
    </div>
  );
};

export default SectionTitle;
