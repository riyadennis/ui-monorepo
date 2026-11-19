import type { ButtonHTMLAttributes } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
}

const baseStyle: React.CSSProperties = {
  padding: '0.5rem 1rem',
  borderRadius: 6,
  border: '1px solid transparent',
  fontSize: 14,
  fontWeight: 600,
  cursor: 'pointer',
};

const variants: Record<NonNullable<ButtonProps['variant']>, React.CSSProperties> = {
  primary: { background: '#646cff', color: '#fff' },
  secondary: { background: 'transparent', color: '#646cff', borderColor: '#646cff' },
};

export function Button({ variant = 'primary', style, ...props }: ButtonProps) {
  return <button style={{ ...baseStyle, ...variants[variant], ...style }} {...props} />;
}
