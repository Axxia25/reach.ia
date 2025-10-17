#!/bin/bash

# Deploy script for Dashboard Leads
# Este script prepara e valida o projeto antes do deploy

set -e

echo "🚀 Iniciando processo de deploy..."

# Verificar se estamos na branch correta
CURRENT_BRANCH=$(git branch --show-current)
echo "📍 Branch atual: $CURRENT_BRANCH"

# Verificar se há mudanças não commitadas
if [ -n "$(git status --porcelain)" ]; then
    echo "❌ Há mudanças não commitadas. Faça commit antes do deploy."
    exit 1
fi

# Verificar variáveis de ambiente necessárias
echo "🔍 Verificando variáveis de ambiente..."
if [ ! -f ".env.local" ]; then
    echo "❌ Arquivo .env.local não encontrado!"
    echo "Crie o arquivo .env.local com as variáveis necessárias:"
    echo "NEXT_PUBLIC_SUPABASE_URL=your_supabase_url"
    echo "NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key"
    exit 1
fi

# Limpar cache e node_modules
echo "🧹 Limpando cache..."
rm -rf .next
rm -rf node_modules
rm -rf out

# Instalar dependências
echo "📦 Instalando dependências..."
npm ci

# Executar linting
echo "🔍 Executando ESLint..."
npm run lint

# Executar build
echo "🔨 Executando build..."
npm run build

# Verificar se o build foi bem-sucedido
if [ $? -eq 0 ]; then
    echo "✅ Build executado com sucesso!"
else
    echo "❌ Erro no build!"
    exit 1
fi

echo ""
echo "✅ Projeto pronto para deploy!"
echo ""
echo "📝 Próximos passos:"
echo "1. Faça push das suas mudanças para o repositório"
echo "2. Configure as variáveis de ambiente no Netlify:"
echo "   - NEXT_PUBLIC_SUPABASE_URL"
echo "   - NEXT_PUBLIC_SUPABASE_ANON_KEY"
echo "3. O deploy será feito automaticamente pelo Netlify"
echo ""

# Opcionalmente, fazer push automático
read -p "Deseja fazer push para o repositório agora? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "📤 Fazendo push..."
    git push origin $CURRENT_BRANCH
    echo "✅ Push realizado com sucesso!"
fi
