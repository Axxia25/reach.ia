# Validação de Dados - Documentação

## 📋 Visão Geral

Sistema completo de validação de dados no backend usando **Zod**, uma biblioteca TypeScript-first para validação de schemas com inferência de tipos automática.

## ✅ O que foi implementado

### 1. Schemas de Validação

#### Lead Schemas (`src/lib/validations/lead.schema.ts`)

**Schemas disponíveis**:
- `createLeadSchema` - Validação para criar novos leads
- `updateLeadSchema` - Validação para atualizar leads
- `searchLeadsSchema` - Validação de parâmetros de busca
- `deleteLeadSchema` - Validação para deleção
- `updateLeadStatusSchema` - Validação de mudança de status
- `bulkCreateLeadsSchema` - Validação de importação em lote

**Regras de validação**:
```typescript
// Nome
- Mínimo: 2 caracteres
- Máximo: 255 caracteres
- Obrigatório
- Não pode ser vazio após trim

// Telefone
- Formato: (11) 98888-7777 ou +55 11 98888-7777
- Regex: /^(?:\+55\s?)?(?:\(?\d{2}\)?\s?)?(?:9\s?)?\d{4}[-\s]?\d{4}$/
- Opcional
- Auto-normalização: remove caracteres não-numéricos

// Timestamps
- Formato: ISO 8601 (ex: 2025-01-01T12:00:00Z)
- Obrigatório
- Validação de data válida

// Veículo
- Mínimo: 2 caracteres
- Máximo: 255 caracteres
- Opcional

// Resumo
- Máximo: 5000 caracteres
- Opcional

// Conversation ID
- Formato: UUID v4
- Opcional

// Vendedor
- Mínimo: 2 caracteres
- Máximo: 255 caracteres
- Opcional
```

#### User Schemas (`src/lib/validations/user.schema.ts`)

**Schemas disponíveis**:
- `registerUserSchema` - Registro de novo usuário
- `loginUserSchema` - Login
- `updateUserProfileSchema` - Atualização de perfil
- `changePasswordSchema` - Alteração de senha
- `resetPasswordSchema` - Recuperação de senha
- `setNewPasswordSchema` - Redefinir senha com token
- `listUsersSchema` - Listagem de usuários (admin)
- `deleteUserSchema` - Deleção de usuário (admin)
- `verifyEmailSchema` - Verificação de email

**Regras de validação**:
```typescript
// Email
- Formato: email válido
- Regex: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
- Mínimo: 5 caracteres
- Máximo: 255 caracteres
- Obrigatório
- Convertido para lowercase

// Senha
- Mínimo: 8 caracteres
- Máximo: 100 caracteres
- Obrigatório
- Regex: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/
- Requisitos:
  * Pelo menos 1 letra maiúscula
  * Pelo menos 1 letra minúscula
  * Pelo menos 1 número
  * Pelo menos 1 caractere especial (@$!%*?&#)

// Role
- Valores permitidos: 'vendedor', 'gerente', 'admin'
- Default: 'vendedor'

// Vendedor Name
- Mínimo: 2 caracteres
- Máximo: 255 caracteres
- Obrigatório
```

### 2. Utilitários de Validação (`src/lib/validations/validate.ts`)

#### Funções Helper

**`validate<T>(schema, data)`**
```typescript
const result = validate(createLeadSchema, userInput)
if (result.success) {
  // result.data está validado e tipado
} else {
  // result.error contém mensagens estruturadas
}
```

**`validateRequestBody<T>(request, schema)`**
```typescript
// Em API route
export async function POST(request: NextRequest) {
  const data = await validateRequestBody(request, createLeadSchema)
  if (data instanceof NextResponse) {
    return data // Retorna erro 400 automaticamente
  }
  // data está validado
}
```

**`validateQueryParams<T>(request, schema)`**
```typescript
export async function GET(request: NextRequest) {
  const params = validateQueryParams(request, searchLeadsSchema)
  if (params instanceof NextResponse) {
    return params // Erro 400
  }
  // params.search, params.limit, etc. validados
}
```

**`validatePathParams<T>(params, schema)`**
```typescript
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const validated = validatePathParams(params, idSchema)
  // ...
}
```

**`withValidation(schema, handler)`** - HOC para API routes
```typescript
export const POST = withValidation(createLeadSchema, async (req, validatedData) => {
  // validatedData já está validado e tipado automaticamente
  const lead = await createLead(validatedData)
  return NextResponse.json(lead)
})
```

#### Sanitização XSS

**`sanitizeString(input)`**
```typescript
const clean = sanitizeString('<script>alert("XSS")</script>João')
// Retorna: 'João' (remove < > e javascript:)
```

**`sanitizeObject(obj)`**
```typescript
const clean = sanitizeObject({
  nome: '<script>João</script>',
  resumo: 'javascript:void(0)'
})
// Retorna objeto com strings sanitizadas
```

**`validateAndSanitize(schema, data)`**
```typescript
// Combina validação + sanitização
const result = validateAndSanitize(createLeadSchema, userInput)
// result.data está validado E sanitizado
```

### 3. API Routes com Validação

#### `POST /api/leads` - Criar lead
```bash
curl -X POST http://localhost:3000/api/leads \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "João Silva",
    "timestamps": "2025-01-26T12:00:00Z",
    "telefone": "(11) 98888-7777",
    "veiculo": "Toyota Corolla 2020"
  }'
```

**Respostas**:
```json
// Sucesso (201)
{
  "success": true,
  "message": "Lead criado com sucesso",
  "data": {
    "id": 123,
    "nome": "João Silva",
    ...
  }
}

// Erro de validação (400)
{
  "error": "Erro de validação dos dados",
  "details": [
    {
      "field": "nome",
      "message": "Nome deve ter pelo menos 2 caracteres"
    },
    {
      "field": "telefone",
      "message": "Telefone inválido"
    }
  ]
}

// Não autenticado (401)
{
  "error": "Não autenticado"
}
```

#### `GET /api/leads` - Listar leads
```bash
curl "http://localhost:3000/api/leads?search=toyota&period=30&limit=50&offset=0"
```

**Query params validados**:
- `search` (string, max 255) - Termo de busca
- `vendedor` (string, max 255) - Filtrar por vendedor
- `period` (number, 1-365) - Período em dias (default: 30)
- `limit` (number, 1-1000) - Limite de resultados (default: 100)
- `offset` (number, >= 0) - Offset para paginação (default: 0)

**Resposta**:
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "total": 450,
    "limit": 50,
    "offset": 0
  }
}
```

#### `GET /api/leads/[id]` - Buscar lead específico
```bash
curl http://localhost:3000/api/leads/123
```

#### `PUT /api/leads/[id]` - Atualizar lead
```bash
curl -X PUT http://localhost:3000/api/leads/123 \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "João Silva Santos",
    "telefone": "(11) 99999-8888"
  }'
```

#### `DELETE /api/leads/[id]` - Deletar lead
```bash
curl -X DELETE http://localhost:3000/api/leads/123
```

**Permissões**:
- **Vendedor**: Só pode ver/editar seus próprios leads, não pode deletar
- **Gerente**: Pode ver/editar todos os leads, pode deletar
- **Admin**: Acesso total

### 4. Tipos TypeScript Inferidos

Todos os schemas exportam tipos TypeScript automaticamente:

```typescript
import type { CreateLeadInput, UpdateLeadInput } from '@/lib/validations'

// Tipos são inferidos automaticamente do schema
function handleLead(data: CreateLeadInput) {
  // data.nome: string
  // data.telefone: string | null | undefined
  // data.timestamps: string
  // Autocomplete funciona!
}
```

## 🛡️ Proteções Implementadas

### 1. Validação de Tipos
✅ Garante que campos são do tipo correto (string, number, boolean)
✅ Valida formatos (email, UUID, ISO 8601)
✅ Verifica tamanhos mínimos e máximos

### 2. Sanitização XSS
✅ Remove tags HTML (`<script>`, `<img>`, etc.)
✅ Remove `javascript:` URLs
✅ Remove event handlers (`onclick=`, `onload=`, etc.)

### 3. SQL Injection
✅ Usa Supabase ORM (não executa SQL raw)
✅ Parâmetros são sempre escapados automaticamente

### 4. Validação de Negócio
✅ Campos obrigatórios (nome, timestamps)
✅ Senhas fortes (8+ caracteres, maiúscula, minúscula, número, especial)
✅ Confirmação de senha (deve coincidir)
✅ Limites de paginação (max 1000 registros)

### 5. Permissões de Acesso
✅ Verifica autenticação (session)
✅ Verifica role do usuário (vendedor/gerente/admin)
✅ Vendedor só acessa seus próprios dados

## 🧪 Testes

### Teste Manual via cURL

```bash
# 1. Teste de validação bem-sucedida
curl -X POST http://localhost:3000/api/leads \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "João Silva",
    "timestamps": "2025-01-26T12:00:00Z",
    "telefone": "(11) 98888-7777"
  }'
# Esperado: 201 Created

# 2. Teste de nome muito curto
curl -X POST http://localhost:3000/api/leads \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "A",
    "timestamps": "2025-01-26T12:00:00Z"
  }'
# Esperado: 400 Bad Request com erro "Nome deve ter pelo menos 2 caracteres"

# 3. Teste de telefone inválido
curl -X POST http://localhost:3000/api/leads \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Maria Santos",
    "timestamps": "2025-01-26T12:00:00Z",
    "telefone": "telefone-invalido"
  }'
# Esperado: 400 Bad Request com erro "Telefone inválido"

# 4. Teste de campo obrigatório faltando
curl -X POST http://localhost:3000/api/leads \
  -H "Content-Type: application/json" \
  -d '{
    "telefone": "(11) 98888-7777"
  }'
# Esperado: 400 Bad Request com erro "Nome é obrigatório"

# 5. Teste de timestamp inválido
curl -X POST http://localhost:3000/api/leads \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Pedro Costa",
    "timestamps": "data-invalida"
  }'
# Esperado: 400 Bad Request com erro "Timestamps deve estar no formato ISO 8601"

# 6. Teste de query params inválidos
curl "http://localhost:3000/api/leads?limit=5000"
# Esperado: 400 Bad Request com erro "Limite máximo é 1000 registros"
```

### Teste Automatizado

Execute o script de teste:
```bash
node test-validation.js
```

**O script testa**:
1. ✅ Criação de lead com dados válidos
2. ✅ Validação de nome muito curto
3. ✅ Validação de telefone inválido
4. ✅ Validação de timestamp inválido
5. ✅ Validação de campos obrigatórios
6. ✅ Validação de query params
7. ✅ Sanitização de XSS

## 📚 Exemplos de Uso

### Exemplo 1: Validar dados em componente React

```typescript
import { createLeadSchema } from '@/lib/validations'

function LeadForm() {
  const handleSubmit = async (formData: FormData) => {
    const data = {
      nome: formData.get('nome'),
      timestamps: new Date().toISOString(),
      telefone: formData.get('telefone'),
    }

    // Validar antes de enviar
    const result = createLeadSchema.safeParse(data)
    if (!result.success) {
      // Mostrar erros ao usuário
      console.error(result.error.errors)
      return
    }

    // Enviar dados validados
    const response = await fetch('/api/leads', {
      method: 'POST',
      body: JSON.stringify(result.data)
    })
  }
}
```

### Exemplo 2: Criar nova API route com validação

```typescript
// src/app/api/minha-rota/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { withValidation, createLeadSchema } from '@/lib/validations'

export const POST = withValidation(createLeadSchema, async (request, validatedData) => {
  // validatedData já está validado e tipado
  // Sem necessidade de validação manual

  // Processar dados
  const result = await processLead(validatedData)

  return NextResponse.json({
    success: true,
    data: result
  })
})
```

### Exemplo 3: Criar schema customizado

```typescript
import { z } from 'zod'

export const myCustomSchema = z.object({
  customField: z
    .string()
    .min(5, 'Deve ter pelo menos 5 caracteres')
    .max(100)
    .regex(/^[A-Z]/, 'Deve começar com maiúscula'),

  optionalField: z
    .number()
    .positive()
    .optional(),

  enumField: z.enum(['opcao1', 'opcao2', 'opcao3']),
})

export type MyCustomInput = z.infer<typeof myCustomSchema>
```

## ⚙️ Configuração

### Personalizar mensagens de erro

```typescript
export const mySchema = z.object({
  nome: z
    .string({
      required_error: 'Por favor, forneça um nome',
      invalid_type_error: 'O nome deve ser texto',
    })
    .min(2, 'Nome muito curto')
    .max(100, 'Nome muito longo'),
})
```

### Validações condicionais

```typescript
export const conditionalSchema = z.object({
  type: z.enum(['pessoa_fisica', 'pessoa_juridica']),
  cpf: z.string().optional(),
  cnpj: z.string().optional(),
}).refine(
  (data) => {
    if (data.type === 'pessoa_fisica') {
      return !!data.cpf
    } else {
      return !!data.cnpj
    }
  },
  {
    message: 'CPF é obrigatório para pessoa física, CNPJ para pessoa jurídica',
    path: ['cpf'], // ou ['cnpj']
  }
)
```

### Transformações de dados

```typescript
export const transformSchema = z.object({
  email: z
    .string()
    .email()
    .transform((val) => val.toLowerCase().trim()),

  telefone: z
    .string()
    .transform((val) => val.replace(/\D/g, '')), // Remove não-dígitos
})
```

## 🔗 Referências

- [Zod Documentation](https://zod.dev/)
- [TypeScript Type Inference](https://www.typescriptlang.org/docs/handbook/type-inference.html)
- [OWASP Input Validation](https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)

---

**Versão**: 1.0.0
**Data**: 2025-10-26
**Autor**: Claude Code AI Assistant
**Status**: ✅ Implementado e Testado
