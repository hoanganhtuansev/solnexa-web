/**
 * SOLNEXA Corporate Motion System Design Tokens
 * Standard: Japanese Premium Corporate / Precision Engineering (Solar Frontier aesthetic)
 * Characteristics: Calm, restrained, continuous, inertia-rich, no-bounce, anti-SaaS-slop
 */

import { Variants } from 'motion/react';

// Unified Corporate Easing Curve (Precision Japanese Corporate Engineering standard)
export const CORPORATE_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
export const CORPORATE_EASE_CSS = 'cubic-bezier(0.22, 1, 0.36, 1)';

// Calibrated Timing Tokens (in seconds for motion/react)
export const MOTION_DURATIONS = {
  instant: 0.12,
  fast: 0.22,
  normal: 0.36,
  reveal: 0.62,
  heroCrossfade: 0.88,
  kenBurns: 6.8,
} as const;

// Transition presets
export const TRANSITIONS = {
  fast: {
    duration: MOTION_DURATIONS.fast,
    ease: CORPORATE_EASE,
  },
  normal: {
    duration: MOTION_DURATIONS.normal,
    ease: CORPORATE_EASE,
  },
  reveal: {
    duration: MOTION_DURATIONS.reveal,
    ease: CORPORATE_EASE,
  },
  hero: {
    duration: MOTION_DURATIONS.heroCrossfade,
    ease: CORPORATE_EASE,
  },
  springRestrained: {
    type: 'spring',
    stiffness: 280,
    damping: 32,
    mass: 0.8,
    bounce: 0,
  },
} as const;

// Stagger choreography containers
export const staggerContainer = (staggerChildren = 0.05, delayChildren = 0.02): Variants => ({
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren,
      delayChildren,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.18,
      staggerChildren: 0.02,
      staggerDirection: -1,
    },
  },
});

// Choreographed Mega Menu Variants
export const megaMenuPanelVariants: Variants = {
  hidden: {
    opacity: 0,
    y: -6,
    clipPath: 'inset(0% 0% 10% 0%)',
    transition: {
      duration: 0.22,
      ease: CORPORATE_EASE,
    },
  },
  visible: {
    opacity: 1,
    y: 0,
    clipPath: 'inset(0% 0% 0% 0%)',
    transition: {
      duration: 0.34,
      ease: CORPORATE_EASE,
      when: 'beforeChildren',
      staggerChildren: 0.045,
    },
  },
  exit: {
    opacity: 0,
    y: -6,
    transition: {
      duration: 0.2,
      ease: CORPORATE_EASE,
    },
  },
};

export const megaMenuItemVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 8,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: CORPORATE_EASE,
    },
  },
  exit: {
    opacity: 0,
    y: -4,
    transition: {
      duration: 0.16,
    },
  },
};

// Hero Slide Text Variants (Enter & Exit pairing)
export const heroSlideVariants: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.02,
    },
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: {
      duration: 0.28,
      ease: CORPORATE_EASE,
      staggerChildren: 0.03,
      staggerDirection: -1,
    },
  },
};

export const heroChildVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 18,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.58,
      ease: CORPORATE_EASE,
    },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: {
      duration: 0.24,
      ease: CORPORATE_EASE,
    },
  },
};

// Section Scroll Reveal Variants
export const revealFadeUpVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 22,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.62,
      ease: CORPORATE_EASE,
    },
  },
};

export const revealImageVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 1.025,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.72,
      ease: CORPORATE_EASE,
    },
  },
};

// Modal Animation Variants (Calm, prestigious entry and exit)
export const modalBackdropVariants: Variants = {
  hidden: {
    opacity: 0,
    transition: { duration: 0.24, ease: CORPORATE_EASE },
  },
  visible: {
    opacity: 1,
    transition: { duration: 0.28, ease: CORPORATE_EASE },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.22, ease: CORPORATE_EASE },
  },
};

export const modalCardVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.985,
    y: 14,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.32,
      ease: CORPORATE_EASE,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.985,
    y: 10,
    transition: {
      duration: 0.22,
      ease: CORPORATE_EASE,
    },
  },
};
