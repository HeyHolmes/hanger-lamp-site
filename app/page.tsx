"use client";

import Image from "next/image";
import { useState, useRef, useCallback, useEffect } from "react";

const images = [
  { src: "/images/images_hires/_0.png", alt: "Hanger Lamp - 0" },
  { src: "/images/images_hires/_1.png", alt: "Hanger Lamp - 1" },
  { src: "/images/images_hires/_2.png", alt: "Hanger Lamp - 2" },
  { src: "/images/images_hires/_3.png", alt: "Hanger Lamp - 3" },
  { src: "/images/images_hires/_4.png", alt: "Hanger Lamp - 4" },
  { src: "/images/images_hires/_5.png", alt: "Hanger Lamp - 5" },
  { src: "/images/images_hires/_6.png", alt: "Hanger Lamp - 6" },
  { src: "/images/images_hires/_7.png", alt: "Hanger Lamp - 7" },
];

export default function Home() {
  const [activeImage, setActiveImage] = useState(images.length - 1); // Start at far right
  const [isDragging, setIsDragging] = useState(false);
  const [isOff, setIsOff] = useState(false);
  const [isAnimating, setIsAnimating] = useState(true);
  const [showSliderHint, setShowSliderHint] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);

  // Intro animation: step through each image with 0.45s per image
  useEffect(() => {
    if (!isAnimating) return;

    const timePerImage = 450;
    const startIndex = images.length - 1;
    let currentIndex = startIndex;

    const initialTimeout = setTimeout(() => {
      const interval = setInterval(() => {
        currentIndex--;
        if (currentIndex >= 0) {
          setActiveImage(currentIndex);
        }
        if (currentIndex <= 0) {
          clearInterval(interval);
          setIsAnimating(false);
          setShowSliderHint(true);
          setTimeout(() => setShowSliderHint(false), 3000);
        }
      }, timePerImage);
    }, 750);

    return () => clearTimeout(initialTimeout);
  }, [isAnimating]);

  // Vertical slider drag handler
  const handleDrag = useCallback((clientY: number) => {
    if (!trackRef.current) return;
    
    const track = trackRef.current;
    const rect = track.getBoundingClientRect();
    const y = clientY - rect.top;
    const percentage = Math.max(0, Math.min(1, y / rect.height));
    const imageIndex = Math.round(percentage * (images.length - 1));
    setActiveImage(imageIndex);
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isOff || isAnimating) return;
    setShowSliderHint(false);
    setIsDragging(true);
    handleDrag(e.clientY);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (isOff || isAnimating) return;
    setShowSliderHint(false);
    setIsDragging(true);
    handleDrag(e.touches[0].clientY);
  };

  const toggleLight = () => {
    setIsOff(!isOff);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        handleDrag(e.clientY);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (isDragging) {
        handleDrag(e.touches[0].clientY);
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
  const currentImage = isOff ? "/images/images_hires/_dark_on.png" : images[activeImage].src;
  const currentAlt = isOff ? "Hanger Lamp - Off" : images[activeImage].alt;
  const switchImage = isOff ? "/images/switch-down.png" : "/images/switch-up.png";

  return (
    <div className="min-h-screen font-sans select-none relative">
      {/* Full-screen background image */}
      <div className="fixed inset-0 z-0">
        <Image
          src={currentImage}
          alt={currentAlt}
          fill
          className="object-cover transition-opacity duration-300"
          priority
          sizes="100vw"
        />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center gap-16 px-12 py-8">
        <a 
          href="#" 
          className="text-xl font-medium tracking-wide border-b-2 border-black pb-0.5"
        >
          HL
        </a>
        <div className="flex items-center gap-12 text-lg tracking-wide">
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

      {/* Content overlay - Left side */}
      <div className="fixed left-12 top-1/2 -translate-y-1/2 z-10 max-w-xs">
        <h1 className="text-3xl font-normal tracking-tight mb-2">
          Hanger Lamp
        </h1>
        <p className="text-lg mb-4">$700</p>
        <p className="text-sm leading-relaxed mb-8 text-neutral-700">
          Crafted in America from solid teak and machined aluminum, this wall mounted sconce provides a warm glow while doubling as a functional hanger to dry your merino wool sweater. It's a piece that values your daily routine as much as your decor.
        </p>

        {/* CTA Button */}
        <button className="bg-[#c41e1e] text-white px-6 py-3 text-sm tracking-wide hover:bg-[#a31818] transition-colors mb-4">
          Batch 1: Sold out
        </button>

        {/* Newsletter signup link */}
        <a 
          href="#signup" 
          className="block text-sm underline hover:opacity-60 transition-opacity cursor-pointer"
        >
          Sign up for batch 2
        </a>
      </div>

      {/* Vertical Slider - Right side */}
      <div className="fixed right-24 top-1/2 -translate-y-1/2 z-10">
        {/* Slider hint */}
        {showSliderHint && (
          <div className="absolute -left-20 top-1/2 -translate-y-1/2 flex items-center gap-2 animate-pulse">
            <span className="text-xs text-neutral-600 whitespace-nowrap">Drag</span>
            <svg 
              className="w-3 h-3 text-neutral-600" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        )}
        
        <div 
          ref={trackRef}
          className={`relative w-12 h-64 transition-opacity duration-500 ${
            isOff ? "opacity-30 cursor-not-allowed" : "cursor-grab active:cursor-grabbing"
          }`}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
        >
          {/* Track line - vertical */}
          <div 
            className={`absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2 transition-colors duration-500 ${
              isOff ? "bg-neutral-500" : "bg-neutral-400"
            }`} 
          />
          
          {/* Draggable handle */}
          <div 
            className={`absolute left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-sm transition-all duration-300 ${
              isOff ? "bg-neutral-700" : "bg-[#c9a227] hover:scale-110"
            }`}
            style={{ top: `${sliderPosition}%` }}
          />
        </div>
      </div>

      {/* Switch - Bottom right with border */}
      <button 
        onClick={toggleLight}
        className="fixed bottom-12 right-24 z-50 w-16 h-20 border border-neutral-400 overflow-hidden transition-all duration-300 hover:scale-105 bg-white/50"
        aria-label={isOff ? "Turn light on" : "Turn light off"}
      >
        <Image
          src={switchImage}
          alt="Light switch"
          width={64}
          height={80}
          className="w-full h-full object-contain transition-all duration-500"
        />
      </button>

      {/* Footer Bar */}
      <div className="fixed bottom-0 left-0 right-0 h-12 bg-[#a8a49c] z-0" />
    </div>
  );
}
