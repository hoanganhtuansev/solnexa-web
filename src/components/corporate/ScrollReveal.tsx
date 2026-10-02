import React, { useEffect, useRef, useState } from 'react';

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'text' | 'image' | 'fade';
  delayMs?: number;
}

export const ScrollReveal: React.FC<ScrollRevealProps> = ({
  children,
  className = '',
  variant = 'text',
  delayMs = 0
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const domRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Check prefers-reduced-motion
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            if (domRef.current) {
              observer.unobserve(domRef.current);
            }
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: '0px 0px -60px 0px'
      }
    );

    const currentRef = domRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) observer.unobserve(currentRef);
    };
  }, []);

  const getVariantStyles = () => {
    if (variant === 'image') {
      return isVisible
        ? 'opacity-100 scale-100'
        : 'opacity-0 scale-[1.025]';
    }
    if (variant === 'fade') {
      return isVisible
        ? 'opacity-100'
        : 'opacity-0';
    }
    // Default 'text'
    return isVisible
      ? 'opacity-100 translate-y-0'
      : 'opacity-0 translate-y-7';
  };

  return (
    <div
      ref={domRef}
      style={{
        transitionDuration: variant === 'image' ? '650ms' : '600ms',
        transitionDelay: `${delayMs}ms`,
        transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)'
      }}
      className={`transition-all will-change-[transform,opacity] ${getVariantStyles()} ${className}`}
    >
      {children}
    </div>
  );
};
export default ScrollReveal;
