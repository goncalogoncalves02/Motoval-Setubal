import { Helmet } from 'react-helmet-async';
import {
  Phone,
  MessageCircle,
  Mail,
  MapPin,
  Clock,
  Calendar,
} from "lucide-react";
import AnimatedSection from "../components/ui/AnimatedSection";
import SectionTitle from "../components/ui/SectionTitle";
import { contact, schedule } from "../data/content";
import { WhatsappIcon } from "../components/icons/WhatsappIcon";

const iconMap = {
  Phone,
  MessageCircle,
  Mail,
  MapPin,
  WhatsappIcon,
};

const ContactPage = () => {
  return (
    <div className="pt-16 sm:pt-20 md:pt-24 pb-12 sm:pb-16 md:pb-20 bg-[#0A0A0A] min-h-screen mt-2">
      <Helmet>
        <title>Contactos | Motoval Setúbal - Palmela</title>
        <meta name="description" content="Contacta a Motoval Setúbal em Palmela. Ligue 934 803 632, envie WhatsApp ou venha a Quinta das Asseadas, Lote 1, Aires. Aberto de Segunda a Sábado." />
        <link rel="canonical" href="https://motovalsetubal.com/contacto" />
        <meta property="og:title" content="Contactos | Motoval Setúbal - Palmela" />
        <meta property="og:url" content="https://motovalsetubal.com/contacto" />
      </Helmet>
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 xl:px-16">
        <SectionTitle
          title="Contacte-nos"
          subtitle="Estamos disponíveis para o ajudar. Escolha a forma mais conveniente."
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 lg:gap-12">
          {/* Contact Info */}
          <div className="space-y-6 sm:space-y-8">
            {/* Contact Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
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
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block bg-[#141414] rounded-xl p-4 sm:p-5 md:p-6 border border-[#3D3D3D] hover:border-[#FBE013] transition-all duration-300 h-full group"
                    >
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#1A1A1A] rounded-lg flex items-center justify-center mb-3 sm:mb-4 group-hover:bg-[#FBE013]/10 transition-colors">
                        <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-[#FBE013]" />
                      </div>
                      <p className="text-xs sm:text-sm text-[#9CA3AF] mb-1">
                        {item.label}
                      </p>
                      <p className="text-white font-medium text-sm sm:text-base group-hover:text-[#FBE013] transition-colors">
                        {item.value}
                      </p>
                    </a>
                  </AnimatedSection>
                );
              })}
            </div>

            {/* Schedule Section */}
            <AnimatedSection animation="fadeUp" delay={0.4}>
              <div className="bg-[#141414] rounded-2xl p-5 sm:p-6 md:p-7 border border-[#3D3D3D]">
                <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                  <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-[#FBE013]" />
                  <h3 className="text-lg sm:text-xl font-bold text-white">
                    Horário de Funcionamento
                  </h3>
                </div>
                <div className="space-y-2 sm:space-y-3">
                  {schedule.hours.map((item, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center py-2 px-2 sm:px-3 rounded-lg hover:bg-[#2D2D2D]/50 transition-colors"
                    >
                      <span className="font-medium text-white text-sm sm:text-base">
                        {item.day}
                      </span>
                      <span
                        className={`text-right text-xs sm:text-sm ${
                          item.hours === "Fechado"
                            ? "text-[#4A4A4A]"
                            : "text-[#9CA3AF]"
                        }`}
                      >
                        {item.hours}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 sm:mt-5 pt-4 sm:pt-5 border-t border-[#3D3D3D] flex items-start gap-2 sm:gap-3">
                  <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-[#FBE013] shrink-0 mt-0.5" />
                  <p className="text-[#9CA3AF] text-xs sm:text-sm">
                    {schedule.note}
                  </p>
                </div>
              </div>
            </AnimatedSection>
          </div>

          {/* Map */}
          <AnimatedSection animation="fadeUp" delay={0.2}>
            <div className="bg-[#141414] rounded-2xl overflow-hidden border border-[#3D3D3D] h-full min-h-[300px] sm:min-h-[400px] lg:min-h-[500px]">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d5183.367286587057!2d-8.890975922671554!3d38.56212067179768!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd194323971d5b77%3A0xa45ef3600ad7f4d2!2sMotoval%20Set%C3%BAbal!5e1!3m2!1spt-PT!2spt!4v1769799190389!5m2!1spt-PT!2spt"
                width="100%"
                height="100%"
                style={{ border: 0, minHeight: "inherit" }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Localização Motoval Setúbal"
                className="transition-all duration-500 min-h-[300px] sm:min-h-[400px] lg:min-h-[500px]"
              />
            </div>
          </AnimatedSection>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
