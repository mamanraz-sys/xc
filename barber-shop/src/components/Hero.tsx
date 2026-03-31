"use client";
/* סקשן הירו - הכניסה הראשית לאתר */
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

export default function Hero() {
  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* רקע גרדיאנט מותאם */}
      <div className="absolute inset-0 bg-gradient-to-b from-brown-950 via-[#1a1008] to-brown-950" />

      {/* אלמנט דקורטיבי - עיגולים מטושטשים */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-gold-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-brown-700/10 rounded-full blur-3xl" />

      {/* פסים דקורטיביים */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div className="absolute top-0 right-1/4 w-px h-full bg-gold-400" />
        <div className="absolute top-0 left-1/4 w-px h-full bg-gold-400" />
        <div className="absolute top-0 right-1/2 w-px h-full bg-gold-400" />
      </div>

      {/* תוכן מרכזי */}
      <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
        {/* תת-כותרת עליונה */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-6"
        >
          <span className="inline-block text-gold-400 text-sm tracking-[0.3em] uppercase font-medium border border-gold-400/30 px-6 py-2 rounded-full">
            Premium Barber Shop
          </span>
        </motion.div>

        {/* שם העסק */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="font-frank text-5xl sm:text-7xl lg:text-8xl font-black mb-6 leading-tight"
        >
          <span className="text-brown-100">אלמוג ג׳אמילי</span>
          <br />
          <span className="shimmer-text">ברבר שופ</span>
        </motion.h1>

        {/* סלוגן */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-brown-300 text-xl sm:text-2xl font-light mb-10 max-w-2xl mx-auto"
        >
          הסטייל שלך מתחיל כאן — חוויית טיפוח פרימיום לגבר המודרני
        </motion.p>

        {/* כפתורי פעולה */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <a
            href="#booking"
            className="btn-premium bg-gold-500 hover:bg-gold-400 text-brown-950 px-10 py-4 rounded-full text-lg font-bold transition-all duration-300 hover:shadow-xl hover:shadow-gold-500/20 hover:scale-105"
          >
            קבע תור עכשיו
          </a>
          <a
            href="#services"
            className="btn-premium border-2 border-brown-600 hover:border-gold-400 text-brown-200 hover:text-gold-400 px-10 py-4 rounded-full text-lg font-medium transition-all duration-300"
          >
            לשירותים שלנו
          </a>
        </motion.div>

        {/* שעות פעילות מהירות */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="mt-16 flex justify-center gap-8 text-sm text-brown-400"
        >
          <span>ראשון לציון</span>
          <span className="text-gold-400">•</span>
          <span>א׳-ה׳ 09:00–20:00</span>
          <span className="text-gold-400">•</span>
          <span>ו׳ 08:00–14:00</span>
        </motion.div>
      </div>

      {/* חץ גלילה למטה */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <a
          href="#services"
          className="block animate-bounce text-brown-500 hover:text-gold-400 transition-colors"
          aria-label="גלול למטה"
        >
          <ChevronDown className="w-8 h-8" />
        </a>
      </motion.div>
    </section>
  );
}
