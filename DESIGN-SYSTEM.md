# Design System - CRM Dashboard

Sistema completo de componentes UI reutilizáveis e padronizados.

## Estrutura

```
src/components/ui/
├── Button.tsx       - Botões com múltiplas variantes
├── Input.tsx        - Inputs com validação visual
├── Select.tsx       - Select customizado e acessível
├── Modal.tsx        - Modal base com overlay
├── Toast.tsx        - Sistema de notificações
├── Card.tsx         - Container padronizado
├── Badge.tsx        - Badges de status
└── index.ts         - Exportação centralizada
```

## Componentes

### Button

Botão padronizado com múltiplas variantes e estados.

**Variantes:**
- `primary` - Ação principal (azul)
- `secondary` - Ação secundária (cinza)
- `ghost` - Botão transparente
- `danger` - Ações destrutivas (vermelho)
- `success` - Ações de sucesso (verde)

**Tamanhos:**
- `sm` - Pequeno
- `md` - Médio (padrão)
- `lg` - Grande

**Props:**
- `loading` - Mostra spinner e desabilita o botão
- `icon` - Adiciona ícone antes do texto
- `fullWidth` - Ocupa toda a largura disponível
- `disabled` - Desabilita o botão

**Exemplo:**
```tsx
import { Button } from '@/components/ui'
import { Save } from 'lucide-react'

<Button variant="primary" size="md" loading={false}>
  Salvar
</Button>

<Button variant="danger" icon={<Save />}>
  Salvar com ícone
</Button>
```

---

### Input

Input padronizado com validação visual e suporte a ícones.

**Props:**
- `label` - Rótulo do input
- `error` - Mensagem de erro (mostra ícone vermelho)
- `success` - Mensagem de sucesso (mostra ícone verde)
- `helperText` - Texto de ajuda
- `icon` - Ícone à esquerda
- `type="password"` - Adiciona botão de mostrar/esconder senha
- `fullWidth` - Ocupa toda a largura

**Exemplo:**
```tsx
import { Input } from '@/components/ui'
import { Mail } from 'lucide-react'

<Input
  label="Email"
  type="email"
  placeholder="seu@email.com"
  icon={<Mail className="h-5 w-5" />}
  helperText="Digite seu email corporativo"
/>

<Input
  label="Senha"
  type="password"
  error="Senha deve ter no mínimo 8 caracteres"
/>
```

---

### Select

Select customizado com validação visual.

**Props:**
- `label` - Rótulo do select
- `options` - Array de opções `{ value, label, disabled? }`
- `placeholder` - Texto placeholder
- `error` - Mensagem de erro
- `success` - Mensagem de sucesso
- `helperText` - Texto de ajuda
- `onChange` - Callback com o valor selecionado
- `fullWidth` - Ocupa toda a largura

**Exemplo:**
```tsx
import { Select } from '@/components/ui'

const options = [
  { value: '7', label: 'Últimos 7 dias' },
  { value: '30', label: 'Últimos 30 dias' },
  { value: '90', label: 'Últimos 90 dias' },
]

<Select
  label="Período"
  options={options}
  placeholder="Selecione um período"
  onChange={(value) => console.log(value)}
/>
```

---

### Modal

Modal base com overlay, animação e controle de teclado (ESC para fechar).

**Props:**
- `isOpen` - Controla visibilidade
- `onClose` - Callback ao fechar
- `title` - Título do modal
- `footer` - Conteúdo do rodapé (botões)
- `size` - Tamanho: `sm`, `md`, `lg`, `xl`, `full`
- `closeOnOverlayClick` - Permite fechar clicando fora (padrão: true)
- `showCloseButton` - Mostra botão X (padrão: true)

**Hook auxiliar:**
```tsx
import { Modal, useModal, Button } from '@/components/ui'

function MyComponent() {
  const modal = useModal() // { isOpen, open, close, toggle }

  return (
    <>
      <Button onClick={modal.open}>Abrir Modal</Button>

      <Modal
        isOpen={modal.isOpen}
        onClose={modal.close}
        title="Título do Modal"
        size="md"
        footer={
          <>
            <Button variant="ghost" onClick={modal.close}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={modal.close}>
              Confirmar
            </Button>
          </>
        }
      >
        <p>Conteúdo do modal aqui...</p>
      </Modal>
    </>
  )
}
```

---

### Toast

Sistema completo de notificações toast com animação.

**Tipos:**
- `success` - Sucesso (verde)
- `error` - Erro (vermelho)
- `warning` - Aviso (amarelo)
- `info` - Informação (azul)

**Setup:**
```tsx
// app/layout.tsx
import { ToastProvider } from '@/components/ui'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  )
}
```

**Uso:**
```tsx
import { useToast, createToastHelpers, Button } from '@/components/ui'

function MyComponent() {
  const { addToast } = useToast()
  const toast = createToastHelpers(addToast)

  const handleClick = () => {
    toast.success('Sucesso!', 'Lead salvo com sucesso')
    toast.error('Erro!', 'Falha ao salvar lead')
    toast.warning('Atenção!', 'Preencha todos os campos')
    toast.info('Informação', 'Dados carregados')
  }

  return <Button onClick={handleClick}>Mostrar Toast</Button>
}
```

---

### Card

Container padronizado com sub-componentes.

**Variantes:**
- `default` - Card padrão com borda
- `outlined` - Apenas borda (sem fundo)
- `elevated` - Com sombra elevada

**Padding:**
- `none` - Sem padding
- `sm` - Padding pequeno
- `md` - Padding médio (padrão)
- `lg` - Padding grande

**Props:**
- `hoverable` - Adiciona efeito hover com elevação

**Sub-componentes:**
- `CardHeader` - Cabeçalho do card
- `CardTitle` - Título
- `CardDescription` - Descrição
- `CardContent` - Conteúdo principal
- `CardFooter` - Rodapé

**Exemplo:**
```tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, Button } from '@/components/ui'

<Card variant="elevated" hoverable>
  <CardHeader>
    <CardTitle>Título do Card</CardTitle>
    <CardDescription>Descrição do conteúdo</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Conteúdo principal aqui...</p>
  </CardContent>
  <CardFooter>
    <Button variant="primary">Ação</Button>
  </CardFooter>
</Card>
```

---

### Badge

Badge para status, tags e contadores.

**Variantes:**
- `default` - Cinza
- `primary` - Azul
- `success` - Verde
- `warning` - Amarelo
- `danger` - Vermelho
- `info` - Ciano
- `outline` - Transparente com borda

**Tamanhos:**
- `sm` - Pequeno
- `md` - Médio (padrão)
- `lg` - Grande

**Props:**
- `dot` - Adiciona dot animado antes do texto

**Exemplo:**
```tsx
import { Badge } from '@/components/ui'

<Badge variant="success">Ativo</Badge>
<Badge variant="danger" dot>Offline</Badge>
<Badge variant="primary" size="lg">Premium</Badge>
<Badge variant="outline">Tag</Badge>
```

---

## Importação

Todos os componentes podem ser importados de forma centralizada:

```tsx
import {
  Button,
  Input,
  Select,
  Modal,
  useModal,
  ToastProvider,
  useToast,
  createToastHelpers,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Badge,
} from '@/components/ui'
```

---

## Temas

Todos os componentes suportam **dark mode** automaticamente via Tailwind CSS e `next-themes`.

Cores principais:
- `primary` - Azul (#3B82F6)
- `success` - Verde (#10B981)
- `warning` - Amarelo (#F59E0B)
- `danger` - Vermelho (#EF4444)
- `info` - Ciano (#06B6D4)

---

## Acessibilidade

Todos os componentes seguem práticas de acessibilidade:
- Suporte completo a teclado
- Labels e IDs únicos automáticos
- ARIA attributes apropriados
- Foco visível
- Contraste de cores WCAG AA

---

## Boas Práticas

1. **Sempre use componentes do Design System** ao invés de criar estilos inline
2. **Mantenha consistência** usando as mesmas variantes para ações similares
3. **Validação visual** - Use `error` e `success` props para feedback imediato
4. **Loading states** - Use `loading` prop em botões durante operações async
5. **Toast para feedback** - Sempre mostre toast após ações importantes
6. **Modal para confirmações** - Use modais para ações destrutivas ou importantes

---

## Exemplo Completo

```tsx
'use client'

import { useState } from 'react'
import {
  Button,
  Input,
  Select,
  Modal,
  useModal,
  useToast,
  createToastHelpers,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  Badge,
} from '@/components/ui'
import { User, Mail } from 'lucide-react'

export default function ExamplePage() {
  const modal = useModal()
  const { addToast } = useToast()
  const toast = createToastHelpers(addToast)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    setLoading(true)
    // Simular request
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setLoading(false)
    modal.close()
    toast.success('Sucesso!', 'Dados salvos com sucesso')
  }

  return (
    <div className="p-6">
      <Card variant="elevated">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Cadastro de Usuário</CardTitle>
            <Badge variant="success" dot>
              Ativo
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Input
              label="Nome"
              placeholder="Digite seu nome"
              icon={<User className="h-5 w-5" />}
            />
            <Input
              label="Email"
              type="email"
              placeholder="seu@email.com"
              icon={<Mail className="h-5 w-5" />}
            />
            <Select
              label="Função"
              options={[
                { value: 'VENDEDOR', label: 'Vendedor' },
                { value: 'GERENTE', label: 'Gerente' },
                { value: 'ADMIN', label: 'Administrador' },
              ]}
              placeholder="Selecione uma função"
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="ghost">Cancelar</Button>
          <Button variant="primary" onClick={modal.open}>
            Salvar
          </Button>
        </CardFooter>
      </Card>

      <Modal
        isOpen={modal.isOpen}
        onClose={modal.close}
        title="Confirmar Cadastro"
        footer={
          <>
            <Button variant="ghost" onClick={modal.close}>
              Cancelar
            </Button>
            <Button variant="primary" loading={loading} onClick={handleSubmit}>
              Confirmar
            </Button>
          </>
        }
      >
        <p>Tem certeza que deseja salvar este cadastro?</p>
      </Modal>
    </div>
  )
}
```

---

**Versão**: 1.0
**Data**: 2025-10-27
**Status**: ✅ Implementado
