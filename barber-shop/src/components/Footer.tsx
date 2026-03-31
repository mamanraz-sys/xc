"use client";
/* פוטר - קישורים חברתיים ושעות פעילות */
import { Scissors, Instagram, Facebook } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-brown-950 border-t border-brown-800/30 pt-16 pb-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* חלק עליון */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          {/* לוגו ותיאור */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Scissors className="w-7 h-7 text-gold-400" />
              <span className="text-xl font-bold font-frank shimmer-text">
                אלמוג ג׳אמילי
              </span>
            </div>
            <p className="text-brown-400 text-sm leading-relaxed">
              מספרת גברים פרימיום בראשון לציון. חוויית טיפוח ברמה הגבוהה ביותר
              לגברים ולנערים.
            </p>
          </div>

          {/* שעות פעילות */}
          <div>
            <h3 className="text-brown-100 font-bold mb-4">שעות פעילות</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-brown-400">
                <span>ראשון — חמישי</span>
                <span className="text-brown-200">09:00–20:00</span>
              </div>
              <div className="flex justify-between text-brown-400">
                <span>שישי</span>
                <span className="text-brown-200">08:00–14:00</span>
              </div>
              <div className="flex justify-between text-brown-400">
                <span>שבת</span>
                <span className="text-brown-500">סגור</span>
              </div>
            </div>
          </div>

          {/* קישורים חברתיים */}
          <div>
            <h3 className="text-brown-100 font-bold mb-4">עקבו אחרינו</h3>
            <div className="flex gap-4">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-11 h-11 rounded-xl glass-effect flex items-center justify-center text-brown-300 hover:text-gold-400 hover:border-gold-400/40 transition-all duration-300 hover:scale-110"
                aria-label="אינסטגרם"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-11 h-11 rounded-xl glass-effect flex items-center justify-center text-brown-300 hover:text-gold-400 hover:border-gold-400/40 transition-all duration-300 hover:scale-110"
                aria-label="פייסבוק"
              >
                <Facebook className="w-5 h-5" />
              </a>
              {/* TikTok */}
              <a
                href="https://tiktok.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-11 h-11 rounded-xl glass-effect flex items-center justify-center text-brown-300 hover:text-gold-400 hover:border-gold-400/40 transition-all duration-300 hover:scale-110"
                aria-label="טיקטוק"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 0010.86 4.48V13a8.27 8.27 0 005.58 2.17V11.7a4.83 4.83 0 01-3.77-1.93V6.69h3.77z" />
                </svg>
              </a>
            </div>
            <p className="text-brown-500 text-xs mt-4">
              עקבו אחרינו לעדכונים, סטיילים חדשים ומבצעים
            </p>
          </div>
        </div>

        {/* קו מפריד */}
        <div className="border-t border-brown-800/30 pt-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-brown-500 text-xs">
            <span>
              © {currentYear} אלמוג ג׳אמילי ברבר שופ. כל הזכויות שמורות.
            </span>
            <span>ראשון לציון, ישראל</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
