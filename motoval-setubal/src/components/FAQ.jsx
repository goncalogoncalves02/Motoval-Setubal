import React, { useState } from 'react';
import { Plus, Minus } from 'lucide-react';
import { Link } from 'react-router-dom';
import AnimatedSection from './ui/AnimatedSection';
import SectionTitle from './ui/SectionTitle';
import { faq } from '../data/content';

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(0);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  // Only show first 3 FAQs on homepage
  const displayFAQs = faq.items.slice(0, 3);

  return (
    <section className="bg-[#141414]">
      <div className="max-w-3xl mx-auto px-6 sm:px-8 lg:px-12 xl:px-16">
        <SectionTitle title={faq.title} />

        <div className="space-y-3 sm:space-y-4">
          {displayFAQs.map((item, index) => (
            <AnimatedSection
              key={item.id}
              animation="fadeUp"
              delay={index * 0.1}
            >
              <div
                className={`bg-[#1A1A1A] rounded-xl border transition-all duration-300 ${
                  openIndex === index
                    ? 'border-[#FBE013]/50'
                    : 'border-[#3D3D3D] hover:border-[#5A5A5A]'
                }`}
              >
                {/* Question */}
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full flex items-center justify-between p-4 sm:p-5 md:p-6 text-left"
                  aria-expanded={openIndex === index}
                >
                  <span className="text-white font-medium text-base sm:text-lg pr-3 sm:pr-4">
                    {item.question}
                  </span>
                  <span
                    className={`flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                      openIndex === index
                        ? 'bg-[#FBE013] text-black'
                        : 'bg-[#2D2D2D] text-white'
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
                    openIndex === index ? 'max-h-96' : 'max-h-0'
                  }`}
                >
                  <div className="px-4 pb-4 sm:px-5 sm:pb-5 md:px-6 md:pb-6 text-[#9CA3AF] text-sm sm:text-base leading-relaxed">
                    {item.answer}
                  </div>
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>

        {/* See More Button */}
        <AnimatedSection animation="fadeUp" delay={0.4}>
          <div className="mt-10 text-center">
            <Link
              to="/faq"
              className="inline-flex items-center justify-center px-8 py-3 border-2 border-[#FBE013] text-[#FBE013] font-semibold rounded-lg hover:bg-[#FBE013] hover:text-black transition-all duration-300"
            >
              Ver Todas as Perguntas
            </Link>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
};

export default FAQ;
