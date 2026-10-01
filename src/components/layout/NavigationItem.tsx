import React from 'react';
import { NavLink } from 'react-router-dom';

export interface NavigationItemProps {
  to: string;
  label: string;
  icon?: React.ReactNode;
  badge?: string;
  onClick?: () => void;
}

export const NavigationItem: React.FC<NavigationItemProps> = ({
  to,
  label,
  icon,
  badge,
  onClick,
}) => {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center justify-between px-3 py-2 text-xs font-medium rounded-[2px] transition-colors border-l-2 select-none ${
          isActive
            ? 'bg-[#FAF8F3] text-[#0F6B6E] border-[#0F6B6E] font-semibold'
            : 'text-[#5B6475] border-transparent hover:text-[#14213D] hover:bg-[#FAF8F3]/60'
        }`
      }
    >
      <div className="flex items-center gap-2.5 truncate">
        {icon && <span className="shrink-0 text-current">{icon}</span>}
        <span className="truncate">{label}</span>
      </div>
      {badge && (
        <span className="text-[10px] font-mono font-medium px-1.5 py-0.2 border border-[#D9D3C5] rounded-[2px] bg-white text-[#5B6475] shrink-0">
          {badge}
        </span>
      )}
    </NavLink>
  );
};
