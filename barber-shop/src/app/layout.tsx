import type { Metadata } from "next";
import "./globals.css";

/* מטא-דאטה לקידום אורגני */
export const metadata: Metadata = {
  title: "אלמוג ג׳אמילי ברבר שופ | מספרה לגברים בראשון לציון",
  description:
    "מספרת הגברים המובילה בראשון לציון. תספורות גברים, עיצוב זקן, וטיפולי פרימיום. קבעו תור עכשיו!",
  keywords: [
    "מספרה ראשון לציון",
    "ברבר שופ",
    "תספורת גברים",
    "אלמוג ג׳אמילי",
    "עיצוב זקן",
    "מספרה לגברים",
  ],
  openGraph: {
    title: "אלמוג ג׳אמילי ברבר שופ",
    description: "מספרת הגברים המובילה בראשון לציון",
    locale: "he_IL",
    type: "website",
  },
};

/* לייאאוט ראשי - RTL עם פונטים עבריים */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="he" dir="rtl">
      <body className="font-heebo antialiased">{children}</body>
    </html>
  );
}
