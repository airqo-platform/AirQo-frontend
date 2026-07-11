'use client';

import { motion } from 'framer-motion';

type AmbientBackgroundProps = {
  reduceMotion?: boolean | null;
  variant?: 'default' | 'quiz';
};

export default function AmbientBackground({
  reduceMotion,
  variant = 'default',
}: AmbientBackgroundProps) {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at 100% 0%, #005257 0%, transparent 60%)',
        }}
      />

      <div
        className="absolute inset-0 opacity-[0.1]"
        style={{
          backgroundImage: `
            linear-gradient(
              rgba(255, 255, 255, 0.32) 1px,
              transparent 1px
            ),
            linear-gradient(
              90deg,
              rgba(255, 255, 255, 0.32) 1px,
              transparent 1px
            )
          `,
          backgroundSize: '72px 72px',
          maskImage:
            'linear-gradient(to bottom, black 0%, black 45%, transparent 84%)',
          WebkitMaskImage:
            'linear-gradient(to bottom, black 0%, black 45%, transparent 84%)',
        }}
      />

      <div
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage: `
            linear-gradient(
              rgba(255, 255, 255, 0.45) 1px,
              transparent 1px
            ),
            linear-gradient(
              90deg,
              rgba(255, 255, 255, 0.45) 1px,
              transparent 1px
            )
          `,
          backgroundSize: '24px 24px',
          maskImage: 'linear-gradient(to bottom, black 0%, transparent 70%)',
          WebkitMaskImage:
            'linear-gradient(to bottom, black 0%, transparent 70%)',
        }}
      />

      <motion.div
        className="absolute -right-[55%] top-[5%] h-[420px] w-[420px] rounded-full bg-[#39BFC7]/20 blur-[100px] sm:-right-[14%] sm:h-[540px] sm:w-[540px] sm:blur-[110px]"
        animate={
          reduceMotion
            ? undefined
            : {
                x: [0, -38, 14, 0],
                y: [0, 26, -12, 0],
                scale: [1, 1.09, 0.97, 1],
              }
        }
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      <motion.div
        className="absolute -left-[60%] top-[28%] h-[380px] w-[380px] rounded-full bg-[#39BFC7]/12 blur-[100px] sm:-left-[13%] sm:top-[20%] sm:h-[450px] sm:w-[450px] sm:blur-[115px]"
        animate={
          reduceMotion
            ? undefined
            : {
                x: [0, 45, -8, 0],
                y: [0, -22, 28, 0],
                scale: [1, 0.94, 1.06, 1],
              }
        }
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      <motion.div
        className="absolute left-[28%] top-[17%] h-32 w-32 rounded-full bg-white/10 blur-[60px] sm:left-[34%] sm:top-[12%] sm:h-40 sm:w-40 sm:blur-[68px]"
        animate={
          reduceMotion
            ? undefined
            : {
                x: [-45, 120, -15, -45],
                y: [0, 58, -26, 0],
                opacity: [0.2, 0.5, 0.28, 0.2],
              }
        }
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {variant === 'quiz' && (
        <motion.div
          className="absolute right-[15%] top-[45%] h-[280px] w-[280px] rounded-full bg-[#02ADB7]/15 blur-[90px] sm:right-[10%] sm:top-[40%] sm:h-[360px] sm:w-[360px] sm:blur-[100px]"
          animate={
            reduceMotion
              ? undefined
              : {
                  x: [0, -20, 30, 0],
                  y: [0, 15, -20, 0],
                  scale: [1, 1.05, 0.95, 1],
                }
          }
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      )}

      <div className="absolute inset-x-0 bottom-0 h-[30%] bg-gradient-to-b from-transparent via-white/15 to-white/70 sm:h-[36%] sm:via-white/20 sm:to-white/80" />
    </div>
  );
}
