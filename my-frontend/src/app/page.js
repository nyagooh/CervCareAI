export default function Home() {
  return (
    <main className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl font-bold text-text mb-4">
          Welcome to CervCare
        </h1>
        <p className="text-xl text-text-dark/80 mb-8">
          Advanced AI-powered healthcare management system
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button className="bg-button-gradient text-white font-semibold px-8 py-4 rounded-xl text-base shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 transform">
            Get Started
          </button>
          <button className="text-primary hover:text-secondary px-8 py-4 rounded-xl text-base hover:bg-white/50 transition-colors duration-200">
            Learn More
          </button>
        </div>
      </div>
    </main>
  );
}