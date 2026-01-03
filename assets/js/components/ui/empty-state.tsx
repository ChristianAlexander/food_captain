import React from 'react';

interface EmptyStateProps {
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  action,
}) => {
  return (
    <div className="text-center py-12">
      
      {/* Title */}
      <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-3">
        {title}
      </h3>
      
      {/* Description */}
      <p className="text-slate-600 dark:text-slate-300 mb-8 max-w-md mx-auto">
        {description}
      </p>
      
      {/* Action */}
      {action && (
        <button
          onClick={action.onClick}
          className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
        >
          {action.label}
        </button>
      )}
    </div>
  );
};