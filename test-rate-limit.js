#!/usr/bin/env node

/**
 * Script de teste para Rate Limiting
 *
 * Este script testa os três tipos de rate limiting implementados:
 * 1. authRateLimit - Login page (5 req/15min)
 * 2. apiRateLimit - General API (100 req/min)
 * 3. writeRateLimit - Write operations (30 req/min)
 */

const http = require('http');

// Configuração do servidor local
const HOST = 'localhost';
const PORT = 3000;

// Função auxiliar para fazer requisições HTTP
function makeRequest(path, method = 'GET') {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: HOST,
      port: PORT,
      path: path,
      method: method,
      headers: {
        'User-Agent': 'RateLimitTest/1.0',
        'x-forwarded-for': '192.168.1.100', // IP simulado para teste
      }
    };

    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.end();
  });
}

// Teste 1: Auth Rate Limit (5 requisições em 15 minutos)
async function testAuthRateLimit() {
  console.log('\n📝 Teste 1: Auth Rate Limit (5 req/15min)');
  console.log('='.repeat(50));

  try {
    for (let i = 1; i <= 7; i++) {
      const response = await makeRequest('/');
      const rateLimitHeaders = {
        limit: response.headers['x-ratelimit-limit'],
        remaining: response.headers['x-ratelimit-remaining'],
        reset: response.headers['x-ratelimit-reset']
      };

      console.log(`Request ${i}:`);
      console.log(`  Status: ${response.statusCode}`);
      console.log(`  Rate Limit: ${rateLimitHeaders.limit}`);
      console.log(`  Remaining: ${rateLimitHeaders.remaining}`);

      if (response.statusCode === 429) {
        console.log(`  ⚠️  Rate limit atingido!`);
        console.log(`  Reset em: ${rateLimitHeaders.reset}`);
        const body = JSON.parse(response.body);
        console.log(`  Mensagem: ${body.error}`);
        break;
      } else {
        console.log(`  ✅ Requisição aceita`);
      }

      // Pequeno delay entre requisições
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  } catch (error) {
    console.error('Erro no teste:', error.message);
  }
}

// Teste 2: API Rate Limit (100 requisições por minuto)
async function testApiRateLimit() {
  console.log('\n📝 Teste 2: API Rate Limit (100 req/min)');
  console.log('='.repeat(50));
  console.log('ℹ️  Simulando 10 requisições rápidas...\n');

  try {
    for (let i = 1; i <= 10; i++) {
      const response = await makeRequest('/api/test', 'GET');
      const rateLimitHeaders = {
        limit: response.headers['x-ratelimit-limit'],
        remaining: response.headers['x-ratelimit-remaining']
      };

      console.log(`Request ${i}: Status ${response.statusCode} | Remaining: ${rateLimitHeaders.remaining}/${rateLimitHeaders.limit}`);

      if (response.statusCode === 429) {
        console.log(`  ⚠️  Rate limit atingido!`);
        break;
      }
    }
  } catch (error) {
    console.error('Erro no teste:', error.message);
  }
}

// Teste 3: Write Rate Limit (30 escritas por minuto)
async function testWriteRateLimit() {
  console.log('\n📝 Teste 3: Write Rate Limit (30 req/min para POST/PUT/DELETE)');
  console.log('='.repeat(50));
  console.log('ℹ️  Simulando 5 operações de escrita...\n');

  try {
    for (let i = 1; i <= 5; i++) {
      const response = await makeRequest('/api/leads', 'POST');
      const rateLimitHeaders = {
        limit: response.headers['x-ratelimit-limit'],
        remaining: response.headers['x-ratelimit-remaining']
      };

      console.log(`POST ${i}: Status ${response.statusCode} | Remaining: ${rateLimitHeaders.remaining}/${rateLimitHeaders.limit}`);

      if (response.statusCode === 429) {
        console.log(`  ⚠️  Rate limit atingido!`);
        break;
      }

      await new Promise(resolve => setTimeout(resolve, 100));
    }
  } catch (error) {
    console.error('Erro no teste:', error.message);
  }
}

// Executar todos os testes
async function runTests() {
  console.log('\n🚀 Iniciando testes de Rate Limiting');
  console.log('Servidor: http://' + HOST + ':' + PORT);
  console.log('='.repeat(50));

  await testAuthRateLimit();

  // Aguardar um pouco entre os testes para limpar o cache
  console.log('\n⏳ Aguardando 2 segundos antes do próximo teste...');
  await new Promise(resolve => setTimeout(resolve, 2000));

  await testApiRateLimit();

  console.log('\n⏳ Aguardando 2 segundos antes do próximo teste...');
  await new Promise(resolve => setTimeout(resolve, 2000));

  await testWriteRateLimit();

  console.log('\n✅ Testes concluídos!');
  console.log('='.repeat(50));
}

// Executar
runTests().catch(console.error);
