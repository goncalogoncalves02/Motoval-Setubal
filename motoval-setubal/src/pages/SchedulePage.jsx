import { Helmet } from 'react-helmet-async';
import { Clock, Calendar, Phone, MessageCircle } from 'lucide-react';
import AnimatedSection from '../components/ui/AnimatedSection';
import SectionTitle from '../components/ui/SectionTitle';
import { schedule } from '../data/content';
import { WhatsappIcon } from '../components/icons/WhatsappIcon';

const SchedulePage = () => {
  return (
    <div className="pt-16 sm:pt-20 md:pt-24 pb-12 sm:pb-16 md:pb-20 bg-[#0A0A0A] min-h-screen mt-2">
      <Helmet>
        <title>Horário | Motoval Setúbal - Palmela</title>
        <meta name="description" content="Horário da Motoval Setúbal em Palmela: Segunda a Sexta 10h-13h30 e 15h-19h30, Sábado 10h-13h30. Recomendamos marcação, especialmente aos sábados." />
        <link rel="canonical" href="https://motovalsetubal.com/horario" />
        <meta property="og:title" content="Horário | Motoval Setúbal" />
        <meta property="og:url" content="https://motovalsetubal.com/horario" />
      </Helmet>
      <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12 xl:px-16">
        <div className="text-center mb-8 sm:mb-10 md:mb-12">
          <AnimatedSection animation="fadeUp">
            <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-[#FBE013]/10 rounded-full mb-4 sm:mb-5 md:mb-6">
              <Calendar className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-[#FBE013]" />
            </div>
          </AnimatedSection>
          <SectionTitle
            title={schedule.title}
            subtitle={schedule.subtitle}
          />
        </div>

        {/* Schedule Table */}
        <AnimatedSection animation="fadeUp" delay={0.2}>
          <div className="bg-[#141414] rounded-2xl p-5 sm:p-6 md:p-8 border border-[#3D3D3D]">
            <div className="space-y-2 sm:space-y-3">
              {schedule.hours.map((item, index) => (
                <div
                  key={index}
                  className={`flex justify-between items-center py-3 sm:py-4 px-3 sm:px-4 rounded-xl transition-colors ${
                    item.hours === 'Fechado'
                      ? 'bg-[#1A1A1A]/50'
                      : 'hover:bg-[#2D2D2D]/50'
                  }`}
                >
                  <span className="font-semibold text-white text-base sm:text-lg">
                    {item.day}
                  </span>
                  <span
                    className={`text-right text-sm sm:text-base ${
                      item.hours === 'Fechado'
                        ? 'text-[#4A4A4A]'
                        : 'text-[#9CA3AF]'
                    }`}
                  >
                    {item.hours}
                  </span>
                </div>
              ))}
            </div>

            {/* Note */}
            <div className="mt-5 sm:mt-6 pt-5 sm:pt-6 border-t border-[#3D3D3D] flex items-start gap-3">
              <Clock className="w-5 h-5 text-[#FBE013] flex-shrink-0 mt-0.5" />
              <p className="text-[#9CA3AF] text-sm sm:text-base">{schedule.note}</p>
            </div>
          </div>
        </AnimatedSection>

        {/* Contact CTA */}
        <AnimatedSection animation="fadeUp" delay={0.4}>
          <div className="mt-8 sm:mt-10 md:mt-12 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <a
              href="tel:934803632"
              className="flex items-center justify-center gap-3 px-6 py-4 bg-[#FBE013] text-black font-semibold rounded-xl hover:bg-[#E5C800] hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(251,224,19,0.4)] transition-all duration-300"
            >
              📞 Ligar Agora
            </a>
            <a
              href="https://wa.me/351934803632"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 px-6 py-4 bg-[#141414] text-white font-semibold rounded-xl border border-[#3D3D3D] hover:border-[#FBE013] hover:text-[#FBE013] transition-all duration-300"
            >
              <WhatsappIcon className="w-5 h-5" />
              WhatsApp
            </a>
          </div>
        </AnimatedSection>

        {/* Info Card */}
        <AnimatedSection animation="fadeUp" delay={0.5}>
          <div className="mt-8 sm:mt-10 md:mt-12 text-center bg-[#141414] rounded-2xl p-6 sm:p-7 md:p-8 border border-[#3D3D3D]">
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">
              Precisa de Marcação?
            </h3>
            <p className="text-[#9CA3AF] text-sm sm:text-base mb-4 sm:mb-6">
              Recomendamos marcação para garantir atendimento rápido, especialmente aos sábados.
            </p>
            <a
              href="/contacto"
              className="w-full sm:w-auto inline-flex items-center justify-center px-6 sm:px-8 py-3 bg-[#FBE013] text-black font-semibold rounded-lg hover:bg-[#E5C800] hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(251,224,19,0.4)] transition-all duration-300"
            >
              Ver Contactos
            </a>
          </div>
        </AnimatedSection>
      </div>
    </div>
  );
};

export default SchedulePage;
