"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  AnimatePresence,
  animate,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type Variants,
} from "motion/react";
import { Icon } from "./icons";

export const ease = [0.22, 1, 0.36, 1] as const;
export const spring = { type: "spring", stiffness: 420, damping: 38 } as const;
export const softSpring = { type: "spring", stiffness: 260, damping: 30 } as const;

/* ---------- Layers: sheet, drawer, modal ---------- */

function useEscape(open: boolean, onClose: () => void) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);
}

function useFocusOnOpen(open: boolean) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    const t = setTimeout(() => {
      const el = ref.current?.querySelector<HTMLElement>(
        "[autofocus], button, [href], input, select, textarea",
      );
      (el || ref.current)?.focus({ preventScroll: true });
    }, 60);
    return () => {
      clearTimeout(t);
      previous?.focus?.({ preventScroll: true });
    };
  }, [open]);
  return ref;
}

/** Bottom sheet. Drag the handle (or the sheet) down to dismiss. */
export function Sheet({
  open,
  onClose,
  title,
  children,
  className = "",
  full = false,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  className?: string;
  full?: boolean;
}) {
  useEscape(open, onClose);
  const ref = useFocusOnOpen(open);
  const id = useId();
  return (
    <AnimatePresence>
      {open && (
        <div className="kit-layer" key="sheet">
          <motion.div
            className="kit-scrim"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.div
            ref={ref}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? id : undefined}
            tabIndex={-1}
            className={`kit-sheet ${full ? "full" : ""} ${className}`}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={softSpring}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.6 }}
            dragListener
            onDragEnd={(_, info) => {
              if (info.offset.y > 110 || info.velocity.y > 600) onClose();
            }}
          >
            <div className="kit-handle" aria-hidden="true" />
            {title && (
              <div className="kit-sheet-head">
                <h2 id={id}>{title}</h2>
                <button className="kit-icon-btn" onClick={onClose} aria-label="Close">
                  <Icon name="close" />
                </button>
              </div>
            )}
            <div className="kit-sheet-body" onPointerDownCapture={(e) => e.stopPropagation()}>
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export function Drawer({
  open,
  onClose,
  title,
  children,
  side = "right",
  className = "",
  width = 440,
}: {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  children: ReactNode;
  side?: "left" | "right";
  className?: string;
  width?: number;
}) {
  useEscape(open, onClose);
  const ref = useFocusOnOpen(open);
  const from = side === "right" ? "100%" : "-100%";
  return (
    <AnimatePresence>
      {open && (
        <div className="kit-layer" key="drawer">
          <motion.div
            className="kit-scrim"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.aside
            ref={ref}
            role="dialog"
            aria-modal="true"
            aria-label={typeof title === "string" ? title : "Panel"}
            tabIndex={-1}
            className={`kit-drawer ${side} ${className}`}
            style={{ width: `min(${width}px, 100%)` }}
            initial={{ x: from }}
            animate={{ x: 0 }}
            exit={{ x: from }}
            transition={{ duration: 0.55, ease }}
          >
            <div className="kit-drawer-head">
              <h2>{title}</h2>
              <button className="kit-icon-btn" onClick={onClose} aria-label="Close">
                <Icon name="close" />
              </button>
            </div>
            <div className="kit-drawer-body">{children}</div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}

export function Modal({
  open,
  onClose,
  children,
  label,
  className = "",
}: {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  label: string;
  className?: string;
}) {
  useEscape(open, onClose);
  const ref = useFocusOnOpen(open);
  return (
    <AnimatePresence>
      {open && (
        <div className="kit-layer kit-center" key="modal">
          <motion.div
            className="kit-scrim"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.div
            ref={ref}
            role="dialog"
            aria-modal="true"
            aria-label={label}
            tabIndex={-1}
            className={`kit-modal ${className}`}
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            transition={{ duration: 0.5, ease }}
          >
            <button className="kit-icon-btn kit-modal-close" onClick={onClose} aria-label="Close">
              <Icon name="close" />
            </button>
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

/* ---------- Toasts ---------- */

type Toast = { id: number; text: string; icon?: string; action?: { label: string; run: () => void } };
const ToastContext = createContext<(text: string, opts?: Omit<Toast, "id" | "text">) => void>(() => {});
export const useToast = () => useContext(ToastContext);

export function ToastHost({ children, className = "" }: { children: ReactNode; className?: string }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const push = useCallback((text: string, opts: Omit<Toast, "id" | "text"> = {}) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t.slice(-2), { id, text, ...opts }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200);
  }, []);
  return (
    <ToastContext.Provider value={push}>
      {children}
      <div className={`kit-toasts ${className}`} role="status" aria-live="polite">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              className="kit-toast"
              layout
              initial={{ opacity: 0, y: 24, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.95 }}
              transition={spring}
            >
              {t.icon && <Icon name={t.icon} size={18} />}
              <span>{t.text}</span>
              {t.action && (
                <button
                  onClick={() => {
                    t.action!.run();
                    setToasts((all) => all.filter((x) => x.id !== t.id));
                  }}
                >
                  {t.action.label}
                </button>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

/* ---------- Controls ---------- */

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  label,
  className = "",
}: {
  options: readonly (NoInfer<T> | { value: NoInfer<T>; label: ReactNode })[];
  value: T;
  onChange: (v: T) => void;
  label: string;
  className?: string;
}) {
  const id = useId();
  return (
    <div className={`kit-seg ${className}`} role="radiogroup" aria-label={label}>
      {options.map((o) => {
        const v = typeof o === "string" ? o : o.value;
        const l = typeof o === "string" ? o : o.label;
        const on = v === value;
        return (
          <button
            key={v}
            role="radio"
            aria-checked={on}
            className={on ? "on" : ""}
            onClick={() => onChange(v)}
          >
            {on && <motion.span layoutId={id} className="kit-seg-pill" transition={spring} />}
            <span className="kit-seg-label">{l}</span>
          </button>
        );
      })}
    </div>
  );
}

export function Qty({
  value,
  onChange,
  min = 0,
  max = 20,
  label = "Quantity",
}: {
  value: number;
  onChange: (n: number) => void;
  min?: number;
  max?: number;
  label?: string;
}) {
  return (
    <div className="kit-qty" role="group" aria-label={label}>
      <button aria-label="Decrease" onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min}>
        <Icon name="minus" size={16} />
      </button>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.output
          key={value}
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 10, opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {value}
        </motion.output>
      </AnimatePresence>
      <button aria-label="Increase" onClick={() => onChange(Math.min(max, value + 1))} disabled={value >= max}>
        <Icon name="plus" size={16} />
      </button>
    </div>
  );
}

export function Toggle({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button role="switch" aria-checked={on} aria-label={label} className={`kit-toggle ${on ? "on" : ""}`} onClick={() => onChange(!on)}>
      <motion.span layout transition={spring} />
    </button>
  );
}

/* ---------- Motion helpers ---------- */

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.7, ease, delay: i * 0.06 } }),
};

export function Reveal({
  children,
  delay = 0,
  y = 28,
  className,
  as = "div",
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  as?: "div" | "section" | "li" | "article" | "span";
}) {
  const reduce = useReducedMotion();
  const M = motion[as] as typeof motion.div;
  return (
    <M
      className={className}
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -8% 0px" }}
      transition={{ duration: 0.8, ease, delay }}
    >
      {children}
    </M>
  );
}

/** Masked word-by-word reveal for display headings. */
export function SplitText({ text, className, delay = 0, stagger = 0.06, as = "span" }: { text: string; className?: string; delay?: number; stagger?: number; as?: "span" | "h1" | "h2" | "p" }) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  // Observe the unclipped wrapper: the words start outside their masks, so
  // observing them directly would never report an intersection.
  const seen = useInView(ref, { once: true, margin: "0px 0px -5% 0px" });
  const Tag = as as any;
  return (
    <Tag ref={ref} className={`kit-split ${className || ""}`} aria-label={text}>
      {text.split(" ").map((word, i) => (
        <span key={i}>
        <span className="kit-split-mask" aria-hidden="true">
          <motion.span
            className="kit-split-word"
            initial={reduce ? false : { y: "110%" }}
            animate={seen || reduce ? { y: "0%" } : { y: "110%" }}
            transition={{ duration: 0.9, ease, delay: delay + i * stagger }}
          >
            {word}
          </motion.span>
        </span>{" "}
        </span>
      ))}
    </Tag>
  );
}

/** Animated number that eases toward its value. */
export function CountUp({ value, format = (n: number) => Math.round(n).toLocaleString("en-US"), duration = 1.1 }: { value: number; format?: (n: number) => string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const prev = useRef(0);
  const inView = useInView(ref, { once: true });
  const reduce = useReducedMotion();
  useEffect(() => {
    if (!inView || !ref.current) return;
    if (reduce) {
      ref.current.textContent = format(value);
      prev.current = value;
      return;
    }
    const controls = animate(prev.current, value, {
      duration,
      ease,
      onUpdate: (v) => {
        if (ref.current) ref.current.textContent = format(v);
      },
    });
    prev.current = value;
    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, inView]);
  return <span ref={ref}>{format(reduce ? value : prev.current)}</span>;
}

/** Screen transition wrapper for in-app navigation stacks. */
export function Screen({ id, dir, children, className = "" }: { id: string; dir: number; children: ReactNode; className?: string }) {
  const reduce = useReducedMotion();
  const x = dir === 1 ? 48 : dir === -1 ? -48 : 0;
  return (
    <motion.div
      key={id}
      className={`kit-screen ${className}`}
      initial={reduce ? false : { opacity: 0, x, y: dir === 0 ? 14 : 0 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ duration: 0.5, ease }}
    >
      {children}
    </motion.div>
  );
}

/** A hold-to-confirm / swipe-to-confirm control for consequential actions. */
export function SwipeConfirm({ label, onConfirm, done }: { label: string; onConfirm: () => void; done?: string }) {
  const x = useMotionValue(0);
  const track = useRef<HTMLDivElement>(null);
  const [complete, setComplete] = useState(false);
  const fill = useTransform(x, (v) => `${v + 56}px`);
  const opacity = useTransform(x, [0, 120], [1, 0]);
  return (
    <div className={`kit-swipe ${complete ? "done" : ""}`} ref={track}>
      <motion.div className="kit-swipe-fill" style={{ width: fill }} />
      <motion.span className="kit-swipe-label" style={{ opacity }}>
        {complete ? "" : label}
      </motion.span>
      {complete && <span className="kit-swipe-label">{done}</span>}
      <motion.button
        className="kit-swipe-knob"
        aria-label={label}
        drag={complete ? false : "x"}
        dragConstraints={track}
        dragElastic={0}
        dragMomentum={false}
        style={{ x }}
        onClick={() => {
          if (complete) return;
          setComplete(true);
          animate(x, (track.current?.clientWidth || 300) - 60, { duration: 0.4, ease });
          setTimeout(onConfirm, 450);
        }}
        onDragEnd={() => {
          const max = (track.current?.clientWidth || 300) - 60;
          if (x.get() > max * 0.8) {
            setComplete(true);
            animate(x, max, { duration: 0.2 });
            setTimeout(onConfirm, 350);
          } else animate(x, 0, spring);
        }}
      >
        <Icon name={complete ? "check" : "next"} />
      </motion.button>
    </div>
  );
}

export function Empty({ icon, title, text, action }: { icon: string; title: string; text?: string; action?: ReactNode }) {
  return (
    <div className="kit-empty">
      <motion.div className="kit-empty-icon" initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={spring}>
        <Icon name={icon} size={28} />
      </motion.div>
      <h3>{title}</h3>
      {text && <p>{text}</p>}
      {action}
    </div>
  );
}

/** Pick an initial avatar color deterministically. */
export function Avatar({ name, src, size = 36, ring = false }: { name: string; src?: string; size?: number; ring?: boolean }) {
  const hues = [18, 42, 96, 152, 196, 228, 268, 320];
  const h = hues[[...name].reduce((a, c) => a + c.charCodeAt(0), 0) % hues.length];
  const initials = name.split(" ").map((w) => w[0]).slice(0, 2).join("");
  return (
    <span
      className={`kit-avatar ${ring ? "ring" : ""}`}
      style={{ width: size, height: size, fontSize: size * 0.38, background: src ? undefined : `linear-gradient(140deg, hsl(${h} 70% 72%), hsl(${h + 40} 60% 52%))` }}
      aria-hidden="true"
    >
      {src ? <img src={src} alt="" /> : initials}
    </span>
  );
}

export { motion, AnimatePresence, useReducedMotion };
