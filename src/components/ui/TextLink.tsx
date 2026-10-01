import React from 'react';
import { Link as RouterLink, LinkProps as RouterLinkProps } from 'react-router-dom';

export interface TextLinkProps extends RouterLinkProps {
  external?: boolean;
}

export const TextLink: React.FC<TextLinkProps> = ({
  to,
  external = false,
  className = '',
  children,
  ...props
}) => {
  const linkClasses = `text-[#0F6B6E] hover:text-[#0c575a] underline decoration-[#0F6B6E]/40 hover:decoration-[#0F6B6E] underline-offset-4 transition-colors font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0F6B6E] rounded-[2px] ${className}`;

  if (external || (typeof to === 'string' && (to.startsWith('http://') || to.startsWith('https://')))) {
    return (
      <a
        href={to.toString()}
        target="_blank"
        rel="noopener noreferrer"
        className={linkClasses}
      >
        {children}
      </a>
    );
  }

  return (
    <RouterLink to={to} className={linkClasses} {...props}>
      {children}
    </RouterLink>
  );
};
