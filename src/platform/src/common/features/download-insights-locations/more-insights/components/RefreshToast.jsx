import { motion, AnimatePresence } from 'framer-motion';

export default function RefreshToast({ show }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="absolute top-2 right-4 bg-green-50 text-green-700 px-3 py-1.5 rounded-md flex items-center z-20 shadow-sm"
        >
          <span className="text-sm font-medium ml-1">Data refreshed</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
