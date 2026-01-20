import Header from "@/components/Header";
import Hero from "@/components/Hero";
import FeaturedProducts from "@/components/FeaturedProducts";
import BestSellers from "@/components/BestSellers";
import StorySection from "@/components/StorySection";
import CollectionSection from "@/components/CollectionSection";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-16">
        <Hero />
        <FeaturedProducts />
        <BestSellers />
        <StorySection />
        <CollectionSection />
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default Index;
