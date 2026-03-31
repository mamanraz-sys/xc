"use client";
/* סקשן גלריה - קרוסלה של תמונות */
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useScrollReveal } from "@/utils/useScrollReveal";

/* תמונות placeholder - ניתן להחליף בתמונות אמיתיות */
const galleryItems = [
  {
    id: 1,
    title: "פייד קלאסי",
    category: "תספורת גברים",
    gradient: "from-brown-800 to-brown-900",
  },
  {
    id: 2,
    title: "עיצוב זקן מדויק",
    category: "עיצוב זקן",
    gradient: "from-brown-900 to-brown-950",
  },
  {
    id: 3,
    title: "אנדרקאט מודרני",
    category: "תספורת גברים",
    gradient: "from-brown-700 to-brown-900",
  },
  {
    id: 4,
    title: "קרופ טקסטורה",
    category: "תספורת גברים",
    gradient: "from-brown-800 to-brown-950",
  },
  {
    id: 5,
    title: "עיצוב מלא",
    category: "תספורת + זקן",
    gradient: "from-brown-900 to-brown-800",
  },
  {
    id: 6,
    title: "סקין פייד",
    category: "תספורת גברים",
    gradient: "from-brown-950 to-brown-800",
  },
];

export default function Gallery() {
  const sectionRef = useScrollReveal();
  const [currentIndex, setCurrentIndex] = useState(0);

  /* מספר פריטים להצגה לפי גודל מסך - 1 במובייל, 3 בדסקטופ */
  const visibleCount = typeof window !== "undefined" && window.innerWidth >= 768 ? 3 : 1;
  const maxIndex = Math.max(0, galleryItems.length - visibleCount);

  const next = () => setCurrentIndex((prev) => Math.min(prev + 1, maxIndex));
  const prev = () => setCurrentIndex((prev) => Math.max(prev - 1, 0));

  return (
    <section
      id="gallery"
      ref={sectionRef}
      className="relative py-24 px-4 overflow-hidden"
    >
      <div className="relative z-10 max-w-6xl mx-auto">
        {/* כותרת */}
        <div className="text-center mb-16 fade-in-up">
          <span className="text-gold-400 text-sm tracking-[0.2em] uppercase font-medium">
            העבודות שלנו
          </span>
          <h2 className="font-frank text-4xl sm:text-5xl font-bold mt-3 text-brown-100">
            גלריה
          </h2>
          <div className="w-20 h-1 bg-gold-500 mx-auto mt-6 rounded-full" />
        </div>

        {/* קרוסלה */}
        <div className="fade-in-up relative">
          {/* כפתורי ניווט */}
          <button
            onClick={prev}
            disabled={currentIndex === 0}
            className="absolute right-0 top-1/2 -translate-y-1/2 -translate-x-4 z-20 w-12 h-12 rounded-full glass-effect flex items-center justify-center text-gold-400 hover:text-gold-500 transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed hover:scale-110"
            aria-label="הקודם"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
          <button
            onClick={next}
            disabled={currentIndex >= maxIndex}
            className="absolute left-0 top-1/2 -translate-y-1/2 translate-x-4 z-20 w-12 h-12 rounded-full glass-effect flex items-center justify-center text-gold-400 hover:text-gold-500 transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed hover:scale-110"
            aria-label="הבא"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          {/* תמונות */}
          <div className="overflow-hidden mx-12">
            <div
              className="flex gap-6 transition-transform duration-500 ease-out"
              style={{
                transform: `translateX(${currentIndex * (100 / visibleCount + 2)}%)`,
              }}
            >
              {galleryItems.map((item) => (
                <div
                  key={item.id}
                  className="flex-shrink-0 w-full md:w-[calc(33.333%-1rem)]"
                >
                  <div
                    className={`group relative aspect-[3/4] rounded-2xl overflow-hidden bg-gradient-to-b ${item.gradient} cursor-pointer`}
                  >
                    {/* placeholder - אייקון מספרה */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <svg
                        className="w-24 h-24 text-brown-600/30"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1"
                      >
                        <circle cx="6" cy="6" r="3" />
                        <circle cx="18" cy="6" r="3" />
                        <path d="M8.12 8.12L12 12l3.88-3.88" />
                        <path d="M12 12v8" />
                        <path d="M9 20h6" />
                      </svg>
                    </div>

                    {/* שכבת hover עם פרטים */}
                    <div className="absolute inset-0 bg-gradient-to-t from-brown-950/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="absolute bottom-0 right-0 left-0 p-6 translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-500">
                      <span className="text-gold-400 text-xs tracking-wider uppercase">
                        {item.category}
                      </span>
                      <h3 className="text-brown-100 text-lg font-bold mt-1">
                        {item.title}
                      </h3>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* נקודות ניווט */}
          <div className="flex justify-center gap-2 mt-8">
            {Array.from({ length: maxIndex + 1 }).map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  i === currentIndex
                    ? "w-8 bg-gold-400"
                    : "bg-brown-700 hover:bg-brown-500"
                }`}
                aria-label={`עבור לתמונה ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
