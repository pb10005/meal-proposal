import React from 'react';

type TagColor = 'amber' | 'orange' | 'green' | 'blue' | 'purple' | 'gray';

interface TagProps {
  children: React.ReactNode;
  color?: TagColor;
  className?: string;
}

const colorClasses: Record<TagColor, string> = {
  amber: 'bg-amber-100 text-amber-800',
  orange: 'bg-orange-100 text-orange-800',
  green: 'bg-green-100 text-green-800',
  blue: 'bg-blue-100 text-blue-800',
  purple: 'bg-purple-100 text-purple-800',
  gray: 'bg-gray-100 text-gray-700',
};

export function Tag({ children, color = 'amber', className = '' }: TagProps) {
  return (
    <span
      className={[
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        colorClasses[color],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </span>
  );
}
