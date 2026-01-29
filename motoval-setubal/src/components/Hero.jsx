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
      <div className="relative z-10 w-full max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 text-center pt-24">
        <AnimatedSection animation="fadeUp">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-8 font-[var(--font-heading)] leading-tight">
            {hero.headline}
          </h1>
        </AnimatedSection>

        <AnimatedSection animation="fadeUp" delay={0.1}>
          <p className="text-lg sm:text-xl md:text-2xl text-[#9CA3AF] mb-12 max-w-3xl mx-auto leading-relaxed text-center">
            {hero.subheadline}
          </p>
        </AnimatedSection>

        <AnimatedSection animation="fadeUp" delay={0.2}>
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
            <Button
              href={`tel:${hero.ctaPrimary.phone}`}
              variant="primary"
              className="text-lg px-10 py-5 min-w-[220px] animate-glow-pulse"
            >
              {hero.ctaPrimary.text}
            </Button>
            <Button
              href={hero.ctaSecondary.link}
              variant="secondary"
              className="text-lg px-10 py-5 min-w-[220px]"
            >
              {hero.ctaSecondary.text}
            </Button>
          </div>
        </AnimatedSection>

        {/* Stats */}
        <AnimatedSection animation="fadeUp" delay={0.3}>
          <div className="flex flex-wrap justify-center gap-10 md:gap-20">
            {hero.stats.map((stat, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="flex items-center justify-center w-14 h-14 rounded-full bg-[#FBE013]/10">
                  {index === 0 ? (
                    <Star className="w-7 h-7 text-[#FBE013]" />
                  ) : (
                    <Users className="w-7 h-7 text-[#FBE013]" />
                  )}
                </div>
                <div className="text-left">
                  <p className="text-3xl md:text-4xl font-bold text-white">{stat.value}</p>
                  <p className="text-sm text-[#9CA3AF]">{stat.label}</p>
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
