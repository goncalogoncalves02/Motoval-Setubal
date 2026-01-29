import React from 'react';
import { Star, Users, ChevronDown } from 'lucide-react';
import Button from './ui/Button';
import AnimatedSection from './ui/AnimatedSection';
import { hero } from '../data/content';

const Hero = () => {
  const handleScrollToServices = () => {
    const element = document.querySelector('#services');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=1920&q=80')`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0A]/80 via-[#0A0A0A]/70 to-[#0A0A0A]" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 text-center pt-20 sm:pt-24">
        <AnimatedSection animation="fadeUp">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-6 sm:mb-8 font-[var(--font-heading)] leading-tight">
            {hero.headline}
          </h1>
        </AnimatedSection>

        <AnimatedSection animation="fadeUp" delay={0.1}>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-[#9CA3AF] mb-8 sm:mb-10 md:mb-12 max-w-3xl mx-auto leading-relaxed text-center">
            {hero.subheadline}
          </p>
        </AnimatedSection>

        <AnimatedSection animation="fadeUp" delay={0.2}>
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center mb-10 sm:mb-12 md:mb-16">
            <Button
              href={`tel:${hero.ctaPrimary.phone}`}
              variant="primary"
              className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8 md:px-10 py-4 sm:py-5 sm:min-w-[220px] animate-glow-pulse"
            >
              {hero.ctaPrimary.text}
            </Button>
            <Button
              href={hero.ctaSecondary.link}
              variant="secondary"
              className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8 md:px-10 py-4 sm:py-5 sm:min-w-[220px]"
            >
              {hero.ctaSecondary.text}
            </Button>
          </div>
        </AnimatedSection>

        {/* Stats */}
        <AnimatedSection animation="fadeUp" delay={0.3}>
          <div className="flex flex-wrap justify-center gap-6 sm:gap-8 md:gap-10 lg:gap-20">
            {hero.stats.map((stat, index) => (
              <div key={index} className="flex items-center gap-3 sm:gap-4">
                <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full bg-[#FBE013]/10">
                  {index === 0 ? (
                    <Star className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-[#FBE013]" />
                  ) : (
                    <Users className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-[#FBE013]" />
                  )}
                </div>
                <div className="text-left">
                  <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">{stat.value}</p>
                  <p className="text-xs sm:text-sm text-[#9CA3AF]">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </AnimatedSection>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2">
        <button
          onClick={handleScrollToServices}
          className="text-[#9CA3AF] hover:text-[#FBE013] transition-colors animate-bounce-slow"
          aria-label="Scroll to services"
        >
          <ChevronDown className="w-10 h-10" />
        </button>
      </div>
    </section>
  );
};

export default Hero;
