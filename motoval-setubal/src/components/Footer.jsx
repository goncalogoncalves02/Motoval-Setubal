import React from 'react';
import { Facebook, Instagram, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import { footer } from '../data/content';

const Footer = () => {
  const handleLinkClick = (e, href) => {
    if (href.startsWith('#')) {
      e.preventDefault();
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <footer className="bg-[#0A0A0A] border-t border-[#3D3D3D]">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 xl:px-16 py-8 sm:py-10 md:py-12 lg:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-12">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-2">
            <Link to="/" className="inline-block">
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4 font-[var(--font-heading)] hover:text-[#FBE013] transition-colors">
                Motoval Setúbal
              </h3>
            </Link>
            <p className="text-[#9CA3AF] text-sm sm:text-base mb-4 sm:mb-6 max-w-md">
              {footer.description}
            </p>
            {/* Social Links */}
            <div className="flex gap-3 sm:gap-4">
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-[#1A1A1A] border border-[#3D3D3D] flex items-center justify-center text-[#9CA3AF] hover:border-[#FBE013] hover:text-[#FBE013] transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-4 h-4 sm:w-5 sm:h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-[#1A1A1A] border border-[#3D3D3D] flex items-center justify-center text-[#9CA3AF] hover:border-[#FBE013] hover:text-[#FBE013] transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4 sm:w-5 sm:h-5" />
              </a>
              <a
                href="tel:934803632"
                className="w-10 h-10 rounded-full bg-[#1A1A1A] border border-[#3D3D3D] flex items-center justify-center text-[#9CA3AF] hover:border-[#FBE013] hover:text-[#FBE013] transition-colors"
                aria-label="Telefone"
              >
                <Phone className="w-4 h-4 sm:w-5 sm:h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Links Rápidos</h4>
            <ul className="space-y-2 sm:space-y-3">
              <li>
                <Link
                  to="/"
                  className="text-[#9CA3AF] hover:text-[#FBE013] transition-colors text-sm sm:text-base py-1 inline-block"
                >
                  Início
                </Link>
              </li>
              <li>
                <a
                  href="/#services"
                  onClick={(e) => handleLinkClick(e, '#services')}
                  className="text-[#9CA3AF] hover:text-[#FBE013] transition-colors text-sm sm:text-base py-1 inline-block"
                >
                  Serviços
                </a>
              </li>
              <li>
                <a
                  href="/#about"
                  onClick={(e) => handleLinkClick(e, '#about')}
                  className="text-[#9CA3AF] hover:text-[#FBE013] transition-colors text-sm sm:text-base py-1 inline-block"
                >
                  Sobre
                </a>
              </li>
              <li>
                <Link
                  to="/horario"
                  className="text-[#9CA3AF] hover:text-[#FBE013] transition-colors text-sm sm:text-base py-1 inline-block"
                >
                  Horário
                </Link>
              </li>
              <li>
                <Link
                  to="/faq"
                  className="text-[#9CA3AF] hover:text-[#FBE013] transition-colors text-sm sm:text-base py-1 inline-block"
                >
                  FAQ
                </Link>
              </li>
              <li>
                <Link
                  to="/contacto"
                  className="text-[#9CA3AF] hover:text-[#FBE013] transition-colors text-sm sm:text-base py-1 inline-block"
                >
                  Contactos
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-white font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Contactos</h4>
            <ul className="space-y-2 sm:space-y-3 text-[#9CA3AF] text-sm sm:text-base">
              <li>
                <a
                  href="tel:934803632"
                  className="hover:text-[#FBE013] transition-colors py-1 inline-block"
                >
                  934 803 632
                </a>
              </li>
              <li>
                <a
                  href="mailto:motoval.setubal@outlook.com"
                  className="hover:text-[#FBE013] transition-colors py-1 inline-block break-all"
                >
                  motoval.setubal@outlook.com
                </a>
              </li>
              <li className="py-1">Quinta das Asseadas, Lote 1</li>
              <li className="py-1">2950-019 Palmela</li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 sm:mt-10 md:mt-12 pt-6 sm:pt-8 border-t border-[#3D3D3D] text-center">
          <p className="text-[#4A4A4A] text-xs sm:text-sm">{footer.copyright}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
