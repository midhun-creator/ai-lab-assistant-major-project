import type { ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../../lib/utils";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
}

export const Modal = ({ isOpen, onClose, children, className }: ModalProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className={cn(
              "relative w-full max-w-lg bg-surface rounded-card shadow-modal border border-border p-6 overflow-hidden z-10",
              className
            )}
          >
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export const ModalHeader = ({ children, className }: { children: ReactNode; className?: string }) => (
  <div className={cn("mb-5", className)}>{children}</div>
);

export const ModalTitle = ({ children, className }: { children: ReactNode; className?: string }) => (
  <h2 className={cn("text-xl font-serif font-bold text-text-primary", className)}>{children}</h2>
);

export const ModalDescription = ({ children, className }: { children: ReactNode; className?: string }) => (
  <p className={cn("text-sm text-muted mt-1.5", className)}>{children}</p>
);

export const ModalFooter = ({ children, className }: { children: ReactNode; className?: string }) => (
  <div className={cn("mt-6 flex justify-end space-x-3", className)}>{children}</div>
);
