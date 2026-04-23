import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  fluid?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  fluid = false,
  className = '', 
  ...props 
}) => {
  const baseClass = 'button-base';
  const variantMap: Record<string, string> = {
    primary: 'button-primary',
    secondary: 'button-secondary',
    ghost: 'button-ghost',
    danger: 'button-danger'
  };
  const variantClass = variantMap[variant] || 'button-primary';
  const fluidClass = fluid ? 'w-full' : '';
  
  return (
    <button 
      className={`${baseClass} ${variantClass} ${fluidClass} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export const Card: React.FC<{ children: React.ReactNode; className?: string; onClick?: () => void }> = ({ children, className = '', onClick }) => {
  return (
    <div className={`card-base ${className}`} onClick={onClick}>
      {children}
    </div>
  );
};

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = ({ className = '', ...props }) => {
  return (
    <input 
      className={`input-base ${className}`}
      {...props}
    />
  );
};
