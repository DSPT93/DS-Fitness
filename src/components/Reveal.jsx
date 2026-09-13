import { motion } from "framer-motion";

const DIRECTIONS = {
  up: { y: 36, x: 0 },
  down: { y: -36, x: 0 },
  left: { y: 0, x: 36 },
  right: { y: 0, x: -36 },
  none: { y: 0, x: 0 },
};

export default function Reveal({
  children,
  as = "div",
  direction = "up",
  delay = 0,
  duration = 0.7,
  once = true,
  amount = 0.35,
  className,
  ...rest
}) {
  const Component = motion[as] ?? motion.div;
  const offset = DIRECTIONS[direction] ?? DIRECTIONS.up;

  return (
    <Component
      className={className}
      initial={{ opacity: 0, ...offset }}
      whileInView={{ opacity: 1, y: 0, x: 0 }}
      viewport={{ once, amount }}
      transition={{ duration, delay, ease: [0.22, 1, 0.36, 1] }}
      {...rest}
    >
      {children}
    </Component>
  );
}
