import { FormHTMLAttributes } from "react";

interface FormLayoutProps extends FormHTMLAttributes<HTMLFormElement> {
  title?: string;
}

export function FormLayout({ title, children, className = "", ...props }: FormLayoutProps) {
  return (
    <form className={`space-y-4 ${className}`} {...props}>
      {title && <h2 className="text-lg font-semibold text-foreground">{title}</h2>}
      {children}
    </form>
  );
}
