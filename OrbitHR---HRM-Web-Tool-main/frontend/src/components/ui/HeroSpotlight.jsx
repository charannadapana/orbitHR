import React, { useState, useRef, useEffect } from 'react';
import { motion, useSpring, useMotionValue } from 'framer-motion';

const HeroSpotlight = ({ children }) => {
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef(null);

  // Mouse coordinates
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth springs for high-end feel
  const springConfig = { damping: 25, stiffness: 200, mass: 0.5 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative cursor-none"
    >
      {/* The content that will be inverted */}
      <div className="relative z-10">
        {children}
      </div>

      {/* The Inversion Spotlight Overlay */}
      <motion.div
        className="pointer-events-none absolute top-0 left-0 w-48 h-48 bg-white rounded-full mix-blend-difference z-50 flex items-center justify-center"
        style={{
          x: smoothX,
          y: smoothY,
          translateX: '-50%',
          translateY: '-50%',
          scale: isHovered ? 1 : 0,
          opacity: isHovered ? 1 : 0,
        }}
        transition={{
          scale: { type: 'spring', damping: 20, stiffness: 150 },
          opacity: { duration: 0.3 }
        }}
      >
        {/* Optional: Add a small inner dot or ring for aesthetic */}
        <div className="w-2 h-2 bg-black rounded-full opacity-20" />
      </motion.div>
    </div>
  );
};

export default HeroSpotlight;
