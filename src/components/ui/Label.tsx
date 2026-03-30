'use client';

import { LabelHTMLAttributes } from 'react';

interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

export function Label({ children, required, className = '', ...props }: LabelProps) {
  return (
    <label
      className={['text-sm font-medium text-gray-700', className].join(' ')}
      {...props}
    >
      {children}
      {required && <span className="ml-1 text-red-500">*</span>}
    </label>
  );
}
