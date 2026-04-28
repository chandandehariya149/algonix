import Navbar       from '../components/Navbar';
import Footer       from '../components/Footer';
import Hero         from '../sections/Hero';
import Features     from '../sections/Features';
import Modules      from '../sections/Modules';
import Testimonials from '../sections/Testimonials';
import Contact      from '../sections/Contact';
import '../styles/Home.css';

export default function Home() {
  return (
    <div className="page">
      <Navbar />
      <main>
        <Hero />
        <Features />
        <Modules />
        <Testimonials />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
