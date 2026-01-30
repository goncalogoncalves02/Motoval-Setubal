import React, { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, Star, Quote } from "lucide-react";
import AnimatedSection from "./ui/AnimatedSection";
import SectionTitle from "./ui/SectionTitle";
import { testimonials } from "../data/content";

const Testimonials = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.items.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) =>
      prev === 0 ? testimonials.items.length - 1 : prev - 1,
    );
  }, []);

  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [isPaused, nextSlide]);

  const currentTestimonial = testimonials.items[currentIndex];

  return (
    <section className="bg-[#0A0A0A] py-16 sm:py-20 lg:py-32">
      <div className="max-w-5xl mx-auto px-6 sm:px-8 lg:px-12 xl:px-16">
        <SectionTitle
          title={testimonials.title}
          subtitle={testimonials.subtitle}
        />

        <AnimatedSection animation="fadeUp">
          <div
            className="relative bg-[#141414] rounded-2xl p-6 sm:p-8 md:p-10 lg:p-12 xl:p-16 border border-[#3D3D3D]"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            {/* Quote Icon - smaller on mobile */}
            <Quote className="absolute top-4 right-4 sm:top-6 sm:right-6 md:top-8 md:right-8 w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 text-[#FBE013]/20" />

            {/* Stars */}
            <div className="flex gap-1 mb-4 sm:mb-6 md:mb-8">
              {[...Array(currentTestimonial.rating)].map((_, i) => (
                <Star
                  key={i}
                  className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 fill-[#FBE013] text-[#FBE013]"
                />
              ))}
            </div>

            {/* Testimonial Text */}
            <blockquote className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-white mb-4 sm:mb-6 md:mb-8 leading-relaxed">
              "{currentTestimonial.text}"
            </blockquote>

            {/* Author */}
            <p className="text-[#9CA3AF] font-medium text-base sm:text-lg">
              — {currentTestimonial.author}
            </p>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-6 sm:mt-8 md:mt-10 pt-4 sm:pt-6 md:pt-8 border-t border-[#3D3D3D]">
              {/* Dots */}
              <div className="flex gap-1.5 sm:gap-2">
                {testimonials.items.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full transition-all duration-300 ${
                      index === currentIndex
                        ? "bg-[#FBE013] w-6 sm:w-8"
                        : "bg-[#4A4A4A] hover:bg-[#9CA3AF]"
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>

              {/* Arrows */}
              <div className="flex gap-2 sm:gap-3">
                <button
                  onClick={prevSlide}
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-[#3D3D3D] flex items-center justify-center text-[#9CA3AF] hover:border-[#FBE013] hover:text-[#FBE013] transition-colors"
                  aria-label="Previous testimonial"
                >
                  <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
                <button
                  onClick={nextSlide}
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-[#3D3D3D] flex items-center justify-center text-[#9CA3AF] hover:border-[#FBE013] hover:text-[#FBE013] transition-colors"
                  aria-label="Next testimonial"
                >
                  <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
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
