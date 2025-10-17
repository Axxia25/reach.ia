# Dashboard Leads

Dashboard em tempo real para gestão e acompanhamento de leads, construído com Next.js, TypeScript, Tailwind CSS, Supabase e Recharts.

## 🚀 Funcionalidades

- ✅ **Autenticação** com Supabase Auth
- ✅ **Dashboard em tempo real** com métricas atualizadas automaticamente
- ✅ **Gráficos interativos** com Recharts
- ✅ **Tabela de leads** com busca e filtros
- ✅ **Painel de vendedores** com ranking
- ✅ **Design responsivo** para desktop e mobile
- ✅ **TypeScript** para type safety
- ✅ **Tailwind CSS** para styling moderno

## 🛠️ Tecnologias

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Realtime)
- **Gráficos**: Recharts
- **Deploy**: Netlify
- **Ícones**: Lucide React

## 📋 Pré-requisitos

- Node.js 18+ 
- Conta no Supabase
- Conta no Netlify (para deploy)

## 🔧 Instalação e Configuração

### 1. Clone o projeto
```bash
git clone <seu-repositorio>
cd dashboard-leads
```

### 2. Instale as dependências
```bash
npm install
```

### 3. Configure o Supabase

#### 3.1. Crie um projeto no Supabase
1. Acesse [supabase.com](https://supabase.com)
2. Crie uma nova organização e projeto
3. Anote a URL e a chave anônima do projeto

#### 3.2. Configure o banco de dados
1. No Supabase Dashboard, vá para **SQL Editor**
2. Execute o script SQL fornecido em `setup-supabase.sql`
3. Verifique se as tabelas, views e políticas foram criadas

#### 3.3. Configure autenticação
1. Vá para **Authentication** > **Settings**
2. Configure o **Site URL** para seu domínio (ex: `https://seu-dashboard.netlify.app`)
3. Adicione URLs de redirecionamento se necessário

### 4. Configure variáveis de ambiente

Crie um arquivo `.env.local` na raiz do projeto:
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anonima-aqui
```

### 5. Execute o projeto localmente
```bash
npm run dev
```

O projeto estará disponível em `http://localhost:3000`

## 🚀 Deploy no Netlify

### 1. Conecte o repositório
1. Acesse [netlify.com](https://netlify.com)
2. Clique em **"New site from Git"**
3. Conecte seu repositório GitHub/GitLab

### 2. Configure o build
```
Build command: npm run build
Publish directory: .next
```

### 3. Configure variáveis de ambiente
No painel do Netlify, vá para **Site settings** > **Environment variables** e adicione:
```
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anonima-aqui
```

### 4. Deploy
O deploy acontecerá automaticamente. Seu site estará disponível na URL fornecida pelo Netlify.

## �� Estrutura do Banco de Dados

### Tabela `leads`
```sql
- id: BIGSERIAL (PK)
- timestamps: TIMESTAMPTZ
- nome: VARCHAR(255)
- telefone: VARCHAR(20)
- veiculo: TEXT
- resumo: TEXT
- conversation_id: VARCHAR(255) UNIQUE
- vendedor: VARCHAR(100)
- created_at: TIMESTAMPTZ
- updated_at: TIMESTAMPTZ
```

### Views
- `leads_daily_summary`: Resumo diário de leads
- `leads_por_vendedor`: Estatísticas por vendedor

## 🎨 Customização

### Cores
Edite as cores no arquivo `tailwind.config.js`:
```javascript
colors: {
  primary: {
    500: '#007aff', // Azul principal
    // outras variações...
  }
}
```

### Componentes
Os componentes estão organizados em:
- `/src/components/` - Componentes reutilizáveis
- `/src/app/` - Pages e layouts
- `/src/hooks/` - Custom hooks
- `/src/lib/` - Utilitários e configurações

## 📱 Funcionalidades Detalhadas

### Dashboard
- **Métricas em tempo real**: Total de leads, vendedores ativos, veículos consultados
- **Gráfico temporal**: Visualização de leads por data
- **Tendências**: Comparação com período anterior
- **Filtros por período**: 7, 30 ou 90 dias

### Gestão de Leads
- **Tabela completa** com todos os leads
- **Busca avançada** por nome, telefone, veículo ou vendedor
- **Filtros** por status e vendedor
- **Ordenação** por data/hora

### Top Vendedores
- **Ranking** dos vendedores mais ativos
- **Métricas individuais** de performance
- **Veículos** mais consultados por vendedor

## 🔐 Segurança

- **Row Level Security (RLS)** habilitado no Supabase
- **Autenticação obrigatória** para todas as rotas protegidas
- **Headers de segurança** configurados
- **Middleware** para proteção de rotas

## �� Tempo Real

O dashboard atualiza automaticamente quando:
- Novos leads são inseridos
- Leads existentes são atualizados
- Dados são modificados por outros usuários

## 📈 Performance

- **Índices otimizados** no banco de dados
- **Queries eficientes** com filters adequados
- **Loading states** para melhor UX
- **Responsive design** para todos os dispositivos

## 🐛 Troubleshooting

### Erro de autenticação
- Verifique se as URLs estão corretas no Supabase
- Confirme se as variáveis de ambiente estão configuradas
- Verifique se o RLS está habilitado

### Dados não aparecem
- Confirme se a tabela `leads` tem dados
- Verifique se as políticas RLS permitem acesso
- Teste as queries diretamente no Supabase

### Build falha no Netlify
- Verifique se todas as dependências estão no `package.json`
- Confirme se as variáveis de ambiente estão configuradas
- Verifique os logs de build para erros específicos

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 📞 Suporte

Para suporte ou dúvidas:
- Abra uma issue no GitHub
- Entre em contato via email

---

**Dashboard Leads** - Sistema moderno de gestão de leads em tempo real 🚀
