"use client";
import { motion } from "framer-motion";
export default function DocSection({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <motion.section
      id={id}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
      className="mb-16 flex flex-col gap-3"
    >
      <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
        {title}
      </h2>
      {children}
    </motion.section>
  );
}
