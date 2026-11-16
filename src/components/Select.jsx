import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, ChevronDown } from "lucide-react";

const EASE = [0.16, 1, 0.3, 1];
const LIST_MAX_HEIGHT = 288;

/**
 * Custom dropdown that replaces the browser's <select>.
 *
 * - `options` is a list of { value, label } (or plain strings).
 * - `onChange` receives the chosen value, not an event.
 * - Works with the keyboard: Enter, Space or the arrow keys open it; arrows move;
 *   Enter picks; Escape closes; Home and End jump; typing a letter jumps to a match.
 * - Opens upward when there is not enough room below.
 * - `id`, `aria-*` and `className` go on the trigger button, so it drops into <Field>.
 */
const Select = ({
  value,
  onChange,
  options,
  placeholder = "Choose",
  className = "",
  pill = false,
  disabled = false,
  name,
  ...triggerProps
}) => {
  const items = options.map((option) => (typeof option === "string" ? { value: option, label: option } : option));
  const selectedIndex = items.findIndex((item) => item.value === value);
  const selected = items[selectedIndex];

  const listId = useId();
  const root = useRef(null);
  const trigger = useRef(null);
  const list = useRef(null);
  const typeahead = useRef({ text: "", timer: null });

  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(Math.max(selectedIndex, 0));
  const [upward, setUpward] = useState(false);

  const openList = () => {
    if (disabled) return;
    setActive(Math.max(selectedIndex, 0));
    setOpen(true);
  };

  const close = (returnFocus = true) => {
    setOpen(false);
    if (returnFocus) trigger.current?.focus();
  };

  const choose = (index) => {
    const item = items[index];
    if (item && !item.disabled) onChange(item.value);
    close();
  };

  // Decide which way to open, then move focus into the list
  useLayoutEffect(() => {
    if (!open || !trigger.current) return;
    const rect = trigger.current.getBoundingClientRect();
    const below = window.innerHeight - rect.bottom;
    setUpward(below < LIST_MAX_HEIGHT + 16 && rect.top > below);
    list.current?.focus({ preventScroll: true });
  }, [open]);

  // Keep the highlighted option in view
  useEffect(() => {
    if (!open) return;
    list.current?.querySelector(`[data-index="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [active, open]);

  // Close when clicking anywhere else
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event) => {
      if (!root.current?.contains(event.target)) close(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  useEffect(() => () => clearTimeout(typeahead.current.timer), []);

  const step = (from, delta) => {
    let index = from;
    for (let tries = 0; tries < items.length; tries += 1) {
      index = Math.min(Math.max(index + delta, 0), items.length - 1);
      if (!items[index]?.disabled) return index;
    }
    return from;
  };

  const jumpToText = (key) => {
    const state = typeahead.current;
    clearTimeout(state.timer);
    state.text += key.toLowerCase();
    state.timer = setTimeout(() => { state.text = ""; }, 600);
    const match = items.findIndex((item) => String(item.label).toLowerCase().startsWith(state.text));
    if (match >= 0) setActive(match);
  };

  const handleTriggerKeyDown = (event) => {
    if (["ArrowDown", "ArrowUp", "Enter", " "].includes(event.key)) {
      event.preventDefault();
      openList();
    }
  };

  const handleListKeyDown = (event) => {
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        setActive((index) => step(index, 1));
        break;
      case "ArrowUp":
        event.preventDefault();
        setActive((index) => step(index, -1));
        break;
      case "Home":
        event.preventDefault();
        setActive(step(-1, 1));
        break;
      case "End":
        event.preventDefault();
        setActive(step(items.length, -1));
        break;
      case "Enter":
      case " ":
        event.preventDefault();
        choose(active);
        break;
      case "Escape":
        event.preventDefault();
        close();
        break;
      case "Tab":
        close(false);
        break;
      default:
        if (event.key.length === 1 && /\S/.test(event.key)) jumpToText(event.key);
    }
  };

  const shape = pill ? "!rounded-full !px-5" : "";

  return (
    <div ref={root} className="relative">
      <button
        ref={trigger}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        onClick={() => (open ? close() : openList())}
        onKeyDown={handleTriggerKeyDown}
        className={`field-input flex items-center justify-between gap-3 text-left disabled:opacity-60 ${
          open ? "!border-ink" : ""
        } ${shape} ${className}`}
        {...triggerProps}
      >
        <span className={`truncate ${selected ? "text-ink" : "text-muted"}`}>{selected ? selected.label : placeholder}</span>
        <ChevronDown
          className={`size-4 shrink-0 text-muted transition-transform duration-300 ease-out-expo ${open ? "rotate-180 text-ink" : ""}`}
          strokeWidth={2}
          aria-hidden="true"
        />
      </button>

      {/* Lets a plain <form> submit the value, like a native select would */}
      {name && <input type="hidden" name={name} value={value ?? ""} />}

      <AnimatePresence>
        {open && (
          <motion.ul
            ref={list}
            id={listId}
            role="listbox"
            tabIndex={-1}
            aria-activedescendant={`${listId}-${active}`}
            aria-labelledby={triggerProps.id}
            onKeyDown={handleListKeyDown}
            initial={{ opacity: 0, y: upward ? 8 : -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: upward ? 8 : -8, scale: 0.98 }}
            transition={{ duration: 0.2, ease: EASE }}
            style={{ maxHeight: LIST_MAX_HEIGHT }}
            className={`absolute inset-x-0 z-50 min-w-max overflow-y-auto overscroll-contain rounded-2xl border border-line bg-panel p-1.5 shadow-lift outline-none ${
              upward ? "bottom-full mb-2 origin-bottom" : "top-full mt-2 origin-top"
            }`}
          >
            {items.map((item, index) => {
              const isSelected = item.value === value;
              const isActive = index === active;
              return (
                <li
                  key={String(item.value)}
                  id={`${listId}-${index}`}
                  data-index={index}
                  role="option"
                  aria-selected={isSelected}
                  aria-disabled={item.disabled || undefined}
                  onPointerMove={() => !item.disabled && setActive(index)}
                  onClick={() => !item.disabled && choose(index)}
                  className={`relative flex cursor-pointer items-center justify-between gap-6 rounded-xl px-3.5 py-2.5 text-[15px] ${
                    item.disabled ? "cursor-not-allowed text-muted/60" : isSelected ? "font-medium text-ink" : "text-ink-soft"
                  }`}
                >
                  {isActive && !item.disabled && (
                    <motion.span
                      layoutId={`select-active-${listId}`}
                      className="absolute inset-0 rounded-xl bg-tint"
                      transition={{ type: "spring", stiffness: 500, damping: 38 }}
                    />
                  )}
                  <span className="relative">{item.label}</span>
                  {isSelected && <Check className="relative size-4 shrink-0 text-accent-deep" strokeWidth={2.25} aria-hidden="true" />}
                </li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Select;
