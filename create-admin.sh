#!/bin/bash

echo "🚀 Criando usuário admin..."

response=$(curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@gdash.com",
    "password": "admin123",
    "name": "Admin GDASH",
    "role": "admin"
  }' \
  -w "\n%{http_code}" \
  -s)

http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | head -n-1)

if [ "$http_code" -eq "201" ] || [ "$http_code" -eq "200" ]; then
    echo "✅ Usuário admin criado com sucesso!"
    echo "$body" | jq .
elif [ "$http_code" -eq "400" ]; then
    echo "⚠️  Usuário já existe ou dados inválidos"
    echo "$body" | jq .
else
    echo "❌ Erro ao criar usuário (HTTP $http_code)"
    echo "$body"
fi

echo ""
echo "📧 Email: admin@gdash.com"
echo "🔑 Senha: admin123"
