"use client";
/* סקשן המלצות לקוחות */
import { Star, Quote } from "lucide-react";
import { useScrollReveal } from "@/utils/useScrollReveal";

/* המלצות לדוגמה - ניתן להחליף בהמלצות אמיתיות */
const testimonials = [
  {
    name: "דניאל כהן",
    text: "אלמוג הוא ברבר ברמה אחרת. כל פעם שאני יוצא מהמספרה אני מרגיש כמו מיליון דולר. שירות מקצועי, אווירה מעולה, ותוצאות מושלמות.",
    rating: 5,
    service: "תספורת + זקן",
  },
  {
    name: "יונתן לוי",
    text: "כבר שנתיים שאני מסתפר רק אצל אלמוג. הוא מבין בדיוק מה אני רוצה ותמיד מביא את התוצאה הטובה ביותר. ממליץ בחום!",
    rating: 5,
    service: "תספורת גברים",
  },
  {
    name: "אבי מזרחי",
    text: "הבן שלי פחד ממספרות עד שהגענו לאלמוג. סבלנות אין סופית, יחס חם, והילד יוצא עם חיוך כל פעם. תודה רבה!",
    rating: 5,
    service: "תספורת ילדים",
  },
  {
    name: "עומר שרון",
    text: "האווירה במספרה פשוט מדהימה — מוזיקה טובה, שתייה קרה, והכי חשוב: תספורת ברמה הכי גבוהה. מקום שחובה לנסות.",
    rating: 5,
    service: "תספורת גברים",
  },
];

export default function Testimonials() {
  const sectionRef = useScrollReveal();

  return (
    <section
      id="testimonials"
      ref={sectionRef}
      className="relative py-24 px-4"
    >
      <div className="relative z-10 max-w-6xl mx-auto">
        {/* כותרת */}
        <div className="text-center mb-16 fade-in-up">
          <span className="text-gold-400 text-sm tracking-[0.2em] uppercase font-medium">
            מה אומרים עלינו
          </span>
          <h2 className="font-frank text-4xl sm:text-5xl font-bold mt-3 text-brown-100">
            המלצות לקוחות
          </h2>
          <div className="w-20 h-1 bg-gold-500 mx-auto mt-6 rounded-full" />
        </div>

        {/* רשת המלצות */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {testimonials.map((item, index) => (
            <div
              key={item.name}
              className="fade-in-up glass-effect rounded-2xl p-8 hover:border-gold-400/30 transition-all duration-500 group"
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              {/* סימן מירכאות */}
              <Quote className="w-8 h-8 text-gold-500/20 mb-4 group-hover:text-gold-500/40 transition-colors duration-300" />

              {/* טקסט ההמלצה */}
              <p className="text-brown-300 leading-relaxed mb-6 text-sm">
                &ldquo;{item.text}&rdquo;
              </p>

              {/* פרטי הממליץ */}
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-brown-100 font-bold">{item.name}</h4>
                  <span className="text-brown-500 text-xs">{item.service}</span>
                </div>
                {/* כוכבי דירוג */}
                <div className="flex gap-1">
                  {Array.from({ length: item.rating }).map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 fill-gold-400 text-gold-400"
                    />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
