import { useLayoutEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import type {
  ReactNode,
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  TextareaHTMLAttributes,
  SelectHTMLAttributes,
  HTMLAttributes,
} from "react";
const paths: Record<string, ReactNode> = {
  arrow: (
    <>
      <path d="M4 12h15M13 6l6 6-6 6" />
    </>
  ),
  chevron: <path d="m9 5 7 7-7 7" />,
  down: <path d="m6 9 6 6 6-6" />,
  menu: <path d="M4 6h16M4 12h16M4 18h16" />,
  grid: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </>
  ),
  bag: (
    <>
      <path d="M5 7h14l1 14H4L5 7Z" />
      <path d="M8 8V6a4 4 0 0 1 8 0v2" />
    </>
  ),
  pin: (
    <>
      <path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 0 1 14 0Z" />
      <circle cx="12" cy="10" r="2.5" />
    </>
  ),
  phone: (
    <path d="m7 3 3 5-3 2c1.5 3 3 4.5 6 6l2-3 5 3c0 3-2 5-4 5C10 21 3 14 3 8c0-3 1-5 4-5Z" />
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  leaf: (
    <>
      <path d="M20 3C7 2 2 8 5 15s15 6 15-12Z" />
      <path d="M3 21 15 9" />
    </>
  ),
  heart: <path d="m12 21-8-8C-2 7 6-1 12 6c6-7 14 1 8 7l-8 8Z" />,
  truck: (
    <>
      <path d="M2 5h12v12H2V5Zm12 5h4l4 4v3h-8" />
      <circle cx="6" cy="18" r="2" />
      <circle cx="18" cy="18" r="2" />
    </>
  ),
  check: <path d="m5 12 4 4L19 6" />,
  close: <path d="m6 6 12 12M6 18 18 6" />,
  plus: <path d="M12 5v14M5 12h14" />,
  minus: <path d="M5 12h14" />,
  trash: (
    <>
      <path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7M14 10v7" />
    </>
  ),
  wheat: (
    <>
      <path d="M5 21 19 3M8 17c-6 0-5-6-5-6 5 0 6 3 5 6Zm4-5c-5 0-5-6-5-6 5 0 6 3 5 6Zm0 0c0 5 6 5 6 5 0-5-3-6-6-5Zm4-5c0 5 6 5 6 5 0-5-3-6-6-5Z" />
    </>
  ),
  flame: (
    <path d="M12 2c1 6-4 6-4 11 0 2 1 3 2 3-1-3 3-4 3-7 5 4 7 7 5 10-3 5-12 4-13-2C3 11 10 8 12 2Z" />
  ),
  star: <path d="m12 2 3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1 3-6Z" />,
};

export function Icon({
  name,
  size = 20,
  className = "",
}: {
  name: string;
  size?: number;
  className?: string;
}) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name] || paths.heart}
    </svg>
  );
}

export function QuantityControl({
  value,
  onChange,
  name,
}: {
  value: number;
  onChange: (value: number) => void;
  name: string;
}) {
  return (
    <div className="ui-quantity">
      <button
        type="button"
        disabled={value <= 0}
        onClick={() => onChange(Math.max(0, value - 1))}
        aria-label={`Убрать один: ${name}`}
      >
        <Icon name="minus" size={16} />
      </button>
      <span aria-live="polite">{value}</span>
      <button
        type="button"
        disabled={value >= 99}
        onClick={() => onChange(value + 1)}
        aria-label={`Добавить один: ${name}`}
      >
        <Icon name="plus" size={16} />
      </button>
    </div>
  );
}

export function Dialog({
  title,
  onClose,
  children,
  drawer = false,
  wide = false,
  pageOnMobile = false,
  className = "",
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
  drawer?: boolean;
  wide?: boolean;
  /** Use document scrolling for mobile forms and the native keyboard assistant. */
  pageOnMobile?: boolean;
  className?: string;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  useLayoutEffect(() => {
    const element = dialog.current!;
    const previousFocus = document.activeElement as HTMLElement | null;
    const mobileQuery = window.matchMedia(
      "(max-width: 800px), (max-height: 500px) and (pointer: coarse)",
    );
    const scrollY = window.scrollY;
    const root = document.documentElement;
    const pageAttribute = root.getAttribute("data-ui-page-dialog");
    const bodyStyles = {
      overflow: document.body.style.overflow,
      position: document.body.style.position,
      top: document.body.style.top,
      width: document.body.style.width,
    };
    let cleanupMode = () => {};
    const configure = () => {
      const activeField = element.contains(document.activeElement)
        ? (document.activeElement as HTMLElement)
        : null;
      cleanupMode();
      const page = pageOnMobile && mobileQuery.matches;
      if (page) {
        // Keep fields in document flow: iOS's form assistant can skip fields
        // clipped by a fixed, overflowing container (WebKit bug 242060).
        element.setAttribute("data-page-dialog", "");
        root.setAttribute("data-ui-page-dialog", "");
        element.show();
        window.scrollTo({ top: 0, behavior: "instant" });
        cleanupMode = () => {
          element.close();
          element.removeAttribute("data-page-dialog");
          if (pageAttribute === null)
            root.removeAttribute("data-ui-page-dialog");
          else root.setAttribute("data-ui-page-dialog", pageAttribute);
          window.scrollTo({ top: scrollY, behavior: "instant" });
        };
      } else {
        if (mobileQuery.matches) {
          document.body.style.position = "fixed";
          document.body.style.top = `-${scrollY}px`;
          document.body.style.width = "100%";
        }
        const syncViewport = () => {
          const viewport = window.visualViewport;
          element.style.setProperty(
            "--dialog-height",
            `${viewport?.height ?? window.innerHeight}px`,
          );
          element.style.setProperty(
            "--dialog-top",
            `${viewport?.offsetTop ?? 0}px`,
          );
        };
        syncViewport();
        window.visualViewport?.addEventListener("resize", syncViewport);
        window.visualViewport?.addEventListener("scroll", syncViewport);
        window.addEventListener("resize", syncViewport);
        element.showModal();
        document.body.style.overflow = "hidden";
        cleanupMode = () => {
          element.close();
          Object.assign(document.body.style, bodyStyles);
          element.style.removeProperty("--dialog-height");
          element.style.removeProperty("--dialog-top");
          window.scrollTo({ top: scrollY, behavior: "instant" });
          window.visualViewport?.removeEventListener("resize", syncViewport);
          window.visualViewport?.removeEventListener("scroll", syncViewport);
          window.removeEventListener("resize", syncViewport);
        };
      }
      activeField?.focus({ preventScroll: true });
    };
    configure();
    if (pageOnMobile) mobileQuery.addEventListener("change", configure);
    return () => {
      cleanupMode();
      mobileQuery.removeEventListener("change", configure);
      if (previousFocus?.isConnected)
        previousFocus.focus({ preventScroll: true });
    };
  }, [pageOnMobile]);
  const content = (
    <dialog
      ref={dialog}
      className={`ui-dialog ${drawer ? "ui-dialog--drawer" : ""} ${wide ? "ui-dialog--wide" : ""} ${className}`}
      aria-labelledby={titleId}
      aria-modal="true"
      onKeyDown={(event) => {
        if (
          event.key === "Escape" &&
          event.currentTarget.hasAttribute("data-page-dialog")
        ) {
          event.preventDefault();
          onClose();
          return;
        }
        if (event.key !== "Tab") return;
        const items = Array.from(
          event.currentTarget.querySelectorAll<HTMLElement>(
            "button, a[href], input, select, textarea, [tabindex]",
          ),
        ).filter(
          (item) =>
            item.tabIndex >= 0 &&
            !item.matches(":disabled") &&
            item.getClientRects().length > 0,
        );
        const first = items[0];
        const last = items[items.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          const rect = event.currentTarget.getBoundingClientRect();
          if (
            event.clientX < rect.left ||
            event.clientX > rect.right ||
            event.clientY < rect.top ||
            event.clientY > rect.bottom
          )
            onClose();
        }
      }}
    >
      <div className="ui-dialog-header">
        <h2 id={titleId}>{title}</h2>
        <button
          className="ui-icon-button"
          onClick={onClose}
          aria-label="Закрыть окно"
          type="button"
        >
          <Icon name="close" />
        </button>
      </div>
      {children}
    </dialog>
  );
  return pageOnMobile ? createPortal(content, document.body) : content;
}

export type Tone = "neutral" | "success" | "warning" | "danger";
export function Button({
  variant = "primary",
  size = "default",
  busy = false,
  disabled,
  type = "button",
  className = "",
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "default" | "small";
  busy?: boolean;
}) {
  return (
    <button
      {...props}
      type={type}
      disabled={disabled || busy}
      aria-busy={busy || undefined}
      className={`ui-button ui-button--${variant} ui-button--${size} ${className}`}
    >
      {busy && <span className="ui-spinner" aria-hidden="true" />}
      {children}
    </button>
  );
}
export function IconButton({
  className = "",
  type = "button",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { "aria-label": string }) {
  return (
    <button {...props} type={type} className={`ui-icon-button ${className}`} />
  );
}
export function Input({
  className = "",
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`ui-input ${className}`} />;
}
export function Textarea({
  className = "",
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea {...props} className={`ui-input ui-textarea ${className}`} />
  );
}
export function Select({
  className = "",
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={`ui-input ui-select ${className}`} />;
}
export function TextField({
  label,
  error,
  hint,
  id,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  hint?: string;
}) {
  const generated = useId();
  const fieldId = id || generated;
  const description = error || hint;
  const describedBy =
    [
      props["aria-describedby"],
      description ? `${fieldId}-description` : undefined,
    ]
      .filter(Boolean)
      .join(" ") || undefined;
  return (
    <div className="ui-field">
      <label htmlFor={fieldId}>
        {label}
        {props.required && <span aria-hidden="true"> *</span>}
      </label>
      <Input
        {...props}
        id={fieldId}
        aria-invalid={error ? true : props["aria-invalid"]}
        aria-describedby={describedBy}
      />
      {description && (
        <p
          id={`${fieldId}-description`}
          className={error ? "ui-field-error" : "ui-field-hint"}
          role={error ? "alert" : undefined}
        >
          {description}
        </p>
      )}
    </div>
  );
}
export function Badge({
  tone = "neutral",
  className = "",
  ...props
}: HTMLAttributes<HTMLSpanElement> & { tone?: Tone }) {
  return (
    <span {...props} className={`ui-badge ui-tone-${tone} ${className}`} />
  );
}
export function Alert({
  tone = "neutral",
  className = "",
  ...props
}: HTMLAttributes<HTMLDivElement> & { tone?: Tone }) {
  return (
    <div
      role={tone === "danger" ? "alert" : "status"}
      {...props}
      className={`ui-alert ui-tone-${tone} ${className}`}
    />
  );
}
export function Card({
  className = "",
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={`ui-card ${className}`} />;
}
export function Table({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div
      className="ui-table-scroll"
      role="region"
      aria-label={label}
      tabIndex={0}
    >
      <table className="ui-table">
        <caption className="ui-visually-hidden">{label}</caption>
        {children}
      </table>
    </div>
  );
}
