import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

export function Button({
  variant = "primary",
  className = "",
  children,
  ...rest
}: ButtonProps) {
  const base =
    "w-full rounded-md px-5 py-3 text-center font-body text-[15px] font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50";
  const variants: Record<Variant, string> = {
    primary: "bg-gold text-ink hover:bg-gold/90",
    secondary: "bg-transparent text-ink underline underline-offset-4 hover:text-ink/70",
  };

  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...rest}>
      {children}
    </button>
  );
}
