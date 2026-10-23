import type { ButtonHTMLAttributes, ReactNode } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "outline" | "ghost";
  children?: ReactNode;
};

export function Button({
  variant = "default",
  className = "",
  children,
  ...rest
}: Props) {
  const variantClass =
    variant === "outline"
      ? "qip-btn qip-btn-outline"
      : variant === "ghost"
        ? "qip-btn qip-btn-ghost"
        : "qip-btn";
  return (
    <button type="button" className={`${variantClass} ${className}`.trim()} {...rest}>
      {children}
    </button>
  );
}
