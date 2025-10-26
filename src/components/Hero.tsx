import heroModel from "@/assets/hero-model.jpg";

const Hero = () => {
  return (
    <section className="min-h-screen grid md:grid-cols-2">
      {/* Left Side - Brand Name */}
      <div 
        className="flex items-center justify-center p-8 md:p-16"
        style={{ background: 'var(--gradient-hero)' }}
      >
        <div className="text-center">
          <h1 className="text-6xl md:text-8xl lg:text-9xl font-bold text-primary-foreground tracking-[0.2em] mb-6">
            BELLE
          </h1>
          <p className="text-primary-foreground/80 text-lg md:text-xl tracking-wider">
            Western Wear for Women
          </p>
        </div>
      </div>
      
      {/* Right Side - Model Image */}
      <div className="relative overflow-hidden">
        <img 
          src={heroModel} 
          alt="BELLE Western Wear Collection"
          className="w-full h-full object-cover"
        />
      </div>
    </section>
  );
};

export default Hero;
