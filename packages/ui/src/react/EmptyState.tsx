import React from 'react';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  className = '',
}) => {
  return (
    <div className={`text-center py-12 px-6 ${className}`}>
      {icon && (
        <div className="flex justify-center mb-4 text-6xl opacity-60">
          {icon}
        </div>
      )}
      <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
        {title}
      </h3>
      {description && (
        <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
          {description}
        </p>
      )}
      {action && <div>{action}</div>}
    </div>
  );
};