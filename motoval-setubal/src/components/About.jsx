import React from 'react';
import { Award, Users, Star, ThumbsUp } from 'lucide-react';
import AnimatedSection from './ui/AnimatedSection';
import { about } from '../data/content';

const About = () => {
  const icons = [Award, Users, Star, ThumbsUp];

  return (
    <section id="about" className="bg-[#141414]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 xl:gap-20 items-center">
          {/* Image */}
          <AnimatedSection animation="fadeUp">
            <div className="relative">
              <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-[#1A1A1A]">
                <img
                  src="https://images.unsplash.com/photo-1625047509248-ec889cbff17f?w=800&q=80"
                  alt="Oficina Motoval Setúbal"
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Decorative element - hidden on mobile */}
              <div className="hidden sm:block absolute -bottom-6 -right-6 w-24 sm:w-32 h-24 sm:h-32 bg-[#FBE013]/10 rounded-2xl -z-10" />
              <div className="hidden sm:block absolute -top-6 -left-6 w-16 sm:w-24 h-16 sm:h-24 border-2 border-[#FBE013]/30 rounded-2xl -z-10" />
            </div>
          </AnimatedSection>

          {/* Content */}
          <div>
            <AnimatedSection animation="fadeUp">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 sm:mb-6 md:mb-8 font-[var(--font-heading)] leading-tight">
                {about.title}
              </h2>
            </AnimatedSection>

            <AnimatedSection animation="fadeUp" delay={0.1}>
              <p className="text-[#9CA3AF] text-base sm:text-lg leading-relaxed mb-8 sm:mb-10 md:mb-12">
                {about.text}
              </p>
            </AnimatedSection>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-6">
              {about.stats.map((stat, index) => {
                const Icon = icons[index];
                return (
                  <AnimatedSection
                    key={index}
                    animation="scaleUp"
                    delay={0.2 + index * 0.1}
                  >
                    <div className="bg-[#1A1A1A] rounded-xl p-4 sm:p-5 md:p-6 border border-[#2D2D2D] hover:border-[#FBE013]/50 transition-colors duration-300">
                      <Icon className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-[#FBE013] mb-2 sm:mb-3 md:mb-4" />
                      <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-1 sm:mb-2">
                        {stat.value}
                      </p>
                      <p className="text-xs sm:text-sm text-[#9CA3AF]">{stat.label}</p>
                    </div>
                  </AnimatedSection>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
