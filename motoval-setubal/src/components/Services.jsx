import React from 'react';
import Card from './ui/Card';
import SectionTitle from './ui/SectionTitle';
import AnimatedSection from './ui/AnimatedSection';
import { services } from '../data/content';

const Services = () => {
  return (
    <section id="services" className="py-20 md:py-32 bg-[#0A0A0A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionTitle
          title={services.title}
          subtitle={services.subtitle}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {services.items.map((service, index) => (
            <AnimatedSection
              key={service.id}
              animation="fadeUp"
              delay={index * 0.1}
            >
              <Card
                icon={service.icon}
                title={service.title}
                description={service.description}
                price={service.price}
              />
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
