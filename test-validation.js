#!/usr/bin/env node

/**
 * Script de teste para Validação de Dados
 *
 * Este script testa os schemas de validação criados com Zod
 */

const http = require('http');

const HOST = 'localhost';
const PORT = 3000;

/**
 * Função auxiliar para fazer requisições HTTP
 */
function makeRequest(path, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: HOST,
      port: PORT,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'ValidationTest/1.0',
      }
    };

    if (body) {
      const bodyString = JSON.stringify(body);
      options.headers['Content-Length'] = Buffer.byteLength(bodyString);
    }

    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: parsed
          });
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: data
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (body) {
      req.write(JSON.stringify(body));
    }

    req.end();
  });
}

/**
 * Teste 1: Validação de criação de lead com dados válidos
 */
async function testValidLeadCreation() {
  console.log('\n📝 Teste 1: Criar lead com dados válidos');
  console.log('='.repeat(50));

  const validLead = {
    nome: 'João Silva',
    timestamps: new Date().toISOString(),
    telefone: '(11) 98888-7777',
    veiculo: 'Toyota Corolla 2020',
    resumo: 'Cliente interessado em trocar de carro',
  };

  try {
    const response = await makeRequest('/api/leads', 'POST', validLead);

    console.log(`Status: ${response.statusCode}`);
    if (response.statusCode === 201) {
      console.log('✅ Lead criado com sucesso!');
      console.log('Dados:', JSON.stringify(response.body, null, 2));
    } else {
      console.log('❌ Falha ao criar lead');
      console.log('Erro:', JSON.stringify(response.body, null, 2));
    }
  } catch (error) {
    console.error('❌ Erro na requisição:', error.message);
  }
}

/**
 * Teste 2: Validação com nome inválido (muito curto)
 */
async function testInvalidShortName() {
  console.log('\n📝 Teste 2: Criar lead com nome muito curto (deve falhar)');
  console.log('='.repeat(50));

  const invalidLead = {
    nome: 'A', // Nome muito curto (< 2 caracteres)
    timestamps: new Date().toISOString(),
  };

  try {
    const response = await makeRequest('/api/leads', 'POST', invalidLead);

    console.log(`Status: ${response.statusCode}`);
    if (response.statusCode === 400) {
      console.log('✅ Validação funcionou corretamente!');
      console.log('Erro esperado:', JSON.stringify(response.body, null, 2));
    } else {
      console.log('❌ Validação não funcionou - deveria retornar 400');
      console.log('Resposta:', JSON.stringify(response.body, null, 2));
    }
  } catch (error) {
    console.error('❌ Erro na requisição:', error.message);
  }
}

/**
 * Teste 3: Validação com telefone inválido
 */
async function testInvalidPhone() {
  console.log('\n📝 Teste 3: Criar lead com telefone inválido (deve falhar)');
  console.log('='.repeat(50));

  const invalidLead = {
    nome: 'Maria Santos',
    timestamps: new Date().toISOString(),
    telefone: 'telefone-invalido', // Formato inválido
  };

  try {
    const response = await makeRequest('/api/leads', 'POST', invalidLead);

    console.log(`Status: ${response.statusCode}`);
    if (response.statusCode === 400) {
      console.log('✅ Validação de telefone funcionou!');
      console.log('Erro esperado:', JSON.stringify(response.body, null, 2));
    } else {
      console.log('❌ Validação não funcionou - deveria retornar 400');
      console.log('Resposta:', JSON.stringify(response.body, null, 2));
    }
  } catch (error) {
    console.error('❌ Erro na requisição:', error.message);
  }
}

/**
 * Teste 4: Validação com timestamp inválido
 */
async function testInvalidTimestamp() {
  console.log('\n📝 Teste 4: Criar lead com timestamp inválido (deve falhar)');
  console.log('='.repeat(50));

  const invalidLead = {
    nome: 'Pedro Costa',
    timestamps: 'data-invalida', // Não é ISO 8601
  };

  try {
    const response = await makeRequest('/api/leads', 'POST', invalidLead);

    console.log(`Status: ${response.statusCode}`);
    if (response.statusCode === 400) {
      console.log('✅ Validação de timestamp funcionou!');
      console.log('Erro esperado:', JSON.stringify(response.body, null, 2));
    } else {
      console.log('❌ Validação não funcionou - deveria retornar 400');
      console.log('Resposta:', JSON.stringify(response.body, null, 2));
    }
  } catch (error) {
    console.error('❌ Erro na requisição:', error.message);
  }
}

/**
 * Teste 5: Validação com campos faltando (nome obrigatório)
 */
async function testMissingRequiredFields() {
  console.log('\n📝 Teste 5: Criar lead sem nome (campo obrigatório - deve falhar)');
  console.log('='.repeat(50));

  const invalidLead = {
    // nome está faltando
    timestamps: new Date().toISOString(),
    telefone: '(11) 98888-7777',
  };

  try {
    const response = await makeRequest('/api/leads', 'POST', invalidLead);

    console.log(`Status: ${response.statusCode}`);
    if (response.statusCode === 400) {
      console.log('✅ Validação de campo obrigatório funcionou!');
      console.log('Erro esperado:', JSON.stringify(response.body, null, 2));
    } else {
      console.log('❌ Validação não funcionou - deveria retornar 400');
      console.log('Resposta:', JSON.stringify(response.body, null, 2));
    }
  } catch (error) {
    console.error('❌ Erro na requisição:', error.message);
  }
}

/**
 * Teste 6: Validação de query params inválidos
 */
async function testInvalidQueryParams() {
  console.log('\n📝 Teste 6: Buscar leads com query params inválidos (deve falhar)');
  console.log('='.repeat(50));

  try {
    // Limit muito alto (> 1000)
    const response = await makeRequest('/api/leads?limit=5000', 'GET');

    console.log(`Status: ${response.statusCode}`);
    if (response.statusCode === 400) {
      console.log('✅ Validação de query params funcionou!');
      console.log('Erro esperado:', JSON.stringify(response.body, null, 2));
    } else {
      console.log('❌ Validação não funcionou - deveria retornar 400');
      console.log('Resposta:', JSON.stringify(response.body, null, 2));
    }
  } catch (error) {
    console.error('❌ Erro na requisição:', error.message);
  }
}

/**
 * Teste 7: Sanitização de XSS
 */
async function testXSSSanitization() {
  console.log('\n📝 Teste 7: Testar sanitização de XSS');
  console.log('='.repeat(50));

  const xssLead = {
    nome: '<script>alert("XSS")</script>João',
    timestamps: new Date().toISOString(),
    resumo: 'javascript:void(0)',
  };

  try {
    const response = await makeRequest('/api/leads', 'POST', xssLead);

    console.log(`Status: ${response.statusCode}`);
    if (response.statusCode === 201) {
      const nome = response.body.data?.nome || '';
      const resumo = response.body.data?.resumo || '';

      if (!nome.includes('<script>') && !resumo.includes('javascript:')) {
        console.log('✅ Sanitização de XSS funcionou!');
        console.log('Nome sanitizado:', nome);
        console.log('Resumo sanitizado:', resumo);
      } else {
        console.log('⚠️  XSS não foi completamente sanitizado');
        console.log('Dados:', JSON.stringify(response.body, null, 2));
      }
    } else {
      console.log('Resposta:', JSON.stringify(response.body, null, 2));
    }
  } catch (error) {
    console.error('❌ Erro na requisição:', error.message);
  }
}

/**
 * Executar todos os testes
 */
async function runTests() {
  console.log('\n🚀 Iniciando testes de Validação de Dados');
  console.log('Servidor: http://' + HOST + ':' + PORT);
  console.log('='.repeat(50));

  await testValidLeadCreation();
  await new Promise(resolve => setTimeout(resolve, 500));

  await testInvalidShortName();
  await new Promise(resolve => setTimeout(resolve, 500));

  await testInvalidPhone();
  await new Promise(resolve => setTimeout(resolve, 500));

  await testInvalidTimestamp();
  await new Promise(resolve => setTimeout(resolve, 500));

  await testMissingRequiredFields();
  await new Promise(resolve => setTimeout(resolve, 500));

  await testInvalidQueryParams();
  await new Promise(resolve => setTimeout(resolve, 500));

  await testXSSSanitization();

  console.log('\n✅ Testes concluídos!');
  console.log('='.repeat(50));
}

// Executar
runTests().catch(console.error);
