import classNames from "classnames";
import { motion } from "framer-motion";

export default function Button({
  children,
  variant = "primary",
  type = "button",
  className,
  ...props
}) {
  const styles = {
    primary: "bg-primary text-white hover:bg-primary/90",
    outline: "border border-primary text-primary hover:bg-accent",
    secondary: "bg-neutral/10 text-neutral hover:bg-neutral/15",
    danger: "bg-danger/10 text-danger hover:bg-danger/15",
  };
  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      type={type}
      className={classNames(
        "touch-button",
        styles[variant] || styles.primary,
        className,
      )}
      {...props}
    >
      {children}
    </motion.button>
  );
}
