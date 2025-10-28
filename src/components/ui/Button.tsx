/**
 * Button Component - Design System
 * Componente de botão padronizado com múltiplas variantes
 */

import React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { Loader2 } from 'lucide-react'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success'
  size?: 'sm' | 'md' | 'lg' | 'icon'
  loading?: boolean
  icon?: React.ReactNode
  fullWidth?: boolean
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      loading = false,
      icon,
      fullWidth = false,
      asChild = false,
      disabled,
      className = '',
      ...props
    },
    ref
  ) => {
    // Variantes de estilo
    const variants = {
      primary: 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 disabled:bg-blue-300',
      secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 active:bg-gray-400 disabled:bg-gray-100 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600',
      ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 active:bg-gray-200 disabled:bg-transparent dark:text-gray-300 dark:hover:bg-gray-800',
      danger: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 disabled:bg-red-300',
      success: 'bg-green-600 text-white hover:bg-green-700 active:bg-green-800 disabled:bg-green-300',
    }

    // Tamanhos
    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg',
      icon: 'h-9 w-9 p-0',
    }

    const baseStyles = 'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60'

    const widthStyles = fullWidth ? 'w-full' : ''

    const Comp = asChild ? Slot : 'button'

    return (
      <Comp
        ref={ref}
        disabled={disabled || loading}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${widthStyles} ${className}`}
        {...props}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {!loading && icon && <span className="flex items-center">{icon}</span>}
        {children}
      </Comp>
    )
  }
)

Button.displayName = 'Button'

export { Button }
export default Button
