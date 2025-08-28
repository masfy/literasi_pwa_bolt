import React from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helper?: string;
}

const Textarea: React.FC<TextareaProps> = ({ 
  label, 
  error, 
  helper, 
  className = '',
  ...props 
}) => {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <textarea
        className={`
          block w-full px-3 py-2 border rounded-lg shadow-sm placeholder-gray-400 
          focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 
          transition-colors resize-vertical
          ${error ? 'border-red-300' : 'border-gray-300'}
          ${className}
        `}
        {...props}
      />
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
      {helper && !error && (
        <p className="text-sm text-gray-500">{helper}</p>
      )}
    </div>
  );
};

export default Textarea;