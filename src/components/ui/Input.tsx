/**
 * Input Component - Design System
 * Componente de input padronizado com validação visual
 */

import React from 'react'
import { AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  success?: string
  helperText?: string
  icon?: React.ReactNode
  fullWidth?: boolean
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      success,
      helperText,
      icon,
      fullWidth = false,
      type = 'text',
      className = '',
      disabled,
      id,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = React.useState(false)
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`

    // Estados visuais
    const hasError = !!error
    const hasSuccess = !!success

    // Estilos base
    const baseStyles = 'w-full px-4 py-2 text-base border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60 disabled:bg-gray-100 dark:disabled:bg-gray-800'

    // Estilos de estado
    const stateStyles = hasError
      ? 'border-red-500 focus:border-red-500 focus:ring-red-500/50'
      : hasSuccess
      ? 'border-green-500 focus:border-green-500 focus:ring-green-500/50'
      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500/50 dark:border-gray-700 dark:focus:border-blue-500'

    // Estilos de ícone
    const iconPaddingStyles = icon ? 'pl-11' : ''
    const passwordIconPaddingStyles = type === 'password' ? 'pr-11' : ''

    const widthStyles = fullWidth ? 'w-full' : ''

    const inputType = type === 'password' && showPassword ? 'text' : type

    return (
      <div className={`${widthStyles}`}>
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
          >
            {label}
          </label>
        )}

        <div className="relative">
          {/* Ícone à esquerda */}
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
              {icon}
            </div>
          )}

          {/* Input */}
          <input
            ref={ref}
            id={inputId}
            type={inputType}
            disabled={disabled}
            className={`${baseStyles} ${stateStyles} ${iconPaddingStyles} ${passwordIconPaddingStyles} ${className} dark:bg-gray-900 dark:text-gray-100`}
            {...props}
          />

          {/* Ícone de mostrar/esconder senha */}
          {type === 'password' && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          )}

          {/* Ícone de erro */}
          {hasError && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500">
              <AlertCircle className="h-5 w-5" />
            </div>
          )}

          {/* Ícone de sucesso */}
          {hasSuccess && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500">
              <CheckCircle className="h-5 w-5" />
            </div>
          )}
        </div>

        {/* Mensagens de ajuda/erro/sucesso */}
        {(error || success || helperText) && (
          <div className="mt-1.5 text-sm">
            {error && <p className="text-red-600 dark:text-red-400">{error}</p>}
            {success && <p className="text-green-600 dark:text-green-400">{success}</p>}
            {!error && !success && helperText && (
              <p className="text-gray-500 dark:text-gray-400">{helperText}</p>
            )}
          </div>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export default Input
