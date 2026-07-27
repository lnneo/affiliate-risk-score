'use client';

import { RefreshCw } from 'lucide-react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

type LoadingButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  loading?: boolean;
  loadingText?: string;
  icon?: ReactNode;
  spinnerClassName?: string;
};

export default function LoadingButton({
  loading = false,
  loadingText,
  icon,
  spinnerClassName = 'h-4 w-4',
  children,
  className = '',
  disabled,
  ...props
}: LoadingButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={`${className} ${loading ? 'cursor-wait' : ''}`}
    >
      {loading ? (
        <>
          <RefreshCw className={`animate-spin shrink-0 ${spinnerClassName}`} />
          <span>{loadingText ?? children}</span>
        </>
      ) : (
        <>
          {icon}
          <span>{children}</span>
        </>
      )}
    </button>
  );
}
