'use client';

import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  function Input({ label, error, hint, className = '', id, ...props }, ref) {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-gray-700">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={[
            'block w-full rounded-md border px-3 py-2 text-sm shadow-sm',
            'placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-0',
            error
              ? 'border-red-400 focus:border-red-400 focus:ring-red-300'
              : 'border-gray-300 focus:border-blue-400 focus:ring-blue-200',
            'disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed',
            className,
          ].join(' ')}
          {...props}
        />
        {error && <p className="text-xs text-red-600">{error}</p>}
        {hint && !error && <p className="text-xs text-gray-500">{hint}</p>}
      </div>
    );
  }
);
