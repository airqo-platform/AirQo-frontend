'use client';
import React from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import {
  MdInfoOutline,
  MdWarningAmber,
  MdErrorOutline,
  MdCheckCircleOutline,
} from 'react-icons/md';

/**
 * InfoMessage - A reusable component for displaying informational messages
 * Enhanced with smooth animations and improved visual design
 *
 * @param {Object} props - Component props
 * @param {string} props.title - Main message title
 * @param {string} [props.description] - Optional description text
 * @param {React.ReactNode} [props.icon] - Custom icon component (overrides the default variant icon)
 * @param {string} [props.variant='info'] - Visual variant ('info', 'warning', 'error', 'success')
 * @param {React.ReactNode} [props.action] - Optional action element (button, link, etc.)
 * @param {string} [props.className] - Additional CSS classes
 */
const InfoMessage = ({
  title,
  description,
  icon,
  variant = 'info',
  action,
  className = '',
}) => {
  // Define styles and default icons based on variant
  const variantConfig = {
    info: {
      container: 'bg-blue-50 border-blue-200',
      icon: 'text-blue-500',
      title: 'text-blue-800',
      description: 'text-blue-600',
      defaultIcon: MdInfoOutline,
    },
    warning: {
      container: 'bg-yellow-50 border-yellow-200',
      icon: 'text-yellow-500',
      title: 'text-yellow-800',
      description: 'text-yellow-600',
      defaultIcon: MdWarningAmber,
    },
    error: {
      container: 'bg-red-50 border-red-200',
      icon: 'text-red-500',
      title: 'text-red-800',
      description: 'text-red-600',
      defaultIcon: MdErrorOutline,
    },
    success: {
      container: 'bg-green-50 border-green-200',
      icon: 'text-green-500',
      title: 'text-green-800',
      description: 'text-green-600',
      defaultIcon: MdCheckCircleOutline,
    },
  };

  // Use the specified variant or default to info
  const config = variantConfig[variant] || variantConfig.info;

  // Use custom icon if provided, otherwise use the default icon for the variant
  const IconComponent = icon || config.defaultIcon;

  // Animation variants
  const containerVariants = {
    initial: { opacity: 0, y: 10 },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        staggerChildren: 0.1,
      },
    },
    exit: {
      opacity: 0,
      y: 10,
      transition: { duration: 0.2 },
    },
  };

  const itemVariants = {
    initial: { opacity: 0, y: 5 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.2 },
    },
  };

  const iconVariants = {
    initial: { opacity: 0, scale: 0.8 },
    animate: {
      opacity: 1,
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 20,
      },
    },
  };

  return (
    <motion.div
      className={`p-4 rounded-lg border ${config.container} ${className} flex flex-col items-center`}
      role="alert"
      aria-live="polite"
      variants={containerVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      layout
    >
      <motion.div
        variants={iconVariants}
        className={`text-3xl mb-2 ${config.icon}`}
      >
        <IconComponent size={28} />
      </motion.div>

      <motion.p
        className={`font-medium ${config.title} text-center`}
        variants={itemVariants}
      >
        {title}
      </motion.p>

      {description && (
        <motion.p
          className={`text-sm mt-1 ${config.description} text-center max-w-md mx-auto`}
          variants={itemVariants}
        >
          {description}
        </motion.p>
      )}

      {action && (
        <motion.div className="mt-3" variants={itemVariants}>
          {action}
        </motion.div>
      )}
    </motion.div>
  );
};

InfoMessage.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  icon: PropTypes.elementType,
  variant: PropTypes.oneOf(['info', 'warning', 'error', 'success']),
  action: PropTypes.node,
  className: PropTypes.string,
};

export default InfoMessage;
