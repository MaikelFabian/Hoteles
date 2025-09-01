import React from 'react';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

const Loading: React.FC<LoadingProps> = ({ size = 'md', text }) => {
  const sizeClasses = {
    sm: 'spinner-border-sm',
    md: '',
    lg: ''
  };

  const containerSize = {
    sm: 'py-3',
    md: 'py-4',
    lg: 'py-5'
  };

  return (
    <div className={`d-flex flex-column align-items-center justify-content-center ${containerSize[size]}`}>
      <div className={`spinner-border text-primary ${sizeClasses[size]}`} role="status">
        <span className="visually-hidden">Cargando...</span>
      </div>
      {text && (
        <p className="mt-2 text-muted small">{text}</p>
      )}
    </div>
  );
};

export default Loading;