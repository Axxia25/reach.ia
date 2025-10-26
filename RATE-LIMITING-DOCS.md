# Rate Limiting - Documentação

## 📋 Visão Geral

Sistema de proteção contra ataques de força bruta e abuso de API implementado usando **token bucket algorithm** com cache LRU para alta performance.

## ✅ O que foi implementado

### 1. Biblioteca de Rate Limiting (`src/lib/rate-limit.ts`)

Implementação completa de rate limiting com:
- **Token Bucket Algorithm**: Distribui requisições de forma justa ao longo do tempo
- **LRU Cache**: Armazena até 500 IPs diferentes com TTL de 60 segundos
- **Sliding Window**: Janela deslizante para contagem precisa de requisições

### 2. Integração no Middleware (`src/middleware.ts`)

O middleware agora aplica rate limiting **antes** de qualquer autenticação ou lógica de negócio:

```typescript
// Authentication routes - strict rate limiting
if (pathname === '/' || pathname.startsWith('/api/auth')) {
  const result = authRateLimit(clientIp)
  if (!result.success) {
    return 429 Too Many Requests
  }
}

// API routes with write operations - moderate rate limiting
if (pathname.startsWith('/api') && (req.method === 'POST' || req.method === 'PUT' || req.method === 'DELETE')) {
  const result = writeRateLimit(clientIp)
  if (!result.success) {
    return 429 Too Many Requests
  }
}

// General API routes - standard rate limiting
if (pathname.startsWith('/api')) {
  const result = apiRateLimit(clientIp)
  if (!result.success) {
    return 429 Too Many Requests
  }
}
```

## 🔒 Níveis de Proteção

### 1. Auth Rate Limit (Login/Autenticação)
**Mais restritivo** - Protege contra brute force attacks

- **Limite**: 5 requisições
- **Janela**: 15 minutos (900.000 ms)
- **Aplica em**:
  - `/` (página de login)
  - `/api/auth/*` (endpoints de autenticação)

**Exemplo de uso no código**:
```typescript
import { authRateLimit, getClientIp, getRateLimitHeaders } from '@/lib/rate-limit'

export async function POST(request: Request) {
  const ip = getClientIp(request.headers)
  const result = authRateLimit(ip)

  if (!result.success) {
    return new Response(JSON.stringify({ error: 'Too many requests' }), {
      status: 429,
      headers: getRateLimitHeaders(result)
    })
  }

  // Processar login...
}
```

### 2. Write Rate Limit (Operações de Escrita)
**Moderado** - Protege contra spam e abuso de criação de dados

- **Limite**: 30 requisições
- **Janela**: 1 minuto (60.000 ms)
- **Aplica em**:
  - `POST /api/*`
  - `PUT /api/*`
  - `DELETE /api/*`

### 3. API Rate Limit (Leitura Geral)
**Padrão** - Protege contra sobrecarga da API

- **Limite**: 100 requisições
- **Janela**: 1 minuto (60.000 ms)
- **Aplica em**:
  - `GET /api/*`
  - Qualquer outro método em `/api/*`

## 🛡️ Proteções Implementadas

### 1. Extração Segura de IP
A função `getClientIp()` extrai o IP real do cliente considerando proxies e CDNs:

```typescript
export function getClientIp(headers: Headers): string {
  const cfConnectingIp = headers.get('cf-connecting-ip') // Cloudflare
  const forwardedFor = headers.get('x-forwarded-for')
  const realIp = headers.get('x-real-ip')

  if (cfConnectingIp) return cfConnectingIp
  if (forwardedFor) return forwardedFor.split(',')[0].trim()
  if (realIp) return realIp

  return 'unknown'
}
```

**Ordem de prioridade**:
1. `cf-connecting-ip` (Cloudflare - mais confiável)
2. `x-forwarded-for` (Proxies - pega primeiro IP)
3. `x-real-ip` (Nginx/Load Balancers)
4. `'unknown'` (fallback)

### 2. Headers de Rate Limit
Todas as respostas incluem headers padrão da indústria:

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 87
X-RateLimit-Reset: 2025-10-26T19:45:00.000Z
```

**Benefícios**:
- Clientes podem implementar backoff automático
- Transparência sobre limites
- Compatível com ferramentas de monitoramento

### 3. Respostas de Erro Padronizadas
Quando o limite é excedido, a resposta é clara e útil:

```json
{
  "error": "Too many requests. Please try again later.",
  "reset": "2025-10-26T19:45:00.000Z"
}
```

**Status HTTP**: `429 Too Many Requests` (padrão RFC 6585)

## 🧪 Como Testar

### Teste Manual (Browser DevTools)

1. Abra o console do navegador em `/`
2. Execute múltiplas requisições:

```javascript
// Teste Auth Rate Limit (5 req/15min)
for (let i = 0; i < 7; i++) {
  fetch('/')
    .then(r => console.log(`Request ${i+1}: ${r.status}`, r.headers.get('x-ratelimit-remaining')))
}
```

3. Após a 6ª requisição, você deve ver `429 Too Many Requests`

### Teste com cURL

```bash
# Teste Auth Rate Limit
for i in {1..7}; do
  curl -I http://localhost:3000/ \
    -H "x-forwarded-for: 192.168.1.100" \
    | grep -E "HTTP|RateLimit"
done

# Deve mostrar:
# Request 1-5: HTTP/1.1 200 OK, X-RateLimit-Remaining: 4,3,2,1,0
# Request 6-7: HTTP/1.1 429 Too Many Requests
```

### Teste Automatizado

Um script de teste foi criado em `test-rate-limit.js`, mas pode ser executado manualmente:

```bash
node test-rate-limit.js
```

## 📊 Métricas e Monitoramento

### O que monitorar em produção:

1. **Taxa de 429 responses**:
   - Normal: < 1% do total de requests
   - Alerta: > 5%
   - Crítico: > 10%

2. **IPs bloqueados frequentemente**:
   - Pode indicar ataque em andamento
   - Ou limite muito restritivo

3. **Padrões de horário**:
   - Picos de 429 em horários específicos
   - Pode indicar scripts automáticos

### Logs Recomendados

Adicione logging quando rate limit é atingido:

```typescript
if (!result.success) {
  console.warn(`[Rate Limit] IP ${clientIp} blocked on ${pathname}`, {
    limit: result.limit,
    remaining: result.remaining,
    reset: new Date(result.reset).toISOString()
  })
}
```

## ⚙️ Configuração Avançada

### Ajustar Limites

Para modificar os limites, edite `/src/lib/rate-limit.ts`:

```typescript
export function authRateLimit(identifier: string): RateLimitResult {
  return rateLimit(identifier, {
    interval: 15 * 60 * 1000, // 15 minutos
    maxRequests: 5, // ⬅️ Altere aqui
  })
}
```

### Criar Novos Rate Limiters

```typescript
// Exemplo: Rate limit específico para upload de arquivos
export function uploadRateLimit(identifier: string): RateLimitResult {
  return rateLimit(identifier, {
    interval: 60 * 1000, // 1 minuto
    maxRequests: 5, // Apenas 5 uploads por minuto
  })
}
```

Depois aplique no middleware ou em routes específicos.

### Limpar Cache (Útil para testes)

```typescript
import { clearRateLimitCache } from '@/lib/rate-limit'

// Em testes ou scripts de desenvolvimento
clearRateLimitCache()
```

## 🔐 Segurança

### Ataques Mitigados

✅ **Brute Force Attack**: Login limitado a 5 tentativas/15min
✅ **API Abuse**: Leitura limitada a 100 req/min
✅ **Spam de Dados**: Escrita limitada a 30 req/min
✅ **DoS (Denial of Service)**: Proteção básica por IP

### Limitações Conhecidas

⚠️ **IP Spoofing**: Se o proxy/CDN não for confiável, IPs podem ser forjados
⚠️ **Distributed Attacks**: Rate limiting por IP não protege contra DDoS distribuído
⚠️ **Memory Growth**: Cache LRU tem limite de 500 IPs - ataques com > 500 IPs distintos podem evadir

### Recomendações Adicionais

1. **Use Cloudflare**: Proteção adicional contra DDoS
2. **Implemente CAPTCHA**: Após 3-4 tentativas de login falhadas
3. **Monitore Logs**: Detecte padrões anormais
4. **Rate Limit por User ID**: Adicione rate limiting por usuário autenticado (além de IP)

## 📝 Changelog

### v1.0.0 (2025-10-26)
- ✅ Implementação inicial do rate limiting
- ✅ Integração no middleware Next.js
- ✅ Três níveis de proteção (auth, write, read)
- ✅ Suporte a proxies (Cloudflare, Nginx)
- ✅ Headers padrão de rate limit
- ✅ Documentação completa

## 🔗 Referências

- [RFC 6585 - HTTP Status Code 429](https://tools.ietf.org/html/rfc6585)
- [Token Bucket Algorithm](https://en.wikipedia.org/wiki/Token_bucket)
- [LRU Cache npm package](https://www.npmjs.com/package/lru-cache)
- [OWASP - Rate Limiting](https://cheatsheetseries.owasp.org/cheatsheets/Denial_of_Service_Cheat_Sheet.html#rate-limiting)

---

**Versão**: 1.0.0
**Data**: 2025-10-26
**Autor**: Claude Code AI Assistant
**Status**: ✅ Implementado e Ativo
