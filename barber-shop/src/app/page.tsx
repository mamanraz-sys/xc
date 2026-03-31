/* עמוד ראשי - אלמוג ג׳אמילי ברבר שופ */
/* מרכיב את כל הסקשנים לעמוד אחד מלא */
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Services from "@/components/Services";
import Gallery from "@/components/Gallery";
import Booking from "@/components/Booking";
import Testimonials from "@/components/Testimonials";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main>
      <Navbar />
      <Hero />
      <Services />
      <Gallery />
      <Booking />
      <Testimonials />
      <Contact />
      <Footer />
    </main>
  );
}
