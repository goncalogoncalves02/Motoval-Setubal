import React from 'react';
import { Facebook, Instagram, Phone } from 'lucide-react';
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
    <footer className="bg-[#0A0A0A] border-t border-[#2D2D2D]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <h3 className="text-2xl font-bold text-white mb-4 font-[var(--font-heading)]">
              Motoval Setúbal
            </h3>
            <p className="text-[#9CA3AF] mb-6 max-w-md">
              {footer.description}
            </p>
            {/* Social Links */}
            <div className="flex gap-4">
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-[#1A1A1A] border border-[#2D2D2D] flex items-center justify-center text-[#9CA3AF] hover:border-[#FBE013] hover:text-[#FBE013] transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-[#1A1A1A] border border-[#2D2D2D] flex items-center justify-center text-[#9CA3AF] hover:border-[#FBE013] hover:text-[#FBE013] transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="tel:934803632"
                className="w-10 h-10 rounded-full bg-[#1A1A1A] border border-[#2D2D2D] flex items-center justify-center text-[#9CA3AF] hover:border-[#FBE013] hover:text-[#FBE013] transition-colors"
                aria-label="Telefone"
              >
                <Phone className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Links Rápidos</h4>
            <ul className="space-y-3">
              {footer.quickLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    onClick={(e) => handleLinkClick(e, link.href)}
                    className="text-[#9CA3AF] hover:text-[#FBE013] transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-white font-semibold mb-4">Contactos</h4>
            <ul className="space-y-3 text-[#9CA3AF]">
              <li>
                <a
                  href="tel:934803632"
                  className="hover:text-[#FBE013] transition-colors"
                >
                  934 803 632
                </a>
              </li>
              <li>
                <a
                  href="mailto:motoval.setubal@outlook.com"
                  className="hover:text-[#FBE013] transition-colors"
                >
                  motoval.setubal@outlook.com
                </a>
              </li>
              <li>Quinta das Asseadas, Lote 1</li>
              <li>2950-019 Palmela</li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-[#2D2D2D] text-center">
          <p className="text-[#4A4A4A] text-sm">{footer.copyright}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
