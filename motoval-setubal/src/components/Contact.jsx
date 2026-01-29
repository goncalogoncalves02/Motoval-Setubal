import React from 'react';
import { Phone, MessageCircle, Mail, MapPin } from 'lucide-react';
import AnimatedSection from './ui/AnimatedSection';
import SectionTitle from './ui/SectionTitle';
import { contact } from '../data/content';

const iconMap = {
  Phone,
  MessageCircle,
  Mail,
  MapPin
};

const Contact = () => {
  return (
    <section id="contact" className="py-20 md:py-32 bg-[#0A0A0A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionTitle
          title={contact.title}
          subtitle={contact.subtitle}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Contact Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {contact.items.map((item, index) => {
              const Icon = iconMap[item.icon];
              return (
                <AnimatedSection
                  key={item.id}
                  animation="fadeUp"
                  delay={index * 0.1}
                >
                  <a
                    href={item.href}
                    target={item.id === 'address' ? '_blank' : undefined}
                    rel={item.id === 'address' ? 'noopener noreferrer' : undefined}
                    className="block bg-[#141414] rounded-xl p-6 border border-[#2D2D2D] hover:border-[#FBE013] transition-all duration-300 h-full group"
                  >
                    <div className="w-12 h-12 bg-[#1A1A1A] rounded-lg flex items-center justify-center mb-4 group-hover:bg-[#FBE013]/10 transition-colors">
                      <Icon className="w-6 h-6 text-[#FBE013]" />
                    </div>
                    <p className="text-sm text-[#9CA3AF] mb-1">{item.label}</p>
                    <p className="text-white font-medium group-hover:text-[#FBE013] transition-colors">
                      {item.value}
                    </p>
                  </a>
                </AnimatedSection>
              );
            })}
          </div>

          {/* Map */}
          <AnimatedSection animation="fadeUp" delay={0.2}>
            <div className="bg-[#141414] rounded-2xl overflow-hidden border border-[#2D2D2D] h-full min-h-[300px]">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3113.5!2d-8.6123!3d38.5689!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzjCsDM0JzA4LjAiTiA4wrAzNiczNC4zIlc!5e0!3m2!1spt-PT!2spt!4v1234567890"
                width="100%"
                height="100%"
                style={{ border: 0, minHeight: '350px' }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Localização Motoval Setúbal"
                className="grayscale hover:grayscale-0 transition-all duration-500"
              />
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
};

export default Contact;
