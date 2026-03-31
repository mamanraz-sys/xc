"use client";
/* סקשן שירותים ומחירים */
import { Scissors, SprayCan, Sparkles, Baby } from "lucide-react";
import { useScrollReveal } from "@/utils/useScrollReveal";

/* רשימת שירותים עם מחירים ריאליסטיים לשוק הישראלי */
const services = [
  {
    icon: Scissors,
    title: "תספורת גברים",
    description: "תספורת מקצועית הכוללת ייעוץ סגנון אישי, שטיפה ועיצוב",
    price: "₪120",
    range: "₪100–₪140",
  },
  {
    icon: SprayCan,
    title: "תספורת + זקן",
    description: "חבילת הטיפוח המלאה — תספורת מקצועית בשילוב עיצוב זקן מדויק",
    price: "₪170",
    range: "₪150–₪200",
  },
  {
    icon: Sparkles,
    title: "עיצוב זקן",
    description: "עיצוב וגיזום זקן מקצועי, כולל קווי מתאר חדים ושימוש בתער",
    price: "₪80",
    range: "₪60–₪100",
  },
  {
    icon: Baby,
    title: "תספורת ילדים",
    description: "תספורת לילדים ונערים בסביבה נעימה וידידותית",
    price: "₪100",
    range: "₪80–₪120",
  },
];

export default function Services() {
  const sectionRef = useScrollReveal();

  return (
    <section
      id="services"
      ref={sectionRef}
      className="relative py-24 px-4"
    >
      {/* רקע דקורטיבי */}
      <div className="absolute inset-0 bg-gradient-to-b from-brown-950/50 to-[#1a1008]" />

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* כותרת סקשן */}
        <div className="text-center mb-16 fade-in-up">
          <span className="text-gold-400 text-sm tracking-[0.2em] uppercase font-medium">
            השירותים שלנו
          </span>
          <h2 className="font-frank text-4xl sm:text-5xl font-bold mt-3 text-brown-100">
            שירותים ומחירון
          </h2>
          <div className="w-20 h-1 bg-gold-500 mx-auto mt-6 rounded-full" />
        </div>

        {/* רשת שירותים */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {services.map((service, index) => (
            <div
              key={service.title}
              className="fade-in-up group glass-effect rounded-2xl p-8 hover:border-gold-400/40 transition-all duration-500 hover:scale-[1.02] hover:shadow-xl hover:shadow-gold-500/5"
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <div className="flex items-start gap-5">
                {/* אייקון */}
                <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-gold-500/10 flex items-center justify-center group-hover:bg-gold-500/20 transition-colors duration-300">
                  <service.icon className="w-7 h-7 text-gold-400" />
                </div>

                {/* פרטי שירות */}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-bold text-brown-100">
                      {service.title}
                    </h3>
                    <div className="text-left">
                      <span className="text-2xl font-bold text-gold-400">
                        {service.price}
                      </span>
                    </div>
                  </div>
                  <p className="text-brown-400 text-sm leading-relaxed mb-2">
                    {service.description}
                  </p>
                  <span className="text-xs text-brown-500">
                    טווח מחירים: {service.range}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* הערה */}
        <p className="text-center text-brown-500 text-sm mt-10 fade-in-up">
          * המחירים עשויים להשתנות. לפרטים נוספים צרו איתנו קשר
        </p>
      </div>
    </section>
  );
}
