import React from "react";
import Card from "./ui/Card";
import SectionTitle from "./ui/SectionTitle";
import AnimatedSection from "./ui/AnimatedSection";
import { services } from "../data/content";

const Services = () => {
  return (
    <section id="services" className="bg-[#0A0A0A] py-16 sm:py-20 lg:py-32">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 xl:px-16">
        <SectionTitle title={services.title} subtitle={services.subtitle} />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
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
