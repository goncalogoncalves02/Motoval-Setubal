import React from 'react';
import { Phone, MessageCircle, Mail, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
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
    <section className="bg-[#0A0A0A]">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 xl:px-16">
        <SectionTitle
          title={contact.title}
          subtitle={contact.subtitle}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
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
                  className="block bg-[#141414] rounded-xl p-5 sm:p-6 md:p-8 border border-[#3D3D3D] hover:border-[#FBE013] transition-all duration-300 h-full group"
                >
                  <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-[#1A1A1A] rounded-xl flex items-center justify-center mb-4 sm:mb-5 md:mb-6 group-hover:bg-[#FBE013]/10 transition-colors">
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-[#FBE013]" />
                  </div>
                  <p className="text-xs sm:text-sm text-[#9CA3AF] mb-1 sm:mb-2">{item.label}</p>
                  <p className="text-white font-semibold text-base sm:text-lg group-hover:text-[#FBE013] transition-colors">
                    {item.value}
                  </p>
                </a>
              </AnimatedSection>
            );
          })}
        </div>

        {/* CTA Button */}
        <AnimatedSection animation="fadeUp" delay={0.4}>
          <div className="mt-12 text-center">
            <Link
              to="/contacto"
              className="inline-flex items-center justify-center px-8 py-4 bg-[#FBE013] text-black font-semibold rounded-lg hover:bg-[#E5C800] hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(251,224,19,0.4)] transition-all duration-300"
            >
              Ver Página de Contacto Completa
            </Link>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
};

export default Contact;
