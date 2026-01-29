import React from 'react';
import { Clock, Calendar } from 'lucide-react';
import AnimatedSection from './ui/AnimatedSection';
import SectionTitle from './ui/SectionTitle';
import { schedule } from '../data/content';

const Schedule = () => {
  const today = new Date().toLocaleDateString('pt-PT', { weekday: 'long' });
  const capitalizedToday = today.charAt(0).toUpperCase() + today.slice(1);

  return (
    <section className="py-24 md:py-32 bg-[#141414]">
      <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12">
        <SectionTitle
          title={schedule.title}
          subtitle={schedule.subtitle}
        />

        <AnimatedSection animation="fadeUp">
          <div className="bg-[#1A1A1A] rounded-2xl p-8 md:p-10 border border-[#2D2D2D]">
            {/* Table Header */}
            <div className="flex items-center gap-3 mb-8 pb-6 border-b border-[#2D2D2D]">
              <Calendar className="w-6 h-6 text-[#FBE013]" />
              <h3 className="text-xl font-bold text-white">Horário Semanal</h3>
            </div>

            {/* Schedule Table */}
            <div className="space-y-3">
              {schedule.hours.map((item, index) => {
                const isToday = item.day.toLowerCase() === capitalizedToday.toLowerCase();
                return (
                  <div
                    key={index}
                    className={`flex justify-between items-center py-4 px-4 rounded-lg transition-colors ${
                      isToday
                        ? 'bg-[#FBE013]/10 border border-[#FBE013]/30'
                        : 'hover:bg-[#2D2D2D]/50'
                    }`}
                  >
                    <span
                      className={`font-medium ${
                        isToday ? 'text-[#FBE013]' : 'text-white'
                      }`}
                    >
                      {item.day}
                      {isToday && (
                        <span className="ml-2 text-xs bg-[#FBE013] text-black px-2 py-0.5 rounded-full">
                          Hoje
                        </span>
                      )}
                    </span>
                    <span
                      className={`text-right ${
                        item.hours === 'Fechado'
                          ? 'text-[#4A4A4A]'
                          : 'text-[#9CA3AF]'
                      }`}
                    >
                      {item.hours}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Note */}
            <div className="mt-8 pt-6 border-t border-[#2D2D2D] flex items-start gap-3">
              <Clock className="w-5 h-5 text-[#FBE013] flex-shrink-0 mt-0.5" />
              <p className="text-[#9CA3AF] text-sm">{schedule.note}</p>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
};

export default Schedule;
