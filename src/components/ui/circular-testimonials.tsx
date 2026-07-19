"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi";

export interface Testimonial {
  quote: string;
  name: string;
  designation: string;
  src: string;
}

interface Colors {
  name: string;
  designation: string;
  testimony: string;
  arrowBackground: string;
  arrowForeground: string;
  arrowHoverBackground: string;
}

interface FontSizes {
  name: string;
  designation: string;
  quote: string;
}

interface CircularTestimonialsProps {
  testimonials: Testimonial[];
  autoplay?: boolean;
  colors?: Colors;
  fontSizes?: FontSizes;
}

function calculateGap(width: number): number {
  const minWidth = 1024;
  const maxWidth = 1456;
  const minGap = 60;
  const maxGap = 86;

  if (width <= minWidth) return minGap;
  if (width >= maxWidth)
    return Math.max(minGap, maxGap + 0.06018 * (width - maxWidth));

  return minGap + (maxGap - minGap) * ((width - minWidth) / (maxWidth - minWidth));
}

export function CircularTestimonials({
  testimonials,
  autoplay = true,
  colors = {
    name: "#f7f7ff",
    designation: "#e1e1e1",
    testimony: "#f1f1f7",
    arrowBackground: "#0582CA",
    arrowForeground: "#141414",
    arrowHoverBackground: "#f7f7ff",
  },
  fontSizes = {
    name: "28px",
    designation: "20px",
    quote: "20px",
  },
}: CircularTestimonialsProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [containerWidth, setContainerWidth] = useState(1024);
  const [isHovering, setIsHovering] = useState<"prev" | "next" | null>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);

  const gap = calculateGap(containerWidth);
  const maxStickUp = gap * 0.8;

  const handleNext = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % testimonials.length);
  }, [testimonials.length]);

  const handlePrev = useCallback(() => {
    setActiveIndex(
      (prev) => (prev - 1 + testimonials.length) % testimonials.length
    );
  }, [testimonials.length]);

  useEffect(() => {
    const container = imageContainerRef.current;
    if (!container) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width);
      }
    });

    observer.observe(container);
    setContainerWidth(container.offsetWidth);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!autoplay) return;

    const interval = setInterval(handleNext, 5000);
    return () => clearInterval(interval);
  }, [autoplay, handleNext]);

  const getImageStyles = (index: number) => {
    const offset =
      (index - activeIndex + testimonials.length) % testimonials.length;
    const zIndex = testimonials.length - Math.abs(offset);
    const isActive = index === activeIndex;
    const scale = isActive ? 1 : 0.85;

    let translateX = "0%";
    let translateY = "0%";
    let rotateY = 0;

    if (offset === 1 || offset === -2) {
      translateX = "20%";
      translateY = `-${(maxStickUp / 384) * 100}%`;
      rotateY = -15;
    } else if (offset === 2 || offset === -1) {
      translateX = "-20%";
      translateY = `-${(maxStickUp / 384) * 100}%`;
      rotateY = 15;
    }

    return {
      zIndex,
      opacity: isActive ? 1 : 1,
      scale,
      x: translateX,
      y: translateY,
      rotateY,
    };
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-8">
      <div className="flex flex-col md:grid md:grid-cols-[1fr_1.2fr] gap-10 md:gap-12 items-start">
        {/* Image Container */}
        <div
          ref={imageContainerRef}
          className="relative w-full h-80 md:h-96 overflow-hidden rounded-2xl"
          style={{ perspective: "1000px" }}
        >
          <AnimatePresence initial={false}>
            {testimonials.map((testimonial, index) => {
              const styles = getImageStyles(index);
              const isActive = index === activeIndex;

              return (
                <motion.img
                  key={testimonial.name}
                  src={testimonial.src}
                  alt={testimonial.name}
                  className="absolute inset-0 w-full h-full object-cover rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.2)]"
                  initial={false}
                  animate={{
                    zIndex: styles.zIndex,
                    opacity: styles.opacity,
                    scale: styles.scale,
                    x: styles.x,
                    y: styles.y,
                    rotateY: styles.rotateY,
                  }}
                  transition={{
                    duration: 0.8,
                    ease: [0.33, 1, 0.68, 1],
                  }}
                />
              );
            })}
          </AnimatePresence>
        </div>

        {/* Content */}
        <div className="flex flex-col justify-between w-full">
          <div className="pt-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeIndex}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >
                <div className="flex items-center gap-1 text-orange-500 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="h-4 w-4 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <h3
                  className="font-bold mb-1"
                  style={{
                    fontSize: fontSizes.name,
                    color: colors.name,
                  }}
                >
                  {testimonials[activeIndex].name}
                </h3>
                <p
                  className="mb-8"
                  style={{
                    fontSize: fontSizes.designation,
                    color: colors.designation,
                  }}
                >
                  {testimonials[activeIndex].designation}
                </p>
                <p
                  className="leading-relaxed"
                  style={{
                    fontSize: fontSizes.quote,
                    color: colors.testimony,
                  }}
                >
                  &ldquo;{testimonials[activeIndex].quote}&rdquo;
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Arrow Buttons */}
          <div className="flex gap-4 mt-8 md:mt-6">
            <button
              onClick={handlePrev}
              onMouseEnter={() => setIsHovering("prev")}
              onMouseLeave={() => setIsHovering(null)}
              className="w-7 h-7 rounded-full flex items-center justify-center transition-colors duration-300 cursor-pointer"
              style={{
                backgroundColor:
                  isHovering === "prev"
                    ? colors.arrowHoverBackground
                    : colors.arrowBackground,
              }}
              aria-label="Previous testimonial"
            >
              <HiChevronLeft
                className="w-5 h-5 transition-colors duration-300"
                style={{
                  color:
                    isHovering === "prev"
                      ? colors.arrowForeground
                      : colors.arrowForeground,
                }}
              />
            </button>
            <button
              onClick={handleNext}
              onMouseEnter={() => setIsHovering("next")}
              onMouseLeave={() => setIsHovering(null)}
              className="w-7 h-7 rounded-full flex items-center justify-center transition-colors duration-300 cursor-pointer"
              style={{
                backgroundColor:
                  isHovering === "next"
                    ? colors.arrowHoverBackground
                    : colors.arrowBackground,
              }}
              aria-label="Next testimonial"
            >
              <HiChevronRight
                className="w-5 h-5 transition-colors duration-300"
                style={{
                  color:
                    isHovering === "next"
                      ? colors.arrowForeground
                      : colors.arrowForeground,
                }}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
