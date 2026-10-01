import React from 'react';

export interface DividerProps {
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

export const Divider: React.FC<DividerProps> = ({
  orientation = 'horizontal',
  className = '',
}) => {
  if (orientation === 'vertical') {
    return (
      <div
        role="separator"
        aria-orientation="vertical"
        className={`w-[1px] bg-[#D9D3C5] self-stretch my-1 ${className}`}
      />
    );
  }

  return (
    <hr
      role="separator"
      className={`border-0 border-t border-[#D9D3C5] w-full my-4 ${className}`}
    />
  );
};
