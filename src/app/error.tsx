'use client'

import { useEffect } from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log error to monitoring service
    console.error('Dashboard error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-card p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-danger-100 rounded-full mb-6">
            <AlertTriangle className="w-8 h-8 text-danger-500" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Oops! Algo deu errado
          </h1>
          
          <p className="text-gray-600 mb-8">
            Ocorreu um erro inesperado. Tente recarregar a página ou volte para o início.
          </p>
          
          <div className="space-y-3">
            <button
              onClick={reset}
              className="w-full bg-primary-500 text-white py-3 px-4 rounded-xl font-medium hover:bg-primary-600 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all flex items-center justify-center space-x-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Tentar novamente</span>
            </button>
            
            <button
              onClick={() => window.location.href = '/'}
              className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-xl font-medium hover:bg-gray-200 transition-all flex items-center justify-center space-x-2"
            >
              <Home className="w-4 h-4" />
              <span>Voltar ao início</span>
            </button>
          </div>
          
          {process.env.NODE_ENV === 'development' && (
            <details className="mt-8 text-left">
              <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                Detalhes do erro (desenvolvimento)
              </summary>
              <pre className="mt-2 p-4 bg-gray-100 rounded-lg text-xs text-gray-700 overflow-auto">
                {error.message}
              </pre>
            </details>
          )}
        </div>
      </div>
    </div>
  )
}
