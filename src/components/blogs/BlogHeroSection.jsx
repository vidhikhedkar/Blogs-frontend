import React from 'react';
import heroBg from '../assets/about-aerial.png';

export default function BlogHeroSection() {
  return (
    <div className="relative min-h-screen flex flex-col justify-between bg-gray-900 text-white overflow-hidden px-8 sm:px-16 md:px-24 py-16">
      
      {/* Background Image Container with Dark Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${heroBg})`,
        }}
      >
        {/* Dark warm overlay */}
        <div className="absolute inset-0 bg-black/55 bg-gradient-to-b from-black/40 via-transparent to-black/80"></div>
      </div>

      {/* Main Hero Content - Left Aligned */}
      <div className="relative z-10 max-w-4xl my-auto text-left flex flex-col items-start pt-12">
        {/* Subtitle / Category Label */}
        <span className="text-xs sm:text-sm font-medium tracking-[0.2em] uppercase text-gray-300/80 mb-6">
          VENTURE INSIGHTS & TECH GUIDES
        </span>

        {/* Main Headline */}
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-serif font-bold tracking-tight text-white mb-8 leading-[1.05]">
          Knowledge on tap, <br />
          <span className="italic">grounded in science.</span>
        </h1>

        {/* Description Paragraph */}
        <p className="max-w-xl text-sm sm:text-base md:text-lg text-gray-300/80 font-normal leading-relaxed">
          Deep-dives into borehole drilling engineering, geophysical survey methodologies, well casing standards, and sustainable solar pumping systems across Zimbabwe.
        </p>
      </div>

      {/* Scroll Indicator */}
      <div className="relative z-10 flex flex-col items-center justify-center space-y-2 cursor-pointer group mx-auto pb-4">
        <div className="w-[1px] h-8 bg-gray-400/50 group-hover:bg-white transition-colors duration-300"></div>
        <span className="text-[10px] tracking-[0.3em] uppercase text-gray-400/70 group-hover:text-white transition-colors duration-300 font-light">
          SCROLL
        </span>
      </div>

    </div>
  );
}