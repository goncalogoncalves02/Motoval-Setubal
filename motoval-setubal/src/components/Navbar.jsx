import React, { useState, useEffect, useRef } from "react";
import { Menu, X } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import Button from "./ui/Button";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const prevLocation = useRef(location.pathname);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    if (prevLocation.current !== location.pathname) {
      prevLocation.current = location.pathname;
      // Use setTimeout to avoid synchronous setState
      const timeoutId = setTimeout(() => {
        setIsMobileMenuOpen(false);
      }, 0);
      return () => clearTimeout(timeoutId);
    }
  }, [location.pathname]);

  const navLinks = [
    { label: "Início", href: "/" },
    { label: "Serviços", href: "/#services" },
    { label: "Sobre", href: "/#about" },
    { label: "Ofertas", href: "/ofertas" },
    { label: "Horário", href: "/horario" },
    { label: "FAQ", href: "/faq" },
    { label: "Contactos", href: "/contacto" },
  ];

  const handleLinkClick = (e, href) => {
    if (href.startsWith("/#")) {
      // If we're not on the home page, navigate to home first
      if (location.pathname !== "/") {
        return; // Let the Link component handle the navigation
      }
      // We're on home page, scroll to section
      e.preventDefault();
      const sectionId = href.replace("/#", "");
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 w-full z-50 transition-all duration-300 ${
        isScrolled || location.pathname !== "/"
          ? "bg-[#0A0A0A]/95 backdrop-blur-md border-b border-[#3D3D3D]"
          : "bg-transparent"
      }`}
    >
      <div className="w-full max-w-7xl mx-auto px-5 sm:px-10 lg:px-12">
        <div className="flex items-center justify-between h-14 sm:h-16 md:h-20">
          {/* Logo */}
          <Link
            to="/"
            className="text-lg sm:text-xl md:text-2xl font-bold text-white hover:text-[#FBE013] transition-colors"
          >
            Motoval Setúbal
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.href}
                onClick={(e) => handleLinkClick(e, link.href)}
                className={`transition-colors text-sm font-medium ${
                  location.pathname === link.href
                    ? "text-[#FBE013]"
                    : "text-[#9CA3AF] hover:text-[#FBE013]"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link to="/contacto">
              <Button variant="primary" className="text-sm py-2 px-4">
                Contactar
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-white p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden absolute top-full left-0 right-0 bg-[#0A0A0A]/95 backdrop-blur-md border-b border-[#3D3D3D] transition-all duration-300 ${
          isMobileMenuOpen
            ? "opacity-100 visible translate-y-0"
            : "opacity-0 invisible -translate-y-4"
        }`}
      >
        <div className="px-6 py-6 space-y-2">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              to={link.href}
              onClick={(e) => handleLinkClick(e, link.href)}
              className={`block text-base sm:text-lg font-medium py-3 min-h-[48px] flex items-center transition-colors ${
                location.pathname === link.href
                  ? "text-[#FBE013]"
                  : "text-[#9CA3AF] hover:text-[#FBE013]"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <Link to="/contacto" className="block mt-4 pt-2">
            <Button variant="primary" className="w-full min-h-[48px]">
              Contactar
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
