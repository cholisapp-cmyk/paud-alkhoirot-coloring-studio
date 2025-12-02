import React from 'react';

interface CategoryButtonProps {
  label: string;
  icon: React.ReactNode;
  selected: boolean;
  onClick: () => void;
  colorClass: string;
}

export const CategoryButton: React.FC<CategoryButtonProps> = ({ 
  label, 
  icon, 
  selected, 
  onClick,
  colorClass
}) => {
  return (
    <button
      onClick={onClick}
      className={`
        flex flex-col items-center justify-center p-4 rounded-xl transition-all duration-300 transform
        ${selected 
          ? `bg-white shadow-lg scale-105 ring-4 ring-offset-2 ${colorClass}` 
          : 'bg-white/80 hover:bg-white hover:shadow-md hover:scale-105 text-slate-500'
        }
      `}
    >
      <div className={`mb-2 ${selected ? 'text-current' : 'text-slate-400'}`}>
        {icon}
      </div>
      <span className="font-display font-semibold text-sm">{label}</span>
    </button>
  );
};