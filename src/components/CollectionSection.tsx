import { Button } from "@/components/ui/button";
import collectionBanner from "@/assets/collection-banner.jpg";

const CollectionSection = () => {
  return (
    <section className="relative h-[600px] overflow-hidden">
      <img 
        src={collectionBanner}
        alt="BELLE Collection"
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-primary/60 to-primary/30 flex items-center justify-center">
        <div className="text-center text-primary-foreground px-4">
          <h2 className="text-5xl md:text-6xl font-bold mb-6">The Collection</h2>
          <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto">
            Discover timeless pieces crafted for the modern woman
          </p>
          <Button variant="accent" size="lg" className="text-lg px-8">
            Explore Collection
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CollectionSection;
