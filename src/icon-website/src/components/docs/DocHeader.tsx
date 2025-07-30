import { motion } from "framer-motion";

export default function DocHeader() {
  return (
    <div className="bg-white border-b border-gray-200 dark:bg-gray-900 dark:border-gray-800">
      <div className="px-4 py-12 mx-auto text-center max-w-7xl sm:px-6 lg:px-8">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-4 text-4xl font-bold text-gray-900 dark:text-white"
        >
          Documentation
        </motion.h1>
        <p className="max-w-2xl mx-auto text-lg text-gray-600 dark:text-gray-300">
          Everything you need to get started with AirQo Icons.
        </p>
      </div>
    </div>
  );
}
