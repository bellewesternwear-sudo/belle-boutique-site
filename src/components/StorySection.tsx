import { Button } from "@/components/ui/button";
import storyBanner from "@/assets/story-banner.jpg";

const StorySection = () => {
  return (
    <section className="relative h-[600px] overflow-hidden">
      <img 
        src={storyBanner}
        alt="BELLE Story"
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-primary/20 flex items-center justify-center">
        <div className="text-center text-primary-foreground px-4">
          <h2 className="text-5xl md:text-6xl font-bold mb-6">Our Story</h2>
          <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto">
            Where Western heritage meets modern elegance
          </p>
          <Button variant="accent" size="lg" className="text-lg px-8">
            Learn More
          </Button>
        </div>
      </div>
    </section>
  );
};

export default StorySection;
