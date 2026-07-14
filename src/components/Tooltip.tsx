import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { HelpCircle, Info } from "lucide-react";

export default function Tooltip({ content }: { content: string }) {
  const [show, setShow] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (show && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      let top = rect.top - 8;
      let left = rect.left + rect.width / 2;

      setCoords({ top, left });

      requestAnimationFrame(() => {
        if (!tooltipRef.current) return;
        const tooltipRect = tooltipRef.current.getBoundingClientRect();

        let newLeft = left;
        const padding = 16;

        if (left - tooltipRect.width / 2 < padding) {
          newLeft = tooltipRect.width / 2 + padding;
        } else if (left + tooltipRect.width / 2 > window.innerWidth - padding) {
          newLeft = window.innerWidth - tooltipRect.width / 2 - padding;
        }

        setCoords({ top, left: newLeft });
      });
    }
  }, [show]);

  // Handle outside click for mobile
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      if (
        show &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        setShow(false);
      }
    };
    if (show) {
      document.addEventListener("mousedown", handleOutsideClick);
      document.addEventListener("touchstart", handleOutsideClick);
    }
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("touchstart", handleOutsideClick);
    };
  }, [show]);

  return (
    <div
      className="relative inline-flex items-center justify-center ml-1 z-50 cursor-pointer"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      onClick={() => setShow(!show)} // Toggle on click for mobile
      ref={triggerRef}
    >
      <HelpCircle className="w-3.5 h-3.5 text-slate-400 hover:text-indigo-500 transition-colors" />
      {show &&
        createPortal(
          <div
            ref={tooltipRef}
            className="fixed z-[99999] w-max max-w-[250px] p-2.5 bg-slate-800 dark:bg-slate-800 text-slate-100 text-[11px] rounded-lg shadow-xl shadow-slate-900/20 border border-slate-700 pointer-events-none leading-relaxed font-medium animate-in fade-in zoom-in-95 duration-100 whitespace-normal"
            style={{
              top: `${coords.top}px`,
              left: `${coords.left}px`,
              transform: `translate(-50%, -100%)`,
            }}
          >
            {content}
            <div
              className="absolute top-full border-[5px] border-transparent border-t-slate-800"
              style={{
                left: `calc(50% + ${triggerRef.current ? triggerRef.current.getBoundingClientRect().left + triggerRef.current.getBoundingClientRect().width / 2 - coords.left : 0}px)`,
                transform: `translateX(-50%)`,
              }}
            ></div>
          </div>,
          document.body,
        )}
    </div>
  );
}
