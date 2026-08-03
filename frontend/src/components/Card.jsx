import { motion } from "framer-motion";

export default function Card({
  children,
  className = "",
  animated = false,
  ...props
}) {
  const Component = animated ? motion.div : "div";
  return (
    <Component
      className={`surface-card ${className}`}
      initial={animated ? { opacity: 0, y: 8 } : undefined}
      animate={animated ? { opacity: 1, y: 0 } : undefined}
      {...props}
    >
      {children}
    </Component>
  );
}
