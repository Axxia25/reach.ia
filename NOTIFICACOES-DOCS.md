# Sistema de Notificações em Tempo Real

Sistema completo de notificações push com Supabase Realtime, Web Notifications API e Toast notifications.

## Arquitetura

### Componentes

```
src/
├── hooks/
│   └── useNotifications.ts       - Hook principal de notificações
├── components/
│   ├── NotificationBell.tsx      - Sino de notificações no header
│   └── ui/
│       └── Toast.tsx             - Sistema de toast notifications
```

## Hook useNotifications

Hook React customizado que gerencia todo o sistema de notificações.

### Uso Básico

```typescript
import { useNotifications } from '@/hooks/useNotifications'

function MyComponent() {
  const {
    notifications,
    unreadCount,
    permission,
    requestPermission,
    markAsRead,
    markAllAsRead,
  } = useNotifications({
    vendedorName: 'João Silva', // Opcional: filtrar por vendedor
    enableSound: true,           // Opcional: ativar som
    enableWebNotifications: true, // Opcional: ativar notificações web
  })

  return (
    <div>
      <p>Notificações não lidas: {unreadCount}</p>
      {notifications.map(notif => (
        <div key={notif.id}>{notif.title}</div>
      ))}
    </div>
  )
}
```

### Opções

- **vendedorName** (string, opcional): Filtrar notificações apenas para um vendedor específico
- **enableSound** (boolean, default: true): Reproduzir som ao receber notificação
- **enableWebNotifications** (boolean, default: true): Enviar notificações do navegador

### Retorno

```typescript
{
  // Lista de notificações (ordenadas por data, mais recentes primeiro)
  notifications: Notification[]

  // Contador de notificações não lidas
  unreadCount: number

  // Status de permissão do navegador ('default' | 'granted' | 'denied')
  permission: NotificationPermission

  // Solicitar permissão de notificações
  requestPermission: () => Promise<void>

  // Adicionar notificação manualmente
  addNotification: (notification) => Notification

  // Marcar notificação como lida
  markAsRead: (id: string) => void

  // Marcar todas como lidas
  markAllAsRead: () => void

  // Limpar notificações antigas (>24h)
  clearOldNotifications: () => void
}
```

### Tipo Notification

```typescript
interface Notification {
  id: string
  type: 'new_lead' | 'lead_update' | 'system'
  title: string
  message: string
  lead_id?: number
  lead_name?: string
  vendedor?: string
  timestamp: Date
  read: boolean
}
```

## Componente NotificationBell

Sino de notificações com dropdown de lista de notificações.

### Uso

```typescript
import NotificationBell from '@/components/NotificationBell'

function Header() {
  return (
    <header>
      <NotificationBell vendedorName="João Silva" />
    </header>
  )
}
```

### Props

- **vendedorName** (string, opcional): Filtrar notificações por vendedor
- **className** (string, opcional): Classes CSS adicionais

### Funcionalidades

- Badge com contador de não lidas
- Dropdown com lista de notificações
- Marcar individualmente como lida
- Marcar todas como lidas
- Timestamps relativos ("5m atrás", "2h atrás")
- Botão para solicitar permissão de notificações
- Auto-fechar ao clicar fora

## Realtime Subscriptions

O hook automaticamente se inscreve no canal de Realtime do Supabase para monitorar mudanças na tabela `leads`.

### Eventos Monitorados

```typescript
// INSERT na tabela leads
channel.on('postgres_changes', {
  event: 'INSERT',
  schema: 'public',
  table: 'leads',
}, (payload) => {
  // Novo lead detectado
  // Envia notificação push + toast + som
})
```

### Filtros

Se `vendedorName` for fornecido, apenas leads atribuídos a esse vendedor geram notificações.

## Web Notifications API

Solicita permissão do usuário para enviar notificações do navegador.

### Permissões

- **default**: Ainda não foi solicitado
- **granted**: Usuário permitiu
- **denied**: Usuário negou

### Comportamento

- Solicita automaticamente permissão ao usar o hook
- Exibe botão "Ativar notificações" se não concedido
- Notificações aparecem mesmo com navegador em segundo plano
- Auto-fecham após 5 segundos
- Ao clicar, foca a janela do navegador

## Sistema de Som

Sons de notificação gerados com Web Audio API (2 tons).

### Características

- Som simples e não intrusivo (2 beeps curtos)
- Frequências: 800Hz e 1000Hz
- Duração: 100ms cada
- Volume: 30%
- Pode ser desativado com `enableSound: false`

## Toast Notifications

Integrado com o sistema de Toast do Design System.

### Tipos de Toast

- **info**: Notificações gerais (padrão para novos leads)
- **success**: Ações bem-sucedidas
- **error**: Erros
- **warning**: Avisos

### Comportamento

- Aparecem no canto superior direito
- Auto-dismiss após 5 segundos
- Animação de entrada/saída suave
- Empilhamento vertical
- Botão de fechar manual

## Integração com ToastProvider

O `ToastProvider` deve estar no layout raiz da aplicação:

```typescript
// app/layout.tsx
import { ToastProvider } from '@/components/ui/Toast'

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

## Limpeza Automática

- Notificações antigas (>24h) são removidas automaticamente
- Executa a cada 1 hora
- Previne acúmulo excessivo de notificações

## Exemplos de Uso

### Dashboard Gerencial (Todos os Leads)

```typescript
// Recebe notificações de todos os vendedores
function DashboardPage() {
  const { unreadCount } = useNotifications()

  return (
    <header>
      <NotificationBell />
      {unreadCount > 0 && <span>({unreadCount})</span>}
    </header>
  )
}
```

### Dashboard do Vendedor (Apenas Seus Leads)

```typescript
// Recebe apenas notificações dos próprios leads
function VendedorDashboard() {
  const vendedorName = "João Silva"

  return (
    <header>
      <NotificationBell vendedorName={vendedorName} />
    </header>
  )
}
```

### Notificação Manual Customizada

```typescript
function MyComponent() {
  const { addNotification } = useNotifications()

  const handleAction = () => {
    addNotification({
      type: 'system',
      title: 'Ação Concluída',
      message: 'Operação realizada com sucesso!',
    })
  }

  return <button onClick={handleAction}>Executar</button>
}
```

## Suporte a Navegadores

### Web Notifications

- Chrome/Edge: ✅ Suportado
- Firefox: ✅ Suportado
- Safari: ✅ Suportado (iOS 16.4+)
- Opera: ✅ Suportado

### Web Audio API

- Chrome/Edge: ✅ Suportado
- Firefox: ✅ Suportado
- Safari: ✅ Suportado
- Opera: ✅ Suportado

## Troubleshooting

### Notificações não aparecem

1. Verificar se permissão foi concedida
2. Verificar configurações do navegador
3. Verificar se site está em HTTPS (obrigatório)

### Som não reproduz

1. Verificar se navegador permite autoplay
2. Verificar volume do sistema
3. Testar com `enableSound: true`

### Realtime não funciona

1. Verificar conexão com Supabase
2. Verificar configuração de Realtime no Supabase
3. Verificar RLS policies da tabela `leads`

## Performance

- **Lightweight**: ~10KB gzipped
- **Eficiente**: Usa Realtime ao invés de polling
- **Otimizado**: Limpeza automática de notificações antigas
- **Responsivo**: Animações GPU-aceleradas

## Segurança

- Notificações respeitam RLS policies do Supabase
- Filtros por vendedor aplicados no cliente E servidor
- Não expõe dados sensíveis em notificações Web
- Auto-cleanup previne vazamento de memória

---

**Versão**: 1.0
**Data**: 2025-10-27
**Status**: ✅ Implementado
