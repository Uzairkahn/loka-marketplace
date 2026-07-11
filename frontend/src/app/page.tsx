import Navbar from '@/components/landing/Navbar';
import Hero from '@/components/landing/Hero';
import MarketPulse from '@/components/landing/MarketPulse';
import Categories from '@/components/landing/Categories';
import HowItWorks from '@/components/landing/HowItWorks';
import Footer from '@/components/landing/Footer';

export default function HomePage() {
  return (
    <main>
      <Navbar />
      <Hero />
      <MarketPulse />
      <Categories />
      <HowItWorks />
      <Footer />
    </main>
  );
}
