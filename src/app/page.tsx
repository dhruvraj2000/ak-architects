import Header from "@/components/Header";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Visualizer from "@/components/visualizer/Visualizer";
import Projects from "@/components/Projects";
import Compare from "@/components/Compare";
import Services from "@/components/Services";
import Process from "@/components/Process";
import Testimonials from "@/components/Testimonials";
import InstagramCTA from "@/components/InstagramCTA";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <Header />
      <main className="flex-1">
        <Hero />
        <About />
        <Visualizer />
        <Projects />
        <Compare />
        <Services />
        <Process />
        <Testimonials />
        <InstagramCTA />
        <Contact />
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}
