import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Star, Quote } from 'lucide-react';
import AnimatedSection from './ui/AnimatedSection';
import SectionTitle from './ui/SectionTitle';
import { testimonials } from '../data/content';

const Testimonials = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.items.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) =>
      prev === 0 ? testimonials.items.length - 1 : prev - 1
    );
  }, []);

  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [isPaused, nextSlide]);

  const currentTestimonial = testimonials.items[currentIndex];

  return (
    <section className="py-24 md:py-32 bg-[#0A0A0A]">
      <div className="max-w-5xl mx-auto px-6 sm:px-8 lg:px-12">
        <SectionTitle
          title={testimonials.title}
          subtitle={testimonials.subtitle}
        />

        <AnimatedSection animation="fadeUp">
          <div
            className="relative bg-[#141414] rounded-2xl p-8 md:p-12 lg:p-16 border border-[#2D2D2D]"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            {/* Quote Icon */}
            <Quote className="absolute top-8 right-8 w-16 h-16 text-[#FBE013]/20" />

            {/* Stars */}
            <div className="flex gap-1 mb-8">
              {[...Array(currentTestimonial.rating)].map((_, i) => (
                <Star
                  key={i}
                  className="w-6 h-6 fill-[#FBE013] text-[#FBE013]"
                />
              ))}
            </div>

            {/* Testimonial Text */}
            <blockquote className="text-xl md:text-2xl lg:text-3xl text-white mb-8 leading-relaxed">
              "{currentTestimonial.text}"
            </blockquote>

            {/* Author */}
            <p className="text-[#9CA3AF] font-medium text-lg">
              — {currentTestimonial.author}
            </p>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-10 pt-8 border-t border-[#2D2D2D]">
              {/* Dots */}
              <div className="flex gap-2">
                {testimonials.items.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                      index === currentIndex
                        ? 'bg-[#FBE013] w-8'
                        : 'bg-[#4A4A4A] hover:bg-[#9CA3AF]'
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>

              {/* Arrows */}
              <div className="flex gap-3">
                <button
                  onClick={prevSlide}
                  className="w-12 h-12 rounded-full border border-[#2D2D2D] flex items-center justify-center text-[#9CA3AF] hover:border-[#FBE013] hover:text-[#FBE013] transition-colors"
                  aria-label="Previous testimonial"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={nextSlide}
                  className="w-12 h-12 rounded-full border border-[#2D2D2D] flex items-center justify-center text-[#9CA3AF] hover:border-[#FBE013] hover:text-[#FBE013] transition-colors"
                  aria-label="Next testimonial"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
};

export default Testimonials;
