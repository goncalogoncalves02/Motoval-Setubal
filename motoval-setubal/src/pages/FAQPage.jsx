import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Plus, Minus, HelpCircle } from "lucide-react";
import AnimatedSection from "../components/ui/AnimatedSection";
import SectionTitle from "../components/ui/SectionTitle";
import { faq } from "../data/content";

const FAQPage = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="pt-16 sm:pt-20 md:pt-24 pb-12 sm:pb-16 md:pb-20 bg-[#0A0A0A] min-h-screen mt-2">
      <Helmet>
        <title>Perguntas Frequentes | Motoval Setúbal - Pneus em Palmela</title>
        <meta name="description" content="Perguntas frequentes sobre a Motoval Setúbal: marcações, preços de alinhamento, montagem de pneus de moto, formas de pagamento e stock disponível." />
        <link rel="canonical" href="https://motovalsetubal.com/faq" />
        <meta property="og:title" content="Perguntas Frequentes | Motoval Setúbal" />
        <meta property="og:url" content="https://motovalsetubal.com/faq" />
      </Helmet>
      <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12 xl:px-16">
        <div className="text-center mb-8 sm:mb-10 md:mb-12">
          <AnimatedSection animation="fadeUp">
            <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-[#FBE013]/10 rounded-full mb-4 sm:mb-5 md:mb-6">
              <HelpCircle className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-[#FBE013]" />
            </div>
          </AnimatedSection>
          <SectionTitle
            title={faq.title}
            subtitle="Encontre respostas para as perguntas mais comuns sobre os nossos serviços."
          />
        </div>

        <div className="space-y-3 sm:space-y-4">
          {faq.items.map((item, index) => (
            <AnimatedSection
              key={item.id}
              animation="fadeUp"
              delay={index * 0.1}
            >
              <div
                className={`bg-[#141414] rounded-xl border transition-all duration-300 ${
                  openIndex === index
                    ? "border-[#FBE013]/50 shadow-lg shadow-[#FBE013]/5"
                    : "border-[#3D3D3D] hover:border-[#5A5A5A]"
                }`}
              >
                {/* Question */}
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full flex items-center justify-between p-4 sm:p-5 md:p-6 text-left"
                  aria-expanded={openIndex === index}
                >
                  <span className="text-white font-semibold text-base sm:text-lg pr-3 sm:pr-4">
                    {item.question}
                  </span>
                  <span
                    className={`flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                      openIndex === index
                        ? "bg-[#FBE013] text-black rotate-0"
                        : "bg-[#2D2D2D] text-white rotate-0"
                    }`}
                  >
                    {openIndex === index ? (
                      <Minus className="w-4 h-4 sm:w-5 sm:h-5" />
                    ) : (
                      <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                    )}
                  </span>
                </button>

                {/* Answer */}
                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    openIndex === index ? "max-h-96" : "max-h-0"
                  }`}
                >
                  <div className="px-4 pb-4 sm:px-5 sm:pb-5 md:px-6 md:pb-6 text-[#9CA3AF] text-sm sm:text-base md:text-lg leading-relaxed">
                    {item.answer}
                  </div>
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>

        {/* Contact CTA */}
        <AnimatedSection animation="fadeUp" delay={0.6}>
          <div className="mt-10 sm:mt-12 md:mt-16 text-center bg-[#141414] rounded-2xl p-6 sm:p-7 md:p-8 border border-[#3D3D3D]">
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">
              Ainda tem dúvidas?
            </h3>
            <p className="text-[#9CA3AF] text-sm sm:text-base mb-4 sm:mb-6">
              Entre em contacto connosco e teremos todo o gosto em ajudar.
            </p>
            <a
              href="/contacto"
              className="w-full sm:w-auto inline-flex items-center justify-center px-6 sm:px-8 py-3 bg-[#FBE013] text-black font-semibold rounded-lg hover:bg-[#E5C800] hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(251,224,19,0.4)] transition-all duration-300"
            >
              Falar Connosco
            </a>
          </div>
        </AnimatedSection>
      </div>
    </div>
  );
};

export default FAQPage;
