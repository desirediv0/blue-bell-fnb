import React from "react";
import { motion } from "framer-motion";

const Headtext = ({ text, className }) => {
  return (
    <h2
      className={`text-2xl md:text-3xl font-bold tracking-tight text-[#333333] ${className}`}
    >
      <span className="relative inline-block">
        {text}
        <motion.span
          className="absolute -bottom-3 left-0 h-[3px] rounded-full bg-[#1E73BE] w-0"
          animate={{ width: "100%" }}
          transition={{ delay: 0.5, duration: 0.7, ease: "easeOut" }}
        />
      </span>
    </h2>
  );
};

export default Headtext;
