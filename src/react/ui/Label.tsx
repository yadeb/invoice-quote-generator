import type { LabelHTMLAttributes, ReactNode } from "react";

type Props = LabelHTMLAttributes<HTMLLabelElement> & {
  children?: ReactNode;
};

export function Label({ className = "", children, ...rest }: Props) {
  return (
    <label className={`qip-label ${className}`.trim()} {...rest}>
      {children}
    </label>
  );
}
