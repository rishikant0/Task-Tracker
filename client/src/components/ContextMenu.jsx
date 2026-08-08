import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ContextMenu = ({ items, children, className }) => {
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleContextMenu = useCallback(
    (event) => {
      event.preventDefault();
      
      const clickX = event.clientX;
      const clickY = event.clientY;
      const screenW = window.innerWidth;
      const screenH = window.innerHeight;
      const rootW = 200; // Expected width of context menu
      const rootH = items.length * 40 + 20; // Expected height
      
      let x = clickX;
      let y = clickY;

      // Adjust if menu goes off screen
      if (clickX + rootW > screenW) {
        x = screenW - rootW - 10;
      }
      if (clickY + rootH > screenH) {
        y = screenH - rootH - 10;
      }

      setPosition({ x, y });
      setVisible(true);
    },
    [items]
  );

  const handleClick = useCallback(() => {
    if (visible) setVisible(false);
  }, [visible]);

  useEffect(() => {
    document.addEventListener('click', handleClick);
    document.addEventListener('contextmenu', (e) => {
      if (visible) setVisible(false);
    });
    return () => {
      document.removeEventListener('click', handleClick);
      document.removeEventListener('contextmenu', handleClick);
    };
  }, [visible, handleClick]);

  return (
    <div onContextMenu={handleContextMenu} className={`relative ${className || ''}`}>
      {children}
      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.1 }}
            style={{
              position: 'fixed',
              top: position.y,
              left: position.x,
              zIndex: 9999
            }}
            className="w-48 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200 dark:border-slate-700/50 rounded-xl shadow-2xl overflow-hidden py-1"
          >
            {items.map((item, index) => {
              if (item.divider) {
                return <div key={`div-${index}`} className="h-px bg-slate-200 dark:bg-slate-700/50 my-1"></div>;
              }
              const Icon = item.icon;
              return (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    item.action();
                    setVisible(false);
                  }}
                  className={`w-full text-left px-3 py-2 flex items-center gap-2 text-sm font-medium transition-colors hover:bg-primary/10 dark:hover:bg-primary/20 ${item.danger ? 'text-rose-500 hover:text-rose-600' : 'text-slate-700 dark:text-slate-300'}`}
                >
                  {Icon && <Icon size={16} />}
                  {item.label}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ContextMenu;
