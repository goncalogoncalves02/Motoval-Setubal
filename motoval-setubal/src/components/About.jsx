import React from 'react';
import { Award, Users, Star, ThumbsUp } from 'lucide-react';
import AnimatedSection from './ui/AnimatedSection';
import SectionTitle from './ui/SectionTitle';
import { about } from '../data/content';

const About = () => {
  const icons = [Award, Users, Star, ThumbsUp];

  return (
    <section id="about" className="py-20 md:py-32 bg-[#141414]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
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
              {/* Decorative element */}
              <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-[#FBE013]/10 rounded-2xl -z-10" />
              <div className="absolute -top-4 -left-4 w-24 h-24 border-2 border-[#FBE013]/30 rounded-2xl -z-10" />
            </div>
          </AnimatedSection>

          {/* Content */}
          <div>
            <AnimatedSection animation="fadeUp">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 font-[var(--font-heading)]">
                {about.title}
              </h2>
            </AnimatedSection>

            <AnimatedSection animation="fadeUp" delay={0.1}>
              <p className="text-[#9CA3AF] text-lg leading-relaxed mb-10">
                {about.text}
              </p>
            </AnimatedSection>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-6">
              {about.stats.map((stat, index) => {
                const Icon = icons[index];
                return (
                  <AnimatedSection
                    key={index}
                    animation="scaleUp"
                    delay={0.2 + index * 0.1}
                  >
                    <div className="bg-[#1A1A1A] rounded-xl p-6 border border-[#2D2D2D] hover:border-[#FBE013]/50 transition-colors duration-300">
                      <Icon className="w-8 h-8 text-[#FBE013] mb-3" />
                      <p className="text-2xl md:text-3xl font-bold text-white mb-1">
                        {stat.value}
                      </p>
                      <p className="text-sm text-[#9CA3AF]">{stat.label}</p>
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
