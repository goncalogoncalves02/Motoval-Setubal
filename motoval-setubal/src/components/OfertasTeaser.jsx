import { Tag, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import AnimatedSection from './ui/AnimatedSection'
import { ofertasTeaser } from '../data/content'

const OfertasTeaser = () => (
  <section id="ofertas-teaser" className="bg-[#0A0A0A] py-8 sm:py-10">
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <AnimatedSection animation="fadeUp">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 bg-[#141414] border border-[#FBE013]/20 rounded-2xl p-6 sm:p-8 md:p-10">

          {/* Ícone + texto */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
            <div className="shrink-0 flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-[#FBE013]/10">
              <Tag className="w-7 h-7 sm:w-8 sm:h-8 text-[#FBE013]" />
            </div>
            <div>
              <span className="inline-block text-[10px] sm:text-xs font-semibold tracking-widest text-[#FBE013] uppercase mb-1">
                {ofertasTeaser.badge}
              </span>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-1">
                {ofertasTeaser.title}
              </h2>
              <p className="text-sm sm:text-base text-[#9CA3AF] max-w-md">
                {ofertasTeaser.subtitle}
              </p>
            </div>
          </div>

          {/* Botão CTA */}
          <Link
            to={ofertasTeaser.href}
            className="shrink-0 flex items-center gap-2 bg-[#FBE013] hover:bg-[#E5C800] text-black font-bold text-sm sm:text-base px-6 py-3 sm:px-8 sm:py-4 rounded-xl transition-colors w-full sm:w-auto justify-center min-h-12"
          >
            {ofertasTeaser.cta}
            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </Link>

        </div>
      </AnimatedSection>
    </div>
  </section>
)

export default OfertasTeaser
