"use client";

import { motion } from "framer-motion";

export const Footer = () => {
  return (
    <footer className="fixed bottom-0 left-0 right-0 z-[200]">
      <motion.div
        className="h-fit w-full bg-white p-2"
        initial={{ opacity: 0, y: "100%" }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <p className="text-center text-xs font-medium text-[#0213aa]">
          © 2025 Vinamilk. All rights reserved.
        </p>
      </motion.div>
    </footer>
  );
};

export default Footer;
