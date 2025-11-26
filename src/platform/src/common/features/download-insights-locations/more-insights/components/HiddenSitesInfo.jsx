import { motion, AnimatePresence } from 'framer-motion';
import { MdInfo } from 'react-icons/md';

export default function HiddenSitesInfo({ hiddenCount }) {
  return (
    <AnimatePresence>
      {hiddenCount > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="flex items-center space-x-2 text-blue-600"
        >
          <MdInfo />
          <span>{hiddenCount} site(s) hidden and won&apos;t download</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
