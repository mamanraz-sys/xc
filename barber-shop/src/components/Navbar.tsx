"use client";
/* סרגל ניווט עליון - נצמד לחלק העליון בגלילה */
import { useState, useEffect } from "react";
import { Menu, X, Scissors } from "lucide-react";

const navLinks = [
  { href: "#services", label: "שירותים" },
  { href: "#gallery", label: "גלריה" },
  { href: "#booking", label: "קביעת תור" },
  { href: "#testimonials", label: "המלצות" },
  { href: "#contact", label: "צור קשר" },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 right-0 left-0 z-50 transition-all duration-500 ${
        isScrolled
          ? "glass-effect shadow-2xl py-3"
          : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* לוגו */}
          <a href="#" className="flex items-center gap-3 group">
            <Scissors
              className="w-8 h-8 text-gold-400 transition-transform duration-300 group-hover:rotate-45"
            />
            <span className="text-xl font-bold font-frank shimmer-text">
              אלמוג ג׳אמילי
            </span>
          </a>

          {/* קישורי ניווט - דסקטופ */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-brown-200 hover:text-gold-400 transition-colors duration-300 text-sm font-medium relative after:content-[''] after:absolute after:bottom-[-4px] after:right-0 after:w-0 after:h-[2px] after:bg-gold-400 after:transition-all after:duration-300 hover:after:w-full"
              >
                {link.label}
              </a>
            ))}
            <a
              href="#booking"
              className="btn-premium bg-gold-500 hover:bg-gold-400 text-brown-950 px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 hover:shadow-lg hover:shadow-gold-500/25"
            >
              קבע תור עכשיו
            </a>
          </div>

          {/* כפתור תפריט מובייל */}
          <button
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="md:hidden text-brown-200 hover:text-gold-400 transition-colors"
            aria-label="תפריט ניווט"
          >
            {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* תפריט מובייל */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-500 ease-in-out ${
            isMobileOpen ? "max-h-96 opacity-100 mt-4" : "max-h-0 opacity-0"
          }`}
        >
          <div className="glass-effect rounded-2xl p-6 space-y-4">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileOpen(false)}
                className="block text-brown-200 hover:text-gold-400 transition-colors duration-300 text-lg font-medium py-2"
              >
                {link.label}
              </a>
            ))}
            <a
              href="#booking"
              onClick={() => setIsMobileOpen(false)}
              className="block text-center btn-premium bg-gold-500 hover:bg-gold-400 text-brown-950 px-6 py-3 rounded-full font-bold transition-all duration-300 mt-4"
            >
              קבע תור עכשיו
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
}
