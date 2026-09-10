import React from 'react';
import heroBg from '../../assets/about-aerial.png';

export default function BlogHeroSection() {
  return (
    <div className="relative min-h-[80vh] flex flex-col justify-end bg-gray-900 text-white overflow-hidden px-6 sm:px-12 md:px-16 pt-32 sm:pt-48 md:pt-56 pb-20 md:pb-28">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${heroBg})`,
        }}
      >
        <div className="absolute inset-0 bg-black/60 bg-linear-to-b from-black/50 via-black/40 to-black/80" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto w-full text-center flex flex-col items-center">
        <span className="text-xs sm:text-sm font-medium tracking-[0.2em] uppercase text-gray-300/80 mb-6">
          VENTURE INSIGHTS &amp; TECH GUIDES
        </span>

        <h1 className="text-4xl sm:text-6xl md:text-7xl font-serif font-bold tracking-tight text-white mb-8 leading-[1.05]">
          Knowledge on tap, <br />
          <span className="italic font-normal">grounded in science.</span>
        </h1>

        <p className="max-w-xl text-sm sm:text-base md:text-lg text-gray-300/90 font-normal leading-relaxed">
          Deep-dives into borehole drilling engineering, geophysical survey methodologies, well casing standards, and sustainable solar pumping systems across Zimbabwe.
        </p>
      </div>
    </div>
  );
}