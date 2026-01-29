import { useState } from 'react';
import { Plus, Minus, HelpCircle } from 'lucide-react';
import AnimatedSection from '../components/ui/AnimatedSection';
import SectionTitle from '../components/ui/SectionTitle';
import { faq } from '../data/content';

const FAQPage = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="pt-24 pb-20 bg-[#0A0A0A] min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <AnimatedSection animation="fadeUp">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-[#FBE013]/10 rounded-full mb-6">
              <HelpCircle className="w-8 h-8 text-[#FBE013]" />
            </div>
          </AnimatedSection>
          <SectionTitle
            title={faq.title}
            subtitle="Encontre respostas para as perguntas mais comuns sobre os nossos serviços."
          />
        </div>

        <div className="space-y-4">
          {faq.items.map((item, index) => (
            <AnimatedSection
              key={item.id}
              animation="fadeUp"
              delay={index * 0.1}
            >
              <div
                className={`bg-[#141414] rounded-xl border transition-all duration-300 ${
                  openIndex === index
                    ? 'border-[#FBE013]/50 shadow-lg shadow-[#FBE013]/5'
                    : 'border-[#2D2D2D] hover:border-[#4A4A4A]'
                }`}
              >
                {/* Question */}
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full flex items-center justify-between p-6 text-left"
                  aria-expanded={openIndex === index}
                >
                  <span className="text-white font-semibold text-lg pr-4">
                    {item.question}
                  </span>
                  <span
                    className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                      openIndex === index
                        ? 'bg-[#FBE013] text-black rotate-0'
                        : 'bg-[#2D2D2D] text-white rotate-0'
                    }`}
                  >
                    {openIndex === index ? (
                      <Minus className="w-5 h-5" />
                    ) : (
                      <Plus className="w-5 h-5" />
                    )}
                  </span>
                </button>

                {/* Answer */}
                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    openIndex === index ? 'max-h-96' : 'max-h-0'
                  }`}
                >
                  <div className="px-6 pb-6 text-[#9CA3AF] text-lg leading-relaxed">
                    {item.answer}
                  </div>
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>

        {/* Contact CTA */}
        <AnimatedSection animation="fadeUp" delay={0.6}>
          <div className="mt-16 text-center bg-[#141414] rounded-2xl p-8 border border-[#2D2D2D]">
            <h3 className="text-2xl font-bold text-white mb-4">
              Ainda tem dúvidas?
            </h3>
            <p className="text-[#9CA3AF] mb-6">
              Entre em contacto connosco e teremos todo o gosto em ajudar.
            </p>
            <a
              href="/contacto"
              className="inline-flex items-center justify-center px-8 py-3 bg-[#FBE013] text-black font-semibold rounded-lg hover:bg-[#E5C800] hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(251,224,19,0.4)] transition-all duration-300"
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
