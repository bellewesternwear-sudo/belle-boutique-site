import Header from "@/components/Header";
import Hero from "@/components/Hero";
import BestSellers from "@/components/BestSellers";
import StorySection from "@/components/StorySection";
import CollectionSection from "@/components/CollectionSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-16">
        <Hero />
        <BestSellers />
        <StorySection />
        <CollectionSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
