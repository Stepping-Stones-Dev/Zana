import React from 'react';

export interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  breadcrumbs?: React.ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  action,
  breadcrumbs,
  className = '',
}) => {
  return (
    <div className={`border-b border-gray-200 dark:border-gray-700 pb-6 mb-8 ${className}`}>
      {breadcrumbs && (
        <div className="mb-4">
          {breadcrumbs}
        </div>
      )}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            {title}
          </h1>
          {description && (
            <p className="mt-2 text-gray-600 dark:text-gray-400 max-w-2xl">
              {description}
            </p>
          )}
        </div>
        {action && (
          <div className="ml-4 flex-shrink-0">
            {action}
          </div>
        )}
      </div>
    </div>
  );
};