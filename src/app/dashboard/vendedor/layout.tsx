"use client"

/**
 * Layout para páginas de vendedor
 * Não inclui a sidebar - vendedores têm sua própria interface
 */
export default function VendedorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
