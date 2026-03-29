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
  const [showSignup, setShowSignup] = useState(false);
  const [signupSubmitted, setSignupSubmitted] = useState(false);
  const [signupLoading, setSignupLoading] = useState(false);
  const [waitlistNumber, setWaitlistNumber] = useState(175);
  const [scrollPos, setScrollPos] = useState(0);
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

  // Track scroll position for marquee
  useEffect(() => {
    const handleScroll = () => setScrollPos(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const marqueeItems = Array.from({ length: 12 }, (_, i) => i);

  return (
    <div className="font-sans select-none bg-[#CCC5BD]">
      {/* ========== SCROLLING MARQUEE BANNER ========== */}
      <div className={`fixed top-0 left-0 right-0 z-50 overflow-hidden py-2.5 transition-colors duration-500 ${
        isOff ? "bg-[#2a2a2a]/80 backdrop-blur-sm" : "bg-[#CCC5BD]/80 backdrop-blur-sm"
      }`}>
        <div
          className="flex items-center gap-8 whitespace-nowrap"
          style={{ transform: `translateX(${-scrollPos * 0.3}px)` }}
        >
          {marqueeItems.map((i) => (
            <div key={i} className="flex items-center gap-8 shrink-0">
              <span className={`text-lg font-heading font-light tracking-wide transition-colors duration-500 ${
                isOff ? "text-neutral-200" : "text-black"
              }`}>Hanger Lamp</span>
              <svg width="814" height="458" viewBox="126 103 562 252" fill="none" xmlns="http://www.w3.org/2000/svg" className={`w-10 h-auto transition-colors duration-500 ${isOff ? "text-neutral-200" : "text-black"}`}>
                <path d="M301.661 319.368H322.122V307.895C322.122 305.031 321.344 302.228 319.864 299.776L301.661 269.597V319.368Z" fill="currentColor"/>
                <path d="M129.784 334.514C127.694 334.514 126 336.21 126 338.303V351.204C126 353.297 127.694 354.992 129.784 354.992H364.927V334.507H129.784V334.514Z" fill="currentColor"/>
                <path d="M381.131 259.179L383.991 243.749H315.668L218.21 146.171C216.73 144.689 214.334 144.689 212.854 146.171L203.745 155.291C202.265 156.773 202.265 159.171 203.745 160.653L367.307 324.417L381.771 309.935L336.121 264.227H375.05C378.026 264.227 380.581 262.104 381.123 259.171L381.131 259.179Z" fill="currentColor"/>
                <path d="M684.216 334.514H449.035V355H684.216C686.306 355 688 353.304 688 351.211V338.31C688 336.218 686.306 334.522 684.216 334.522V334.514Z" fill="currentColor"/>
                <path d="M491.878 319.368H512.339V269.521L494.136 299.699C492.656 302.151 491.878 304.954 491.878 307.819V319.368Z" fill="currentColor"/>
                <path d="M417.23 106.789C417.23 104.696 415.537 103 413.446 103H400.561C398.471 103 396.777 104.696 396.777 106.789V307.001H417.238V106.789H417.23Z" fill="currentColor"/>
                <path d="M610.255 160.653C611.735 159.171 611.735 156.773 610.255 155.291L601.146 146.171C599.666 144.689 597.27 144.689 595.79 146.171L498.332 243.749H430.077L432.938 259.179C433.48 262.112 436.035 264.235 439.01 264.235H477.864L432.213 309.942L446.677 324.424L610.239 160.661L610.255 160.653Z" fill="currentColor"/>
              </svg>
            </div>
          ))}
        </div>
      </div>


      {/* ========== HERO SECTION ========== */}
      {/* Mobile Layout */}
      <section className={`md:hidden flex flex-col pt-10 transition-colors duration-500 ${
        isOff ? "bg-[#2a2a2a]" : "bg-[#CCC5BD]"
      }`}>
        {/* Content Area - Text First, centered on first screen */}
        <div className="px-6 min-h-[calc(100vh-40px)] flex flex-col justify-center pb-8">
          <h1 className={`text-[36px] font-light tracking-tight leading-none mb-2 transition-colors duration-500 ${
            isOff ? "text-neutral-200" : "text-black"
          }`}>
            Hanger Lamp
          </h1>
          <p className={`text-base italic mb-3 transition-colors duration-500 ${
            isOff ? "text-neutral-400" : "text-neutral-600"
          }`}>A clothing rack that&apos;s lit.</p>

          <p className={`text-[15px] leading-relaxed mb-4 transition-colors duration-500 ${
            isOff ? "text-neutral-300" : "text-neutral-700"
          }`}>
            Crafted in America from solid teak and machined aluminum, this wall mounted sconce provides a warm glow while doubling as a functional hanger. A piece that values your daily routine as much as your decor.
          </p>

        </div>

        {/* Product Image */}
        <div className="relative w-full h-[55vh] overflow-hidden">
          {images.map((img, i) => (
            <Image
              key={img.src}
              src={img.src}
              alt={img.alt}
              fill
              unoptimized
              className={`object-cover object-center scale-[1.2] ${
                !isOff && activeImage === i ? "opacity-100" : "opacity-0"
              }`}
              priority
            />
          ))}
          <Image
            src="/images/productshots/_dark_on.webp"
            alt="Hanger Lamp - Off"
            fill
            unoptimized
            className={`object-cover object-center scale-[1.2] ${
              isOff ? "opacity-100" : "opacity-0"
            }`}
            priority
          />
          {/* Gradient fade at top */}
          <div className={`absolute top-0 left-0 right-0 h-32 bg-gradient-to-b to-transparent z-10 transition-colors duration-500 ${
            isOff ? "from-[#2a2a2a]" : "from-[#CCC5BD]"
          }`} />
          {/* Gradient fade at bottom */}
          <div className={`absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t to-transparent z-10 transition-colors duration-500 ${
            isOff ? "from-[#2a2a2a]" : "from-[#CCC5BD]"
          }`} />
          {/* Light Switch */}
          <div ref={mobileSwitchRef} className="absolute bottom-6 right-6 z-20">
            <button
              onClick={toggleLight}
              className={`relative w-14 h-28 rounded-full transition-all duration-300 ${
                isOff ? "bg-neutral-700" : "bg-neutral-300/80"
              }`}
              aria-label={isOff ? "Turn light on" : "Turn light off"}
            >
              <div
                className={`absolute w-10 h-10 rounded-full bg-white shadow-md transition-all duration-300 left-1/2 -translate-x-1/2 ${
                  isOff ? "top-2" : "bottom-2"
                }`}
              />
            </button>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="px-6 py-5">
          <button disabled className="w-full bg-neutral-400 text-white px-6 py-4 text-base font-normal tracking-wide cursor-not-allowed mb-3">
            Batch 1: Sold out
          </button>

          <button
            onClick={() => setShowSignup(true)}
            className="w-full bg-black text-white px-6 py-4 text-base font-normal tracking-wide hover:bg-neutral-800 transition-colors"
          >
            Sign up for batch 2
          </button>
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
              unoptimized
              className={`object-cover ${
                !isOff && activeImage === i ? "opacity-100" : "opacity-0"
              }`}
              priority
            />
          ))}
          <Image
            src="/images/productshots/_dark_on.webp"
            alt="Hanger Lamp - Off"
            fill
            unoptimized
            className={`object-cover ${
              isOff ? "opacity-100" : "opacity-0"
            }`}
            priority
          />
          {/* Gradient fade at bottom */}
          <div className={`absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t to-transparent z-10 transition-colors duration-500 ${
            isOff ? "from-[#2a2a2a]" : "from-[#CCC5BD]"
          }`} />
        </div>

        {/* Content overlay - Left side */}
        <div className={`absolute left-12 top-1/2 -translate-y-1/2 z-10 max-w-sm transition-colors duration-500 ${
          isOff ? "text-neutral-200" : "text-black"
        }`}>
          <h1 className="text-4xl font-normal tracking-tight mb-2">
            Hanger Lamp
          </h1>
          <p className={`text-base italic mb-4 transition-colors duration-500 ${
            isOff ? "text-neutral-400" : "text-neutral-600"
          }`}>A clothing rack that&apos;s lit.</p>
          <p className={`text-[15px] leading-relaxed mb-8 transition-colors duration-500 ${
            isOff ? "text-neutral-300" : "text-neutral-600"
          }`}>
            Crafted in America from solid teak and machined aluminum, this wall mounted sconce provides a warm glow while doubling as a functional hanger to dry your merino wool sweater. It's a piece that values your daily routine as much as your decor.
          </p>

          <button disabled className="w-full bg-neutral-400 text-white px-6 py-3 text-sm tracking-wide cursor-not-allowed mb-3">
            Batch 1: Sold out
          </button>

          <button
            onClick={() => setShowSignup(true)}
            className="w-full bg-black text-white px-6 py-3 text-sm tracking-wide hover:bg-neutral-800 transition-colors mb-6"
          >
            Sign up for batch 2
          </button>

          {/* Light Switch - Desktop */}
          <button
            onClick={toggleLight}
            className={`relative w-16 h-32 rounded-[30px] transition-all duration-300 ${
              isOff ? "bg-neutral-700" : "bg-neutral-800"
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
                  <span>46-1/2"</span>
                </div>
                <div className={`flex justify-between border-b pb-2 transition-colors duration-500 ${
                  isOff ? "border-neutral-700" : "border-neutral-300"
                }`}>
                  <span className={isOff ? "text-neutral-400" : "text-neutral-500"}>Height</span>
                  <span>34-1/2"</span>
                </div>
                <div className={`flex justify-between border-b pb-2 transition-colors duration-500 ${
                  isOff ? "border-neutral-700" : "border-neutral-300"
                }`}>
                  <span className={isOff ? "text-neutral-400" : "text-neutral-500"}>Depth</span>
                  <span>6-1/4"</span>
                </div>
                <div className={`flex justify-between border-b pb-2 transition-colors duration-500 ${
                  isOff ? "border-neutral-700" : "border-neutral-300"
                }`}>
                  <span className={isOff ? "text-neutral-400" : "text-neutral-500"}>Weight</span>
                  <span>12.43 lbs</span>
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
            <blockquote className="border-l-2 border-current pl-4 md:pl-5">
              <p className="text-base md:text-lg italic font-light leading-relaxed">
                Form follows function — but here, they dance together.
              </p>
            </blockquote>
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
            <button
              onClick={() => setShowSignup(true)}
              className={`w-full md:w-auto px-6 py-3 text-sm tracking-wide transition-colors ${
                isOff ? "bg-neutral-600 text-white hover:bg-neutral-500" : "bg-white text-black hover:bg-neutral-200"
              }`}
            >
              Join Waitlist
            </button>
          </div>

        </div>
      </section>

      {/* ========== BATCH 2 SIGNUP SECTION ========== */}
      <section id="signup" className={`py-20 md:py-28 px-4 md:px-8 transition-colors duration-500 ${
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
          <button
            onClick={() => setShowSignup(true)}
            className={`px-8 py-3 text-sm tracking-wide transition-colors ${
              isOff
                ? "bg-white text-black hover:bg-neutral-200"
                : "bg-black text-white hover:bg-neutral-800"
            }`}
          >
            Join Waitlist
          </button>
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
              <a href="/images/HangerLamp_Spec_Sheet.pdf" download className="block text-neutral-400 hover:text-white transition-colors">Download Spec PDF</a>
              <a href="#" className="block text-neutral-400 hover:text-white transition-colors">FAQ</a>
              <a href="#" className="block text-neutral-400 hover:text-white transition-colors">Shipping & Returns</a>
              <a href="#" className="block text-neutral-400 hover:text-white transition-colors">Terms & Conditions</a>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-8 md:mt-12 pt-6 md:pt-8 border-t border-neutral-800 text-neutral-500 text-xs tracking-wide">
          © 2026 Hanger Lamp. All rights reserved.
        </div>
      </footer>
      {/* ========== SIGNUP MODAL ========== */}
      {showSignup && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 px-4"
          onClick={(e) => { if (e.target === e.currentTarget) setShowSignup(false); }}
        >
          <div className="bg-[#f5f3f0] w-full max-w-md p-8 relative">
            <button
              onClick={() => setShowSignup(false)}
              className="absolute top-4 right-4 text-neutral-500 hover:text-black text-xl leading-none"
              aria-label="Close"
            >
              &times;
            </button>

            {signupSubmitted ? (
              <div className="text-center py-8">
                <h3 className="text-2xl font-light mb-3">You&apos;re on the list.</h3>
                <p className="text-3xl font-light mb-3">#{waitlistNumber}</p>
                <p className="text-neutral-600 text-sm">We&apos;ll reach out when Batch 2 is ready. Thanks for your interest.</p>
              </div>
            ) : (
              <>
                <h3 className="text-2xl font-light mb-2">Join the Batch 2 Waitlist</h3>
                <p className="text-neutral-600 text-sm mb-6">
                  Tell us a bit about yourself so we can keep you in the loop.
                </p>
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    setSignupLoading(true);
                    const form = e.target as HTMLFormElement;
                    const data = {
                      email: (form.elements.namedItem("email") as HTMLInputElement).value,
                      name: (form.elements.namedItem("name") as HTMLInputElement).value,
                      location: (form.elements.namedItem("location") as HTMLInputElement).value,
                      room: (form.elements.namedItem("room") as HTMLSelectElement).value,
                    };
                    try {
                      const scriptUrl = "https://script.google.com/macros/s/AKfycbxf5yH-0G9yWle8JOMSEe5ZLPhaBbpSJEsXqNxPbn748PoMp62QQKabo9ZBWAfCziBb/exec";
                      const params = new URLSearchParams(data);
                      await fetch(`${scriptUrl}?${params.toString()}`, {
                        method: "GET",
                        mode: "no-cors",
                      });
                    } catch {
                      // Silently fail — we still show confirmation
                    }
                    setSignupLoading(false);
                    setWaitlistNumber((n) => n + 1);
                    setSignupSubmitted(true);
                  }}
                  className="space-y-4"
                >
                  <div>
                    <label htmlFor="signup-name" className="block text-xs tracking-widest text-neutral-500 mb-1">NAME</label>
                    <input
                      id="signup-name"
                      type="text"
                      name="name"
                      required
                      placeholder="First name"
                      className="w-full px-4 py-3 text-sm border border-neutral-300 bg-white text-black placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-black"
                    />
                  </div>
                  <div>
                    <label htmlFor="signup-email" className="block text-xs tracking-widest text-neutral-500 mb-1">EMAIL</label>
                    <input
                      id="signup-email"
                      type="email"
                      name="email"
                      required
                      placeholder="your@email.com"
                      className="w-full px-4 py-3 text-sm border border-neutral-300 bg-white text-black placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-black"
                    />
                  </div>
                  <div>
                    <label htmlFor="signup-location" className="block text-xs tracking-widest text-neutral-500 mb-1">WHERE ARE YOU BASED?</label>
                    <input
                      id="signup-location"
                      type="text"
                      name="location"
                      placeholder="City, State"
                      className="w-full px-4 py-3 text-sm border border-neutral-300 bg-white text-black placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-black"
                    />
                  </div>
                  <div>
                    <label htmlFor="signup-room" className="block text-xs tracking-widest text-neutral-500 mb-1">WHERE WILL IT LIVE?</label>
                    <select
                      id="signup-room"
                      name="room"
                      className="w-full px-4 py-3 text-sm border border-neutral-300 bg-white text-black focus:outline-none focus:ring-1 focus:ring-black appearance-none"
                    >
                      <option value="">Select a room</option>
                      <option value="Bedroom">Bedroom</option>
                      <option value="Entryway">Entryway</option>
                      <option value="Bathroom">Bathroom</option>
                      <option value="Home Office">Home Office</option>
                      <option value="Living Room">Living Room</option>
                      <option value="Hospitality">Hospitality / Commercial</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <button
                    type="submit"
                    disabled={signupLoading}
                    className="w-full bg-black text-white px-6 py-3 text-sm tracking-wide hover:bg-neutral-800 transition-colors disabled:bg-neutral-400 disabled:cursor-not-allowed"
                  >
                    {signupLoading ? "Submitting..." : "Count me in"}
                  </button>
                  <p className="text-xs text-neutral-400 text-center">
                    No spam. Just a heads up when Batch 2 drops.
                  </p>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
