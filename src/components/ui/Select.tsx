/**
 * Select Component - Design System
 * Componente de select customizado e acessível
 */

import React from 'react'
import { ChevronDown, AlertCircle, CheckCircle } from 'lucide-react'

export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  label?: string
  error?: string
  success?: string
  helperText?: string
  options: SelectOption[]
  placeholder?: string
  fullWidth?: boolean
  onChange?: (value: string) => void
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      error,
      success,
      helperText,
      options,
      placeholder,
      fullWidth = false,
      className = '',
      disabled,
      id,
      onChange,
      value,
      ...props
    },
    ref
  ) => {
    const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`

    // Estados visuais
    const hasError = !!error
    const hasSuccess = !!success

    // Estilos base
    const baseStyles = 'w-full px-4 py-2 pr-10 text-base border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60 disabled:bg-gray-100 dark:disabled:bg-gray-800 appearance-none cursor-pointer'

    // Estilos de estado
    const stateStyles = hasError
      ? 'border-red-500 focus:border-red-500 focus:ring-red-500/50'
      : hasSuccess
      ? 'border-green-500 focus:border-green-500 focus:ring-green-500/50'
      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500/50 dark:border-gray-700 dark:focus:border-blue-500'

    const widthStyles = fullWidth ? 'w-full' : ''

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      if (onChange) {
        onChange(e.target.value)
      }
    }

    return (
      <div className={`${widthStyles}`}>
        {label && (
          <label
            htmlFor={selectId}
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
          >
            {label}
          </label>
        )}

        <div className="relative">
          {/* Select */}
          <select
            ref={ref}
            id={selectId}
            disabled={disabled}
            value={value}
            onChange={handleChange}
            className={`${baseStyles} ${stateStyles} ${className} dark:bg-gray-900 dark:text-gray-100`}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option key={option.value} value={option.value} disabled={option.disabled}>
                {option.label}
              </option>
            ))}
          </select>

          {/* Ícone dropdown */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            <ChevronDown className="h-5 w-5" />
          </div>

          {/* Ícone de erro */}
          {hasError && (
            <div className="absolute right-10 top-1/2 -translate-y-1/2 text-red-500">
              <AlertCircle className="h-5 w-5" />
            </div>
          )}

          {/* Ícone de sucesso */}
          {hasSuccess && (
            <div className="absolute right-10 top-1/2 -translate-y-1/2 text-green-500">
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

Select.displayName = 'Select'

export default Select
