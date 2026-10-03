import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { 
  CORPORATE_EASE, 
  revealFadeUpVariants, 
  revealImageVariants, 
  staggerContainer 
} from '../../utils/motionConfig';

export type ScrollRevealVariant = 
  | 'label' 
  | 'heading' 
  | 'body' 
  | 'text' 
  | 'cta' 
  | 'image' 
  | 'card' 
  | 'stagger';

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  variant?: ScrollRevealVariant;
  delayMs?: number;
  viewportAmount?: number;
}

export const ScrollReveal: React.FC<ScrollRevealProps> = ({
  children,
  className = '',
  variant = 'text',
  delayMs = 0,
  viewportAmount = 0.15,
}) => {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  const delaySec = delayMs / 1000;

  if (variant === 'stagger') {
    return (
      <motion.div
        variants={staggerContainer(0.065, delaySec)}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: viewportAmount }}
        className={className}
      >
        {children}
      </motion.div>
    );
  }

  if (variant === 'image') {
    return (
      <motion.div
        variants={revealImageVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: viewportAmount }}
        transition={{
          duration: 0.72,
          ease: CORPORATE_EASE,
          delay: delaySec,
        }}
        className={className}
      >
        {children}
      </motion.div>
    );
  }

  // Semantic fine-tuned offsets for Japanese corporate hierarchy
  let yOffset = 16;
  let duration = 0.58;

  if (variant === 'label') {
    yOffset = 14;
    duration = 0.52;
  } else if (variant === 'heading') {
    yOffset = 22;
    duration = 0.65;
  } else if (variant === 'body' || variant === 'text') {
    yOffset = 16;
    duration = 0.58;
  } else if (variant === 'cta') {
    yOffset = 12;
    duration = 0.50;
  } else if (variant === 'card') {
    yOffset = 18;
    duration = 0.58;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: yOffset }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: viewportAmount }}
      transition={{
        duration,
        ease: CORPORATE_EASE,
        delay: delaySec,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export const ScrollRevealItem: React.FC<{
  children: React.ReactNode;
  className?: string;
  delayMs?: number;
}> = ({ children, className = '', delayMs = 0 }) => {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div 
      variants={revealFadeUpVariants} 
      transition={delayMs > 0 ? { delay: delayMs / 1000 } : undefined}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default ScrollReveal;

