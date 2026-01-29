import React, { useState } from 'react';
import { Plus, Minus } from 'lucide-react';
import AnimatedSection from './ui/AnimatedSection';
import SectionTitle from './ui/SectionTitle';
import { faq } from '../data/content';

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-20 md:py-32 bg-[#141414]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionTitle title={faq.title} />

        <div className="space-y-4">
          {faq.items.map((item, index) => (
            <AnimatedSection
              key={item.id}
              animation="fadeUp"
              delay={index * 0.1}
            >
              <div
                className={`bg-[#1A1A1A] rounded-xl border transition-all duration-300 ${
                  openIndex === index
                    ? 'border-[#FBE013]/50'
                    : 'border-[#2D2D2D] hover:border-[#4A4A4A]'
                }`}
              >
                {/* Question */}
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full flex items-center justify-between p-6 text-left"
                  aria-expanded={openIndex === index}
                >
                  <span className="text-white font-medium pr-4">
                    {item.question}
                  </span>
                  <span
                    className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                      openIndex === index
                        ? 'bg-[#FBE013] text-black rotate-0'
                        : 'bg-[#2D2D2D] text-white rotate-0'
                    }`}
                  >
                    {openIndex === index ? (
                      <Minus className="w-4 h-4" />
                    ) : (
                      <Plus className="w-4 h-4" />
                    )}
                  </span>
                </button>

                {/* Answer */}
                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    openIndex === index ? 'max-h-96' : 'max-h-0'
                  }`}
                >
                  <div className="px-6 pb-6 text-[#9CA3AF] leading-relaxed">
                    {item.answer}
                  </div>
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;
