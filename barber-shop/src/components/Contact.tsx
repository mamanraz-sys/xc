"use client";
/* סקשן צור קשר - מפה, טלפון, וואטסאפ */
import { Phone, MapPin, Clock, MessageCircle } from "lucide-react";
import { useScrollReveal } from "@/utils/useScrollReveal";

/* פרטי יצירת קשר */
const contactInfo = [
  {
    icon: Phone,
    title: "טלפון",
    value: "050-000-0000",
    href: "tel:+9720500000000",
    note: "ניתן להתקשר בשעות הפעילות",
  },
  {
    icon: MessageCircle,
    title: "וואטסאפ",
    value: "שלחו הודעה",
    href: "https://wa.me/9720500000000?text=היי%20אלמוג%2C%20אשמח%20לקבוע%20תור",
    note: "תגובה מהירה בוואטסאפ",
  },
  {
    icon: MapPin,
    title: "כתובת",
    value: "ראשון לציון",
    href: "https://maps.google.com/?q=ראשון+לציון",
    note: "חניה זמינה בקרבת מקום",
  },
  {
    icon: Clock,
    title: "שעות פעילות",
    value: "א׳-ה׳ 09:00–20:00",
    href: "#",
    note: "ו׳ 08:00–14:00 | שבת סגור",
  },
];

export default function Contact() {
  const sectionRef = useScrollReveal();

  return (
    <section
      id="contact"
      ref={sectionRef}
      className="relative py-24 px-4"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-[#1a1008] via-brown-950/30 to-brown-950" />

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* כותרת */}
        <div className="text-center mb-16 fade-in-up">
          <span className="text-gold-400 text-sm tracking-[0.2em] uppercase font-medium">
            בואו לבקר
          </span>
          <h2 className="font-frank text-4xl sm:text-5xl font-bold mt-3 text-brown-100">
            צרו קשר
          </h2>
          <div className="w-20 h-1 bg-gold-500 mx-auto mt-6 rounded-full" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* כרטיסי מידע */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {contactInfo.map((item, index) => (
              <a
                key={item.title}
                href={item.href}
                target={item.href.startsWith("http") ? "_blank" : undefined}
                rel={item.href.startsWith("http") ? "noopener noreferrer" : undefined}
                className="fade-in-up glass-effect rounded-2xl p-6 hover:border-gold-400/30 transition-all duration-300 group block"
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className="w-12 h-12 rounded-xl bg-gold-500/10 flex items-center justify-center mb-4 group-hover:bg-gold-500/20 transition-colors duration-300">
                  <item.icon className="w-6 h-6 text-gold-400" />
                </div>
                <h3 className="text-brown-100 font-bold mb-1">{item.title}</h3>
                <p className="text-gold-400 font-medium text-sm mb-1">
                  {item.value}
                </p>
                <p className="text-brown-500 text-xs">{item.note}</p>
              </a>
            ))}
          </div>

          {/* מפת גוגל */}
          <div className="fade-in-up glass-effect rounded-2xl p-2 overflow-hidden">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d54166.53566525998!2d34.7437!3d31.9692!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1502b3f3a3c7f4c5%3A0x3a577c5f8b7f4c95!2z16jXkNep15XXnyDXnNem15nXldefLCDXmdep16jXkNec!5e0!3m2!1she!2sil!4v1700000000000!5m2!1she!2sil"
              className="w-full h-full min-h-[300px] rounded-xl border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="מיקום אלמוג ג׳אמילי ברבר שופ בראשון לציון"
              allowFullScreen
            />
          </div>
        </div>

        {/* כפתור וואטסאפ צף */}
        <div className="fixed bottom-6 left-6 z-50">
          <a
            href="https://wa.me/9720500000000?text=היי%20אלמוג%2C%20אשמח%20לקבוע%20תור"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center w-14 h-14 rounded-full bg-green-500 hover:bg-green-400 text-white shadow-xl hover:shadow-2xl hover:scale-110 transition-all duration-300"
            aria-label="שלחו הודעה בוואטסאפ"
          >
            <MessageCircle className="w-7 h-7" />
          </a>
        </div>
      </div>
    </section>
  );
}
