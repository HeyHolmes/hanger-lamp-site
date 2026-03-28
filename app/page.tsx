"use client";

import Image from "next/image";
import { useState, useRef, useCallback, useEffect } from "react";

const images = [
  { src: "/images/productshots/_0.webp", alt: "Hanger Lamp - 0" },
  { src: "/images/productshots/_1.webp", alt: "Hanger Lamp - 1" },
  { src: "/images/productshots/_2.webp", alt: "Hanger Lamp - 2" },
  { src: "/images/productshots/_3.webp", alt: "Hanger Lamp - 3" },
  { src: "/images/productshots/_4.webp", alt: "Hanger Lamp - 4" },
  { src: "/images/productshots/_5.webp", alt: "Hanger Lamp - 5" },
  { src: "/images/productshots/_7.webp", alt: "Hanger Lamp - 7" },
];

export default function Home() {
  const [activeImage, setActiveImage] = useState(images.length - 1);
  const [isDragging, setIsDragging] = useState(false);
  const [isOff, setIsOff] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showSliderHint, setShowSliderHint] = useState(false);
  const [isSwitchFixed, setIsSwitchFixed] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);
  const horizontalTrackRef = useRef<HTMLDivElement>(null);
  const heroSectionRef = useRef<HTMLElement>(null);
  const mobileSwitchRef = useRef<HTMLDivElement>(null);

  // Preload all product images via JS and start animation when all are decoded
  useEffect(() => {
    let cancelled = false;
    Promise.all(
      images.map((img) => {
        const i = new window.Image();
        i.src = img.src;
        return i.decode();
      })
    ).then(() => {
      if (!cancelled) setIsAnimating(true);
    });
    return () => { cancelled = true; };
  }, []);

  // Intro animation: start fully open, hold 2s, then close
  useEffect(() => {
    if (!isAnimating) return;

    const holdTime = 2000;
    const timePerImage = 360;
    let currentIndex = images.length - 1;

    const holdTimeout = setTimeout(() => {
      const interval = setInterval(() => {
        currentIndex--;
        if (currentIndex >= 0) {
          setActiveImage(currentIndex);
        }
        if (currentIndex <= 0) {
          clearInterval(interval);
          setIsAnimating(false);
        }
      }, timePerImage);
    }, holdTime);

    return () => clearTimeout(holdTimeout);
  }, [isAnimating]);

  // Vertical slider drag handler (desktop)
  const handleVerticalDrag = useCallback((clientY: number) => {
    if (!trackRef.current) return;
    const track = trackRef.current;
    const rect = track.getBoundingClientRect();
    const y = clientY - rect.top;
    const percentage = Math.max(0, Math.min(1, y / rect.height));
    const imageIndex = Math.round(percentage * (images.length - 1));
    setActiveImage(imageIndex);
  }, []);

  // Horizontal slider drag handler (mobile)
  const handleHorizontalDrag = useCallback((clientX: number) => {
    if (!horizontalTrackRef.current) return;
    const track = horizontalTrackRef.current;
    const rect = track.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, x / rect.width));
    const imageIndex = Math.round(percentage * (images.length - 1));
    setActiveImage(imageIndex);
  }, []);

  const handleMouseDown = (e: React.MouseEvent, isHorizontal: boolean) => {
    if (isOff || isAnimating) return;
    setShowSliderHint(false);
    setIsDragging(true);
    if (isHorizontal) {
      handleHorizontalDrag(e.clientX);
    } else {
      handleVerticalDrag(e.clientY);
    }
  };

  const handleTouchStart = (e: React.TouchEvent, isHorizontal: boolean) => {
    if (isOff || isAnimating) return;
    setShowSliderHint(false);
    setIsDragging(true);
    if (isHorizontal) {
      handleHorizontalDrag(e.touches[0].clientX);
    } else {
      handleVerticalDrag(e.touches[0].clientY);
    }
  };

  const toggleLight = () => {
    setIsOff(!isOff);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        // Check if we're on mobile (horizontal) or desktop (vertical)
        if (horizontalTrackRef.current) {
          const rect = horizontalTrackRef.current.getBoundingClientRect();
          if (e.clientY > rect.top - 50 && e.clientY < rect.bottom + 50) {
            handleHorizontalDrag(e.clientX);
            return;
          }
        }
        handleVerticalDrag(e.clientY);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (isDragging) {
        if (horizontalTrackRef.current) {
          const rect = horizontalTrackRef.current.getBoundingClientRect();
          if (e.touches[0].clientY > rect.top - 50 && e.touches[0].clientY < rect.bottom + 50) {
            handleHorizontalDrag(e.touches[0].clientX);
            return;
          }
        }
        handleVerticalDrag(e.touches[0].clientY);
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
  }, [isDragging, handleVerticalDrag, handleHorizontalDrag]);

  // Scroll-linked scrubber effect
  useEffect(() => {
    if (isAnimating || isOff || isDragging) return;

    const handleScroll = () => {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      
      // Scroll range: from 0 to 14% of window height for full scrub
      const scrollStart = 0;
      const scrollEnd = windowHeight * 0.14;
      
      // Calculate scroll progress (0 to 1)
      const scrollProgress = Math.max(0, Math.min(1, (scrollY - scrollStart) / (scrollEnd - scrollStart)));
      
      // Map to image index (0 to images.length - 1)
      const imageIndex = Math.round(scrollProgress * (images.length - 1));
      
      setActiveImage(imageIndex);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [isAnimating, isOff, isDragging]);

  // Mobile switch sticky behavior
  useEffect(() => {
    const handleSwitchPosition = () => {
      if (!mobileSwitchRef.current) return;
      
      const switchRect = mobileSwitchRef.current.getBoundingClientRect();
      const threshold = 16; // top-4 = 1rem = 16px
      
      // If the switch's natural position would be above the threshold, fix it
      if (switchRect.top <= threshold && !isSwitchFixed) {
        setIsSwitchFixed(true);
      }
      
      // Check if we should unfix - when scrolling back up
      // We need to check the original position of the switch container
      const scrollY = window.scrollY;
      const switchOriginalTop = mobileSwitchRef.current.offsetTop;
      
      if (scrollY < switchOriginalTop - threshold && isSwitchFixed) {
        setIsSwitchFixed(false);
      }
    };

    window.addEventListener("scroll", handleSwitchPosition, { passive: true });
    
    return () => {
      window.removeEventListener("scroll", handleSwitchPosition);
    };
  }, [isSwitchFixed]);

  const sliderPosition = (activeImage / (images.length - 1)) * 100;

  return (
    <div className="font-sans select-none bg-[#CCC5BD]">
      {/* ========== NAVIGATION ========== */}
      <nav className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between md:justify-start md:gap-16 px-4 md:px-12 py-4 md:py-8 transition-colors duration-500 ${
        isOff ? "text-neutral-200" : "text-black"
      }`}>
        <a 
          href="#" 
          className={`text-lg md:text-xl font-medium tracking-wide border-b-2 pb-0.5 transition-colors duration-500 ${
            isOff ? "border-neutral-200" : "border-black"
          }`}
        >
          HL
        </a>
        <div className="flex items-center gap-6 md:gap-12 text-sm md:text-lg tracking-wide">
          <a href="/images/HangerLamp_Spec_Sheet.pdf" download className="hover:opacity-60 transition-opacity">
            Spec PDF
          </a>
        </div>
      </nav>

      {/* ========== HERO SECTION ========== */}
      {/* Mobile Layout */}
      <section className={`md:hidden min-h-screen flex flex-col pt-14 transition-colors duration-500 ${
        isOff ? "bg-[#2a2a2a]" : "bg-[#CCC5BD]"
      }`}>
        {/* Product Image - Top */}
        <div className="relative w-full h-[48vh] flex-shrink-0 overflow-hidden">
          {images.map((img, i) => (
            <Image
              key={img.src}
              src={img.src}
              alt={img.alt}
              fill
              className={`object-cover object-center scale-125 ${
                !isOff && activeImage === i ? "opacity-100" : "opacity-0"
              }`}
              priority
              sizes="200vw"

            />
          ))}
          <Image
            src="/images/productshots/_dark_on.webp"
            alt="Hanger Lamp - Off"
            fill
            className={`object-cover object-center scale-125 ${
              isOff ? "opacity-100" : "opacity-0"
            }`}
            priority
            sizes="200vw"
          />
          {/* Gradient fade at bottom */}
          <div className={`absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t to-transparent z-10 transition-colors duration-500 ${
            isOff ? "from-[#2a2a2a]" : "from-[#CCC5BD]"
          }`} />
        </div>

        {/* Content Area */}
        <div className="flex-1 px-6 pt-4 pb-6">
          {/* Title */}
          <h1 className={`text-[36px] font-light tracking-tight leading-none mb-1 transition-colors duration-500 ${
            isOff ? "text-neutral-200" : "text-black"
          }`}>
            Hanger Lamp
          </h1>
          
          {/* Price */}
          <p className={`text-xl font-light mb-3 transition-colors duration-500 ${
            isOff ? "text-neutral-200" : "text-black"
          }`}>$700</p>
          
          {/* Description + Switch Row */}
          <div className="flex gap-3 mb-4">
            <p className={`flex-1 text-[15px] leading-relaxed transition-colors duration-500 ${
              isOff ? "text-neutral-300" : "text-neutral-700"
            }`}>
              teak and machined aluminum, this wall mounted sconce provides a warm glow while doubling as a functional hanger to dry your merino wool sweater. It's a piece that values your daily routine as much as your decor.
            </p>
            
            {/* Light Switch */}
            <div ref={mobileSwitchRef} className="flex-shrink-0">
              <button 
                onClick={toggleLight}
                className={`relative w-16 h-32 rounded-full transition-all duration-300 ${
                  isOff ? "bg-neutral-700" : "bg-neutral-300"
                }`}
                aria-label={isOff ? "Turn light on" : "Turn light off"}
              >
                <div 
                  className={`absolute w-12 h-12 rounded-full bg-white shadow-md transition-all duration-300 left-1/2 -translate-x-1/2 ${
                    isOff ? "top-2" : "bottom-2"
                  }`}
                />
              </button>
            </div>
          </div>

          {/* CTA Button */}
          <button className="w-full bg-black text-white px-6 py-4 text-base font-normal tracking-wide hover:bg-neutral-800 transition-colors mb-3">
            Batch 1: Sold out
          </button>

          {/* Newsletter signup link */}
          <a 
            href="#signup" 
            className={`block text-sm underline hover:opacity-60 transition-all cursor-pointer text-center ${
              isOff ? "text-neutral-300" : "text-black"
            }`}
          >
            Sign up for batch 2
          </a>
        </div>
      </section>

      {/* Desktop Layout */}
      <section className="hidden md:block relative h-screen">
        {/* Full-screen background image */}
        <div className="absolute inset-0 z-0">
          {images.map((img, i) => (
            <Image
              key={img.src}
              src={img.src}
              alt={img.alt}
              fill
              className={`object-cover ${
                !isOff && activeImage === i ? "opacity-100" : "opacity-0"
              }`}
              priority
              sizes="100vw"

            />
          ))}
          <Image
            src="/images/productshots/_dark_on.webp"
            alt="Hanger Lamp - Off"
            fill
            className={`object-cover ${
              isOff ? "opacity-100" : "opacity-0"
            }`}
            priority
            sizes="100vw"
          />
          {/* Gradient fade at bottom */}
          <div className={`absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t to-transparent z-10 transition-colors duration-500 ${
            isOff ? "from-[#2a2a2a]" : "from-[#CCC5BD]"
          }`} />
        </div>

        {/* Content overlay - Left side */}
        <div className={`absolute left-12 top-1/2 -translate-y-1/2 z-10 max-w-xs transition-colors duration-500 ${
          isOff ? "text-neutral-200" : "text-black"
        }`}>
          <h1 className="text-3xl font-normal tracking-tight mb-2">
            Hanger Lamp
          </h1>
          <p className="text-lg mb-4">$700</p>
          <p className={`text-sm leading-relaxed mb-8 transition-colors duration-500 ${
            isOff ? "text-neutral-300" : "text-neutral-700"
          }`}>
            Crafted in America from solid teak and machined aluminum, this wall mounted sconce provides a warm glow while doubling as a functional hanger to dry your merino wool sweater. It's a piece that values your daily routine as much as your decor.
          </p>

          <button className="bg-black text-white px-6 py-3 text-sm tracking-wide hover:bg-neutral-800 transition-colors mb-4">
            Batch 1: Sold out
          </button>

          <a 
            href="#signup" 
            className={`block text-sm underline hover:opacity-60 transition-all cursor-pointer mb-6 ${
              isOff ? "text-neutral-300" : "text-black"
            }`}
          >
            Sign up for batch 2
          </a>

          {/* Light Switch - Desktop */}
          <button 
            onClick={toggleLight}
            className={`relative w-16 h-32 rounded-full transition-all duration-300 ${
              isOff ? "bg-neutral-700" : "bg-neutral-300"
            }`}
            aria-label={isOff ? "Turn light on" : "Turn light off"}
          >
            <div 
              className={`absolute w-12 h-12 rounded-full bg-white shadow-md transition-all duration-300 left-1/2 -translate-x-1/2 ${
                isOff ? "top-2" : "bottom-2"
              }`}
            />
          </button>
        </div>

        {/* Vertical Slider - Desktop only */}
        <div className="absolute right-[22%] top-1/2 -translate-y-1/2 z-10">
          {showSliderHint && (
            <div className="absolute -left-16 top-1/2 -translate-y-1/2 flex items-center gap-2 animate-pulse">
              <span className={`text-xs whitespace-nowrap transition-colors duration-500 ${
                isOff ? "text-neutral-400" : "text-neutral-600"
              }`}>Drag</span>
            </div>
          )}
          
          <div 
            ref={trackRef}
            className={`relative w-8 h-72 transition-opacity duration-500 ${
              isOff ? "opacity-30 cursor-not-allowed" : "cursor-grab active:cursor-grabbing"
            }`}
            onMouseDown={(e) => handleMouseDown(e, false)}
            onTouchStart={(e) => handleTouchStart(e, false)}
          >
            <div 
              className={`absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2 transition-colors duration-500 ${
                isOff ? "bg-neutral-500" : "bg-black"
              }`} 
            />
            
            <div 
              className={`absolute left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-5 transition-all duration-300 ${
                isOff ? "bg-neutral-500" : "bg-[#b8a88a] hover:scale-110"
              }`}
              style={{ top: `${sliderPosition}%` }}
            />
          </div>
        </div>
      </section>

      {/* ========== MOOD BOARD / COLLAGE SECTION ========== */}
      <section id="visuals" className={`py-8 md:py-12 px-4 md:px-8 transition-colors duration-500 ${
        isOff ? "bg-[#2a2a2a]" : "bg-[#CCC5BD]"
      }`}>
        {/* Mobile: Single column / Desktop: 12-column grid */}
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-4 md:auto-rows-[200px]">
          
          {/* Large featured image */}
          <div className="md:col-span-8 md:row-span-2 relative overflow-hidden group h-64 md:h-auto">
            <Image
              src={isOff ? "/images/gallery/inside-lights-off.JPG" : "/images/gallery/inside-lots-of-clothes-top-shot.JPG"}
              alt="Hanger Lamp lifestyle"
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
          </div>

          {/* Materials text block */}
          <div className={`md:col-span-4 md:row-span-1 p-6 md:p-8 flex flex-col justify-center transition-colors duration-500 ${
            isOff ? "text-neutral-200" : "text-black"
          }`}>
            <h3 className={`text-sm font-medium tracking-widest mb-2 transition-colors duration-500 ${
              isOff ? "text-neutral-400" : "text-neutral-500"
            }`}>MATERIALS</h3>
            <p className="text-base md:text-lg font-light leading-relaxed">
              Teak<br />
              Stainless Steel Hardware<br />
              6061 Aluminum<br />
              Powder Coated
            </p>
          </div>

          {/* Small image */}
          <div className="md:col-span-4 md:row-span-1 relative overflow-hidden group h-48 md:h-auto">
            <Image
              src="/images/gallery/close-up-shade.JPG"
              alt="Hanger Lamp shade detail"
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
          </div>

          {/* Outdoor lifestyle image */}
          <div className="md:col-span-6 md:row-span-2 relative overflow-hidden h-64 md:h-auto group">
            <Image
              src="/images/gallery/outside-florida-surf.JPG"
              alt="Hanger Lamp outdoor surf"
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
          </div>

          {/* Specs text block */}
          <div id="specs" className={`md:col-span-3 md:row-span-2 p-6 md:p-8 flex flex-col justify-between transition-colors duration-500 ${
            isOff ? "text-neutral-200" : "text-black"
          }`}>
            <div>
              <h3 className={`text-sm font-medium tracking-widest mb-4 transition-colors duration-500 ${
                isOff ? "text-neutral-400" : "text-neutral-500"
              }`}>SPECIFICATIONS</h3>
              <div className="space-y-3 text-sm">
                <div className={`flex justify-between border-b pb-2 transition-colors duration-500 ${
                  isOff ? "border-neutral-700" : "border-neutral-300"
                }`}>
                  <span className={isOff ? "text-neutral-400" : "text-neutral-500"}>Width</span>
                  <span>36"</span>
                </div>
                <div className={`flex justify-between border-b pb-2 transition-colors duration-500 ${
                  isOff ? "border-neutral-700" : "border-neutral-300"
                }`}>
                  <span className={isOff ? "text-neutral-400" : "text-neutral-500"}>Height</span>
                  <span>14"</span>
                </div>
                <div className={`flex justify-between border-b pb-2 transition-colors duration-500 ${
                  isOff ? "border-neutral-700" : "border-neutral-300"
                }`}>
                  <span className={isOff ? "text-neutral-400" : "text-neutral-500"}>Depth</span>
                  <span>8"</span>
                </div>
                <div className={`flex justify-between border-b pb-2 transition-colors duration-500 ${
                  isOff ? "border-neutral-700" : "border-neutral-300"
                }`}>
                  <span className={isOff ? "text-neutral-400" : "text-neutral-500"}>Weight</span>
                  <span>4.2 lbs</span>
                </div>
                <div className="flex justify-between">
                  <span className={isOff ? "text-neutral-400" : "text-neutral-500"}>Bulb</span>
                  <span>E26 LED</span>
                </div>
              </div>
            </div>
            <p className={`text-xs mt-4 transition-colors duration-500 ${
              isOff ? "text-neutral-400" : "text-neutral-500"
            }`}>
              UL Listed. Dimmable with compatible switch.
            </p>
          </div>

          {/* Medium image */}
          <div className="md:col-span-3 md:row-span-2 relative overflow-hidden group h-64 md:h-auto">
            <Image
              src={isOff ? "/images/gallery/lights-off-push.JPG" : "/images/gallery/outside-fins-sauna.png"}
              alt="Hanger Lamp in use"
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
          </div>

          {/* Quote block */}
          <div className={`md:col-span-4 md:row-span-1 p-6 md:p-8 flex items-center transition-colors duration-500 ${
            isOff ? "text-neutral-200" : "text-black"
          }`}>
            <p className="text-base md:text-lg italic font-light">
              "Form follows function—but here, they dance together."
            </p>
          </div>

          {/* Close-up image */}
          <div className="md:col-span-4 md:row-span-2 relative overflow-hidden group h-64 md:h-auto">
            <Image
              src="/images/gallery/close-up-handle.JPG"
              alt="Hanger Lamp handle close-up"
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
          </div>

          {/* Care text block */}
          <div className={`md:col-span-4 md:row-span-1 p-6 md:p-8 flex flex-col justify-center transition-colors duration-500 ${
            isOff ? "text-neutral-200" : "text-black"
          }`}>
            <h3 className={`text-sm font-medium tracking-widest mb-2 transition-colors duration-500 ${
              isOff ? "text-neutral-400" : "text-neutral-500"
            }`}>CARE</h3>
            <p className={`text-sm leading-relaxed transition-colors duration-500 ${
              isOff ? "text-neutral-300" : "text-neutral-600"
            }`}>
              Wipe with a soft, dry cloth. The teak will patina naturally over time, developing a rich silver-grey character if left untreated.
            </p>
          </div>

          {/* Large final image */}
          <div className="md:col-span-8 md:row-span-2 relative overflow-hidden group h-64 md:h-auto">
            <Image
              src="/images/gallery/outside-snow-mammoth.JPG"
              alt="Hanger Lamp in snow environment"
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
          </div>

          {/* Final CTA block */}
          <div className="md:col-span-4 md:row-span-2 p-6 md:p-8 flex flex-col justify-center items-start bg-[#1a1a1a] text-white">
            <h3 className="text-xl md:text-2xl font-light mb-4">Ready to hang?</h3>
            <p className="text-neutral-400 text-sm mb-6">
              Batch 2 ships Spring 2026. Join the waitlist to be first in line.
            </p>
            <button className={`w-full md:w-auto px-6 py-3 text-sm tracking-wide transition-colors ${
              isOff ? "bg-neutral-600 text-white hover:bg-neutral-500" : "bg-white text-black hover:bg-neutral-200"
            }`}>
              Join Waitlist
            </button>
          </div>

        </div>
      </section>

      {/* ========== BATCH 2 SIGNUP SECTION ========== */}
      <section id="signup" className={`py-16 md:py-24 px-4 md:px-8 transition-colors duration-500 ${
        isOff ? "bg-[#1a1a1a]" : "bg-[#CCC5BD]"
      }`}>
        <div className="max-w-xl mx-auto text-center">
          <h2 className={`text-2xl md:text-3xl font-light mb-3 transition-colors duration-500 ${
            isOff ? "text-neutral-200" : "text-black"
          }`}>
            Batch 2 — Spring 2026
          </h2>
          <p className={`text-sm md:text-base leading-relaxed mb-8 transition-colors duration-500 ${
            isOff ? "text-neutral-400" : "text-neutral-600"
          }`}>
            Batch 1 sold out. Drop your email to be first in line for the next run.
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const form = e.target as HTMLFormElement;
              const email = (form.elements.namedItem("email") as HTMLInputElement).value;
              // TODO: Connect to Mailchimp, ConvertKit, or Google Sheets
              console.log("Signup email:", email);
              form.reset();
              alert("You're on the list. We'll be in touch.");
            }}
            className="flex flex-col sm:flex-row gap-3"
          >
            <input
              type="email"
              name="email"
              required
              placeholder="your@email.com"
              className={`flex-1 px-4 py-3 text-sm border transition-colors duration-500 focus:outline-none focus:ring-1 ${
                isOff
                  ? "bg-neutral-800 border-neutral-700 text-white placeholder-neutral-500 focus:ring-neutral-500"
                  : "bg-white border-neutral-300 text-black placeholder-neutral-400 focus:ring-black"
              }`}
            />
            <button
              type="submit"
              className={`px-6 py-3 text-sm tracking-wide transition-colors ${
                isOff
                  ? "bg-white text-black hover:bg-neutral-200"
                  : "bg-black text-white hover:bg-neutral-800"
              }`}
            >
              Join Waitlist
            </button>
          </form>
          <p className={`text-xs mt-4 transition-colors duration-500 ${
            isOff ? "text-neutral-600" : "text-neutral-400"
          }`}>
            No spam. Just a heads up when Batch 2 drops.
          </p>
        </div>
      </section>

      {/* ========== FOOTER ========== */}
      <footer id="contact" className="bg-[#1a1a1a] text-white py-12 md:py-16 px-4 md:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          <div>
            <h4 className="text-xl font-medium mb-4">Hanger Lamp</h4>
            <p className="text-neutral-400 text-sm leading-relaxed">
              Designed in Brooklyn, NY.<br />
              Manufactured in the USA.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-medium tracking-widest text-neutral-500 mb-4">CONTACT</h4>
            <p className="text-neutral-400 text-sm">
              hello@hangerlamp.com<br />
              @hangerlamp
            </p>
          </div>
          <div>
            <h4 className="text-sm font-medium tracking-widest text-neutral-500 mb-4">LINKS</h4>
            <div className="space-y-2 text-sm">
              <a href="#" className="block text-neutral-400 hover:text-white transition-colors">FAQ</a>
              <a href="#" className="block text-neutral-400 hover:text-white transition-colors">Shipping & Returns</a>
              <a href="#" className="block text-neutral-400 hover:text-white transition-colors">Terms & Conditions</a>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-8 md:mt-12 pt-6 md:pt-8 border-t border-neutral-800 text-neutral-500 text-xs">
          © 2026 Hanger Lamp. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
