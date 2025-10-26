# Gestão de Erros Centralizada - Documentação

## 📋 Visão Geral

Sistema completo de gestão de erros centralizada com classes customizadas, logging estruturado, monitoramento de métricas e tratamento consistente em toda a aplicação.

## ✅ O que foi implementado

### 1. Classes de Erro Customizadas (`src/lib/errors/custom-errors.ts`)

Hierarquia completa de erros para todos os cenários da aplicação:

#### Erros HTTP

| Classe | Status Code | Uso |
|--------|-------------|-----|
| `BadRequestError` | 400 | Requisição inválida |
| `UnauthorizedError` | 401 | Não autenticado |
| `ForbiddenError` | 403 | Sem permissão |
| `NotFoundError` | 404 | Recurso não encontrado |
| `ConflictError` | 409 | Conflito (ex: email já existe) |
| `ValidationError` | 422 | Erro de validação de negócio |
| `RateLimitError` | 429 | Rate limit excedido |
| `InternalServerError` | 500 | Erro interno |
| `ServiceUnavailableError` | 503 | Serviço indisponível |

#### Erros Específicos

| Classe | Descrição |
|--------|-----------|
| `DatabaseError` | Erros do banco de dados |
| `AuthenticationError` | Problemas de autenticação |
| `AuthorizationError` | Problemas de autorização |
| `TimeoutError` | Operação excedeu timeout |
| `ExternalAPIError` | Falha em API externa |

**Exemplo de uso**:
```typescript
import { UnauthorizedError, NotFoundError } from '@/lib/errors'

// Lançar erro
if (!session) {
  throw new UnauthorizedError('Você precisa estar autenticado')
}

// Erro com detalhes
if (!lead) {
  throw new NotFoundError('Lead não encontrado', { leadId: 123 })
}
```

### 2. Handler Centralizado (`src/lib/errors/error-handler.ts`)

#### `handleError(error, path)` - Handler principal
Trata qualquer erro e retorna NextResponse formatado:

```typescript
import { handleError } from '@/lib/errors'

try {
  // código que pode falhar
} catch (error) {
  return handleError(error, '/api/leads')
}
```

**Resposta gerada**:
```json
{
  "success": false,
  "error": {
    "message": "Você precisa estar autenticado",
    "code": "UNAUTHORIZED",
    "statusCode": 401,
    "timestamp": "2025-10-26T19:00:00Z",
    "path": "/api/leads",
    "requestId": "req_1234567890_abc123"
  }
}
```

#### `asyncHandler(handler)` - Wrapper para API routes
Cap tura erros automaticamente:

```typescript
import { asyncHandler } from '@/lib/errors'

export const GET = asyncHandler(async (request) => {
  // Se erro for lançado, asyncHandler captura e formata automaticamente
  const data = await fetchData()
  return NextResponse.json(data)
})
```

#### `withErrorHandling(handler)` - Alternativa
Para handlers síncronos e assíncronos:

```typescript
import { withErrorHandling } from '@/lib/errors'

export const POST = withErrorHandling(async (request) => {
  // ...
})
```

### 3. Logger Centralizado (`src/lib/errors/logger.ts`)

Sistema de logging estruturado com níveis e cores:

#### Níveis de Log

| Nível | Uso | Cor | Ícone |
|-------|-----|-----|-------|
| `ERROR` | Erros críticos | Vermelho | ❌ |
| `WARN` | Avisos | Amarelo | ⚠️ |
| `INFO` | Informações | Ciano | ℹ️ |
| `DEBUG` | Debug (dev only) | Magenta | 🐛 |

**Exemplo de uso**:
```typescript
import { logger } from '@/lib/errors'

logger.error('Falha ao conectar ao banco', {
  database: 'postgres',
  host: 'localhost',
  error: err.message
})

logger.warn('Taxa de requisições alta', {
  current: 150,
  threshold: 100
})

logger.info('Usuário logado', {
  userId: '123',
  email: 'user@example.com'
})

logger.debug('Query executada', {
  query: 'SELECT * FROM leads',
  duration: '45ms'
})
```

#### Métodos Especializados

**`httpRequest(method, path, statusCode, duration)`**
```typescript
logger.httpRequest('GET', '/api/leads', 200, 45)
// Output: ℹ️ [INFO] 2025-10-26T19:00:00Z - HTTP GET /api/leads
//   Context: { method: 'GET', path: '/api/leads', statusCode: 200, duration: '45ms' }
```

**`auth(action, userId, success)`**
```typescript
logger.auth('login', 'user123', true)
logger.auth('login_failed', 'user456', false)
```

**`performance(operation, duration, metadata)`**
```typescript
logger.performance('database_query', 1200, { query: 'SELECT *' })
// WARN se > 1000ms
```

**`dbQuery(query, duration, error?)`**
```typescript
logger.dbQuery('SELECT * FROM leads WHERE id = $1', 45)
logger.dbQuery('INSERT INTO leads...', 120, new Error('Conflict'))
```

#### Logger Filho (com contexto)
```typescript
const requestLogger = logger.child({ requestId: 'abc123', userId: '456' })
requestLogger.info('Processando requisição')
// Automaticamente inclui requestId e userId em todos os logs
```

### 4. Monitoramento de Erros (`src/lib/errors/monitoring.ts`)

Sistema de métricas e monitoramento em tempo real:

#### Métricas Coletadas

- **Total de erros**
- **Erros por tipo** (UnauthorizedError, NotFoundError, etc.)
- **Erros por código** (UNAUTHORIZED, NOT_FOUND, etc.)
- **Erros por status HTTP** (400, 401, 404, 500, etc.)
- **Últimos 100 erros** com timestamps

**Uso**:
```typescript
import { trackError, errorMonitor } from '@/lib/errors/monitoring'

try {
  // código
} catch (error) {
  trackError(error) // Registra no monitor
  throw error
}

// Ver métricas
const metrics = errorMonitor.getMetrics()
console.log(metrics.totalErrors) // 42
console.log(metrics.errorsByType) // { UnauthorizedError: 15, NotFoundError: 10, ... }
```

#### Health Check
```typescript
import { getSystemHealth } from '@/lib/errors/monitoring'

const health = getSystemHealth()
// {
//   status: 'healthy' | 'degraded' | 'unhealthy',
//   details: {
//     totalErrors: 42,
//     recentErrors: 5,
//     errorRateHigh: false,
//     mostCommonError: { type: 'UnauthorizedError', count: 15 }
//   }
// }
```

**Critérios**:
- `healthy`: < 5 erros recentes (5 min)
- `degraded`: 5-10 erros recentes
- `unhealthy`: > 10 erros/min OU > 100 erros total

#### Relatório de Erros
```typescript
import { generateErrorReport } from '@/lib/errors/monitoring'

console.log(generateErrorReport())
```

**Output**:
```
========================================
RELATÓRIO DE ERROS
========================================

Status do Sistema: HEALTHY
Total de Erros: 42
Tipos de Erro Únicos: 5

Erro Mais Comum:
  Tipo: UnauthorizedError
  Ocorrências: 15

Código de Erro Mais Comum:
  Código: UNAUTHORIZED
  Ocorrências: 15

Distribuição por Tipo:
  UnauthorizedError: 15
  NotFoundError: 10
  ValidationError: 8
  BadRequestError: 6
  InternalServerError: 3

Distribuição por Status Code:
  401: 15
  404: 10
  422: 8
  400: 6
  500: 3

Últimos 10 Erros:
  1. [2025-10-26T19:00:00Z] UnauthorizedError: Token inválido
     Código: UNAUTHORIZED (Status: 401)
  ...
========================================
```

#### Alertas
```typescript
import { configureAlerts, checkAlerts } from '@/lib/errors/monitoring'

// Configurar
configureAlerts({
  errorRateThreshold: 10, // 10 erros/minuto
  onAlert: (message, details) => {
    console.error(`ALERTA: ${message}`, details)
    // Enviar para Slack, email, etc.
  }
})

// Verificar periodicamente
setInterval(checkAlerts, 60000) // A cada 1 minuto
```

### 5. Utilitários de Conversão

#### `fromSupabaseError(error)`
Converte erros do Supabase para AppError:

```typescript
import { fromSupabaseError } from '@/lib/errors'

const { data, error } = await supabase.from('leads').select()
if (error) {
  throw fromSupabaseError(error)
  // Converte códigos do Postgres:
  // 23505 → ConflictError (unique violation)
  // 23503 → BadRequestError (foreign key)
  // 42501 → ForbiddenError (RLS)
  // PGRST116 → NotFoundError (no rows)
}
```

#### `fromZodError(error)`
Converte erros do Zod para ValidationError:

```typescript
import { fromZodError } from '@/lib/errors'
import { z } from 'zod'

const schema = z.object({ name: z.string().min(2) })
const result = schema.safeParse({ name: 'A' })

if (!result.success) {
  throw fromZodError(result.error)
  // ValidationError com detalhes formatados
}
```

## 🛡️ Padrões de Uso

### Pattern 1: API Route Completa
```typescript
import { NextRequest, NextResponse } from 'next/server'
import {
  asyncHandler,
  UnauthorizedError,
  NotFoundError,
  fromSupabaseError,
  logger
} from '@/lib/errors'

export const GET = asyncHandler(async (request: NextRequest) => {
  const startTime = Date.now()

  // Autenticação
  const session = await getSession()
  if (!session) {
    throw new UnauthorizedError('Autenticação requerida')
  }

  // Buscar dados
  const { data, error } = await supabase
    .from('leads')
    .select()
    .eq('id', id)
    .single()

  if (error) {
    throw fromSupabaseError(error)
  }

  if (!data) {
    throw new NotFoundError('Lead não encontrado', { id })
  }

  // Log de sucesso
  const duration = Date.now() - startTime
  logger.httpRequest('GET', `/api/leads/${id}`, 200, duration)

  return NextResponse.json({ success: true, data })
})
```

### Pattern 2: Try-Catch Manual
```typescript
export async function GET(request: NextRequest) {
  try {
    // lógica
    return NextResponse.json(data)
  } catch (error) {
    return handleError(error, request.nextUrl.pathname)
  }
}
```

### Pattern 3: Validação + Error Handling
```typescript
import { withValidation, asyncHandler } from '@/lib/errors'
import { createLeadSchema } from '@/lib/validations'

export const POST = asyncHandler(
  withValidation(createLeadSchema, async (request, validatedData) => {
    // validatedData já está validado
    // Erros lançados são capturados automaticamente
    const lead = await createLead(validatedData)
    return NextResponse.json(lead, { status: 201 })
  })
)
```

## 📊 Monitoramento em Produção

### Endpoint de Health Check
```typescript
// src/app/api/health/route.ts
import { NextResponse } from 'next/server'
import { getSystemHealth } from '@/lib/errors/monitoring'

export async function GET() {
  const health = getSystemHealth()

  return NextResponse.json(health, {
    status: health.status === 'healthy' ? 200 : 503
  })
}
```

**Resposta**:
```json
{
  "status": "healthy",
  "details": {
    "totalErrors": 5,
    "recentErrors": 1,
    "errorRateHigh": false,
    "mostCommonError": { "type": "NotFoundError", "count": 3 },
    "mostCommonCode": { "code": "NOT_FOUND", "count": 3 }
  }
}
```

### Endpoint de Métricas (Admin)
```typescript
// src/app/api/admin/metrics/route.ts
import { NextResponse } from 'next/server'
import { errorMonitor, generateErrorReport } from '@/lib/errors/monitoring'

export async function GET() {
  const metrics = errorMonitor.getMetrics()
  const report = generateErrorReport()

  return NextResponse.json({
    metrics,
    report
  })
}
```

## 🔧 Configuração

### Setup Global (recomendado)
```typescript
// src/app/layout.tsx ou instrumentation.ts
import { setupGlobalErrorHandlers } from '@/lib/errors'

export function register() {
  setupGlobalErrorHandlers()
  // Captura uncaughtException e unhandledRejection
}
```

### Configurar Logger
```typescript
import { logger } from '@/lib/errors'

logger.configure({
  minLevel: 'DEBUG', // ERROR | WARN | INFO | DEBUG
  enableConsole: true,
  enableFile: false,
  prettyPrint: true // false em produção
})
```

## 🧪 Testes

### Testar Erros Customizados
```bash
# 401 Unauthorized
curl http://localhost:3000/api/leads
# Retorna: { "error": { "code": "UNAUTHORIZED", "statusCode": 401, ... } }

# 404 Not Found
curl http://localhost:3000/api/leads/999999
# Retorna: { "error": { "code": "NOT_FOUND", "statusCode": 404, ... } }

# 400 Bad Request (validação)
curl -X POST http://localhost:3000/api/leads \
  -H "Content-Type: application/json" \
  -d '{"nome": "A"}'
# Retorna: { "error": { "code": "VALIDATION_ERROR", "statusCode": 422, ... } }
```

### Ver Logs em Tempo Real
```typescript
// Ativar debug logs
logger.configure({ minLevel: 'DEBUG' })

// Fazer requisições e ver logs coloridos no console
```

### Gerar Relatório de Erros
```typescript
import { generateErrorReport } from '@/lib/errors/monitoring'

// Após algum uso da aplicação
console.log(generateErrorReport())
```

## 📝 Arquivos Criados

1. ✅ `src/lib/errors/custom-errors.ts` - 14 classes de erro customizadas
2. ✅ `src/lib/errors/error-handler.ts` - Handler centralizado + asyncHandler
3. ✅ `src/lib/errors/logger.ts` - Logger estruturado com níveis e cores
4. ✅ `src/lib/errors/monitoring.ts` - Sistema de métricas e alertas
5. ✅ `src/lib/errors/index.ts` - Exports centralizados
6. ✅ `src/app/api/leads/route.ts` - Exemplo de integração (GET e POST)
7. ✅ `ERROR-HANDLING-DOCS.md` - Esta documentação

## 🔗 Integrações Futuras

### Sentry
```typescript
import * as Sentry from '@sentry/nextjs'

// Em error-handler.ts
if (process.env.NODE_ENV === 'production') {
  Sentry.captureException(error, { extra: { requestId } })
}
```

### DataDog / CloudWatch
```typescript
// Em logger.ts writeToFile()
await fetch('https://api.datadoghq.com/api/v1/logs', {
  method: 'POST',
  headers: { 'DD-API-KEY': process.env.DATADOG_API_KEY },
  body: JSON.stringify(logEntry)
})
```

## 🎯 Benefícios

✅ **Consistência**: Todos os erros seguem o mesmo formato
✅ **Rastreabilidade**: RequestId único para cada erro
✅ **Debugging**: Logs estruturados com contexto completo
✅ **Monitoramento**: Métricas em tempo real e alertas
✅ **Type Safety**: Classes tipadas com TypeScript
✅ **Produção Ready**: Esconde detalhes sensíveis em produção
✅ **Performance**: Tracking leve e eficiente

---

**Versão**: 1.0.0
**Data**: 2025-10-26
**Autor**: Claude Code AI Assistant
**Status**: ✅ Implementado e Documentado
