"use client";

import Image from "next/image";
import { useState, useRef, useCallback, useEffect } from "react";

const images = [
  { src: "/images/DOWN_0.png", alt: "Hanger Lamp - Down 0" },
  { src: "/images/DOWN_-1.png", alt: "Hanger Lamp - Down -1" },
  { src: "/images/UP_0.png", alt: "Hanger Lamp - UP 0" },
  { src: "/images/UP_01.png", alt: "Hanger Lamp - UP 1" },
  { src: "/images/UP_02.png", alt: "Hanger Lamp - UP 2" },
  { src: "/images/UP_03.png", alt: "Hanger Lamp - UP 3" },
  { src: "/images/UP_04.png", alt: "Hanger Lamp - UP 4" },
  { src: "/images/UP_05.png", alt: "Hanger Lamp - UP 5" },
];

export default function Home() {
  const [activeImage, setActiveImage] = useState(images.length - 1); // Start at far right
  const [isDragging, setIsDragging] = useState(false);
  const [isOff, setIsOff] = useState(false);
  const [isAnimating, setIsAnimating] = useState(true);
  const [showSliderHint, setShowSliderHint] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);

  // Intro animation: step through each image with 0.45s per image (10% faster)
  useEffect(() => {
    if (!isAnimating) return;

    const timePerImage = 450; // 0.45 seconds per image (10% faster)
    const startIndex = images.length - 1;
    let currentIndex = startIndex;

    // Delay before starting animation so users can see the initial state
    const initialTimeout = setTimeout(() => {
      const interval = setInterval(() => {
        currentIndex--;
        if (currentIndex >= 0) {
          setActiveImage(currentIndex);
        }
        if (currentIndex <= 0) {
          clearInterval(interval);
          setIsAnimating(false);
          // Show the slider hint arrow after animation ends
          setShowSliderHint(true);
          // Hide the hint after 3 seconds
          setTimeout(() => setShowSliderHint(false), 3000);
        }
      }, timePerImage);
    }, 750);

    return () => clearTimeout(initialTimeout);
  }, [isAnimating]);

  const handleDrag = useCallback((clientX: number) => {
    if (!trackRef.current) return;
    
    const track = trackRef.current;
    const rect = track.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, x / rect.width));
    const imageIndex = Math.round(percentage * (images.length - 1));
    setActiveImage(imageIndex);
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isOff || isAnimating) return;
    setShowSliderHint(false); // Hide hint when user interacts
    setIsDragging(true);
    handleDrag(e.clientX);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (isOff || isAnimating) return;
    setShowSliderHint(false); // Hide hint when user interacts
    setIsDragging(true);
    handleDrag(e.touches[0].clientX);
  };

  const toggleLight = () => {
    setIsOff(!isOff);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        handleDrag(e.clientX);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (isDragging) {
        handleDrag(e.touches[0].clientX);
      }
    };

    const handleEnd = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleEnd);
      window.addEventListener("touchmove", handleTouchMove);
      window.addEventListener("touchend", handleEnd);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleEnd);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleEnd);
    };
  }, [isDragging, handleDrag]);

  const sliderPosition = (activeImage / (images.length - 1)) * 100;
  const currentImage = isOff ? "/images/DOWN_OFF.png" : images[activeImage].src;
  const currentAlt = isOff ? "Hanger Lamp - Off" : images[activeImage].alt;
  const switchImage = isOff ? "/images/switch-down.png" : "/images/switch-up.png";

  return (
    <div 
      className={`min-h-screen font-sans select-none transition-colors duration-500 ${
        isOff ? "bg-[#7F7D75] text-[#1a1a1a]" : "bg-[#d9d5cd] text-[#1a1a1a]"
      }`}
    >
      {/* Navigation - Hidden on mobile, visible on desktop */}
      <nav 
        className={`fixed top-0 left-0 right-0 z-50 hidden md:flex items-center gap-16 px-12 py-6 transition-colors duration-500 ${
          isOff ? "bg-[#7F7D75]" : "bg-[#d9d5cd]"
        }`}
      >
        <a 
          href="#" 
          className="text-xl font-medium tracking-wide border-b-2 border-black pb-0.5"
        >
          HL
        </a>
        <div className="flex items-center gap-12 text-base tracking-wide">
          <a href="#visuals" className="hover:opacity-60 transition-opacity">
            Visuals
          </a>
          <a href="#specs" className="hover:opacity-60 transition-opacity">
            Specs
          </a>
          <a href="#contact" className="hover:opacity-60 transition-opacity">
            Contact
          </a>
        </div>
      </nav>

      {/* Main Content - Stack on mobile, side-by-side on desktop */}
      <main className="flex flex-col md:flex-row min-h-screen">
        
        {/* Image Panel - First on mobile (top), second on desktop (right) */}
        <div 
          className={`w-full h-[50vh] md:w-1/2 md:h-screen md:sticky md:top-0 md:order-2 overflow-hidden transition-colors duration-500 ${
            isOff ? "bg-[#7F7D75]" : "bg-[#d9d5cd]"
          }`}
        >
          {/* Main product image */}
          <div className="relative w-full h-full">
            <Image
              src={currentImage}
              alt={currentAlt}
              fill
              className="object-contain transition-opacity duration-300"
              priority
            />
          </div>
        </div>

        {/* Content Panel - Second on mobile (below image), first on desktop (left) */}
        <div className="w-full md:w-1/2 flex flex-col justify-center px-6 py-10 md:px-16 md:py-24 md:pt-32 md:order-1">
          <div className="max-w-md mx-auto md:mx-0">
            <h1 className="text-3xl md:text-4xl font-normal tracking-tight mb-2 md:mb-3">
              Hanger Lamp
            </h1>
            <p className="text-lg md:text-xl mb-4 md:mb-6">$700</p>
            <p 
              className={`text-sm md:text-base leading-relaxed mb-8 md:mb-12 max-w-xs transition-colors duration-500 ${
                isOff ? "text-neutral-800" : "text-neutral-600"
              }`}
            >
              Crafted in America from solid teak and machined aluminum, this wall mounted sconce provides a warm glow while doubling as a functional hanger to dry your merino wool sweater. It's a piece that values your daily routine as much as your decor.
            </p>

            {/* Draggable Slider */}
            <div className="relative mb-10 md:mb-16">
              {/* Slider hint arrow */}
              {showSliderHint && (
                <div className="absolute -top-8 left-0 flex items-center gap-2 animate-pulse">
                  <span className="text-sm text-neutral-600">Drag to explore</span>
                  <svg 
                    className="w-4 h-4 text-neutral-600 animate-bounce" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </div>
              )}
              
              <div 
                ref={trackRef}
                className={`relative h-12 transition-opacity duration-500 ${
                  isOff ? "opacity-30 cursor-not-allowed" : "cursor-grab active:cursor-grabbing"
                }`}
                onMouseDown={handleMouseDown}
                onTouchStart={handleTouchStart}
              >
                {/* Track line */}
                <div 
                  className={`absolute top-1/2 left-0 right-0 h-px -translate-y-1/2 transition-colors duration-500 ${
                    isOff ? "bg-neutral-500" : "bg-neutral-400"
                  }`} 
                />
                
                {/* Draggable handle */}
                <div 
                  className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-8 rounded-sm transition-all duration-300 ${
                    isOff ? "bg-neutral-700" : "bg-black hover:scale-110"
                  }`}
                  style={{ left: `${sliderPosition}%` }}
                />
              </div>
            </div>

            {/* CTA Button */}
            <button className="w-full md:w-auto bg-[#c41e1e] text-white px-8 py-4 text-base tracking-wide hover:bg-[#a31818] transition-colors mb-4">
              Batch 1: Sold out
            </button>

            {/* Newsletter signup link */}
            <a 
              href="#signup" 
              className="block text-base underline hover:opacity-60 transition-opacity cursor-pointer"
            >
              Sign up for batch 2
            </a>
          </div>
        </div>
      </main>

      {/* Footer Bar */}
      <div 
        className={`h-12 md:h-16 transition-colors duration-500 ${
          isOff ? "bg-[#5a5852]" : "bg-[#a8a49c]"
        }`} 
      />

      {/* Fixed Switch - Always visible at bottom center */}
      <button 
        onClick={toggleLight}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[90px] h-[112px] md:w-[112px] md:h-[134px] overflow-hidden transition-all duration-300 hover:scale-105"
        aria-label={isOff ? "Turn light on" : "Turn light off"}
      >
        <Image
          src={switchImage}
          alt="Light switch"
          width={112}
          height={134}
          className="w-full h-full object-contain transition-all duration-500"
        />
      </button>
    </div>
  );
}
