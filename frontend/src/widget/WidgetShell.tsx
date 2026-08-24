import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { ChatPanel } from "../components/ChatPanel";

export function WidgetShell() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed right-5 bottom-5 z-[9999] font-mono">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 12 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="absolute right-0 bottom-[4.5rem]"
          >
            <ChatPanel className="h-[28rem] w-[22rem] shadow-2xl" chromeLabel="ask about aiman" />
          </motion.div>
        )}
      </AnimatePresence>
      <motion.button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={isOpen ? "Close chat" : "Open chat"}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.95 }}
        className="bg-accent text-accent-ink flex h-14 w-14 items-center justify-center rounded-full text-xl font-bold shadow-lg"
      >
        {isOpen ? "×" : ">_"}
      </motion.button>
    </div>
  );
}
