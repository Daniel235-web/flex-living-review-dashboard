import { type ReactNode } from "react";

/* ═══════════════════════════════════════════════════════
   GLASS CARD — The foundation of the design system
   ═══════════════════════════════════════════════════════ */
interface CardProps {
  title?: string;
  icon?: string;
  children: ReactNode;
  className?: string;
  gradient?: string;
  glow?: "purple" | "pink" | "blue" | "emerald";
  noPad?: boolean;
}

export function Card({ title, icon, children, className = "", gradient, glow, noPad }: CardProps) {
  return (
    <div
      className={`glass rounded-2xl ${noPad ? "" : "p-6"} ${glow ? `glow-${glow}` : ""} ${className}`}
    >
      {(title || icon) && (
        <div className={`flex items-center gap-3 ${noPad ? "px-6 pt-6" : ""} mb-5`}>
          {icon && (
            <span className="text-xl w-9 h-9 rounded-xl bg-white/[0.04] flex items-center justify-center">
              {icon}
            </span>
          )}
          {title && (
            <h3
              className={`font-semibold text-[15px] tracking-tight ${
                gradient
                  ? `bg-linear-to-r ${gradient} bg-clip-text text-transparent`
                  : "text-white/90"
              }`}
            >
              {title}
            </h3>
          )}
        </div>
      )}
      <div className={noPad ? "px-6 pb-6" : ""}>{children}</div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   STAT CARD — Bento-style metric display
   ═══════════════════════════════════════════════════════ */
interface StatCardProps {
  label: string;
  value: string | number;
  icon: string;
  change?: string;
  gradient: string;
}

export function StatCard({ label, value, icon, change, gradient }: StatCardProps) {
  return (
    <div className="glass rounded-2xl p-5 group relative overflow-hidden">
      {/* Background glow orb */}
      <div
        className={`absolute -top-8 -right-8 w-24 h-24 rounded-full bg-linear-to-br ${gradient} opacity-[0.07] group-hover:opacity-[0.12] blur-2xl transition-opacity duration-500`}
      />
      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <span className="text-lg w-10 h-10 rounded-xl bg-white/[0.04] flex items-center justify-center">
            {icon}
          </span>
          {change && (
            <span className="text-[11px] font-medium text-emerald-400 bg-emerald-400/10 px-2.5 py-1 rounded-full tracking-wide">
              {change}
            </span>
          )}
        </div>
        <p
          className={`text-[22px] font-bold bg-linear-to-r ${gradient} bg-clip-text text-transparent tracking-tight`}
        >
          {value}
        </p>
        <p className="text-[13px] text-white/40 mt-1.5 tracking-wide">{label}</p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   BUTTON — Premium glass-morphic buttons
   ═══════════════════════════════════════════════════════ */
interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "danger" | "ghost";
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  type?: "button" | "submit";
  size?: "sm" | "md" | "lg";
}

export function Button({
  children,
  onClick,
  variant = "primary",
  disabled,
  loading,
  className = "",
  type = "button",
  size = "md",
}: ButtonProps) {
  const variants = {
    primary:
      "bg-linear-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white shadow-lg shadow-violet-900/25 hover:shadow-violet-900/40",
    secondary:
      "bg-white/[0.06] hover:bg-white/[0.1] text-white/80 border border-white/[0.08] hover:border-white/[0.15]",
    danger:
      "bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 hover:border-red-500/30",
    ghost:
      "hover:bg-white/[0.06] text-white/50 hover:text-white/80",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs rounded-lg",
    md: "px-5 py-2.5 text-sm rounded-xl",
    lg: "px-6 py-3 text-sm rounded-xl",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`font-medium transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.97] ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
            <circle
              className="opacity-20"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="3"
              fill="none"
            />
            <path
              className="opacity-80"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          Processing…
        </span>
      ) : (
        children
      )}
    </button>
  );
}

/* ═══════════════════════════════════════════════════════
   BADGE — Pill with subtle glow
   ═══════════════════════════════════════════════════════ */
interface BadgeProps {
  children: ReactNode;
  color?: "pink" | "purple" | "green" | "yellow" | "red" | "blue" | "gray";
}

export function Badge({ children, color = "gray" }: BadgeProps) {
  const colors = {
    pink: "bg-pink-500/10 text-pink-300 border-pink-500/20",
    purple: "bg-violet-500/10 text-violet-300 border-violet-500/20",
    green: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
    yellow: "bg-amber-500/10 text-amber-300 border-amber-500/20",
    red: "bg-red-500/10 text-red-300 border-red-500/20",
    blue: "bg-blue-500/10 text-blue-300 border-blue-500/20",
    gray: "bg-white/[0.06] text-white/50 border-white/[0.08]",
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium border tracking-wide ${colors[color]}`}
    >
      {children}
    </span>
  );
}

/* ═══════════════════════════════════════════════════════
   SECTION HEADER
   ═══════════════════════════════════════════════════════ */
interface PageHeaderProps {
  title: string;
  subtitle: string;
  icon?: string;
  action?: ReactNode;
}

export function PageHeader({ title, subtitle, icon, action }: PageHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-4 animate-fadeUp">
      <div className="flex items-center gap-4">
        {icon && (
          <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-violet-600/20 to-fuchsia-600/20 border border-violet-500/10 flex items-center justify-center text-xl">
            {icon}
          </div>
        )}
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">{title}</h1>
          <p className="text-sm text-white/40 mt-0.5">{subtitle}</p>
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   INPUT — Glass-morphic form input
   ═══════════════════════════════════════════════════════ */
interface InputProps {
  label?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
  min?: string;
  className?: string;
  mono?: boolean;
}

export function Input({ label, value, onChange, placeholder, type = "text", required, min, className = "", mono }: InputProps) {
  return (
    <div className={className}>
      {label && <label className="block text-[13px] text-white/40 mb-1.5 tracking-wide">{label}</label>}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        min={min}
        className={`w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 text-white/90 text-sm focus:outline-none input-glow transition-all placeholder:text-white/20 ${mono ? "font-mono" : ""}`}
      />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   EMPTY STATE
   ═══════════════════════════════════════════════════════ */
export function EmptyState({ icon, message }: { icon: string; message: string }) {
  return (
    <div className="text-center py-16 animate-fadeIn">
      <span className="text-4xl block mb-4 opacity-40">{icon}</span>
      <p className="text-white/30 text-sm">{message}</p>
    </div>
  );
}
