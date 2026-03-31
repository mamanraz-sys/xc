"use client";
/* סקשן קביעת תור - אינטגרציה עם מערכת ההזמנות הקיימת */
import { Calendar, Clock, User, Phone } from "lucide-react";
import { useScrollReveal } from "@/utils/useScrollReveal";

/* שלבי ההזמנה במערכת הקיימת */
const steps = [
  { icon: Calendar, title: "בחירת שירות", description: "בחרו את סוג התספורת או הטיפול המבוקש" },
  { icon: Clock, title: "תאריך ושעה", description: "בחרו יום ושעה נוחים מתוך הזמנים הפנויים" },
  { icon: User, title: "פרטים אישיים", description: "הזינו שם מלא וספרו לנו אם יש בקשות מיוחדות" },
  { icon: Phone, title: "אישור הזמנה", description: "אישור סופי ושליחה — נתראה בקרוב!" },
];

export default function Booking() {
  const sectionRef = useScrollReveal();

  return (
    <section
      id="booking"
      ref={sectionRef}
      className="relative py-24 px-4"
    >
      {/* רקע דקורטיבי */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#1a1008] via-brown-950/50 to-[#1a1008]" />

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* כותרת */}
        <div className="text-center mb-16 fade-in-up">
          <span className="text-gold-400 text-sm tracking-[0.2em] uppercase font-medium">
            קביעת תור
          </span>
          <h2 className="font-frank text-4xl sm:text-5xl font-bold mt-3 text-brown-100">
            קבעו תור עכשיו
          </h2>
          <div className="w-20 h-1 bg-gold-500 mx-auto mt-6 rounded-full" />
          <p className="text-brown-400 mt-4 max-w-lg mx-auto">
            התהליך פשוט ומהיר — בחרו שירות, מועד, והשאירו פרטים
          </p>
        </div>

        {/* שלבי תהליך ההזמנה */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12 fade-in-up">
          {steps.map((step, index) => (
            <div
              key={step.title}
              className="text-center glass-effect rounded-2xl p-6 hover:border-gold-400/30 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-full bg-gold-500/10 flex items-center justify-center mx-auto mb-4">
                <step.icon className="w-6 h-6 text-gold-400" />
              </div>
              <div className="text-gold-400 text-xs font-bold mb-2">
                שלב {index + 1}
              </div>
              <h3 className="text-brown-100 font-bold text-sm mb-1">
                {step.title}
              </h3>
              <p className="text-brown-500 text-xs leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>

        {/* iframe למערכת ההזמנות הקיימת */}
        <div className="fade-in-up glass-effect rounded-2xl p-2 overflow-hidden">
          <iframe
            src="https://almogj.tmv.co.il"
            title="מערכת קביעת תורים — אלמוג ג׳אמילי ברבר שופ"
            className="w-full rounded-xl border-0"
            style={{ height: "700px" }}
            loading="lazy"
            allow="payment"
          />
        </div>

        {/* כפתור חלופי - פתיחה בחלון חדש */}
        <div className="text-center mt-6 fade-in-up">
          <a
            href="https://almogj.tmv.co.il"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-brown-400 hover:text-gold-400 transition-colors duration-300 text-sm"
          >
            <span>מעדיפים לקבוע תור בחלון נפרד? לחצו כאן</span>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
