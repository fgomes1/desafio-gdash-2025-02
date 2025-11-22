# 🌤️ Desafio GDASH 2025/02 - Sistema de Monitoramento Climático

Esta aplicação é uma solução Full-Stack para coleta, processamento e visualização de dados climáticos em tempo real, desenvolvida como parte do processo seletivo da GDASH.

O sistema integra **Python** (coleta), **RabbitMQ** (mensageria), **Go** (processamento), **NestJS** (API) e **React** (Frontend).

---

## 🚀 Pré-requisitos

Para rodar este projeto, você precisará ter instalado em sua máquina:

* **Docker** e **Docker Compose**
* **Git**
* (Opcional) Make ou terminais bash (WSL/Linux/Mac)

---

## ⚙️ Configuração Inicial

Antes de subir os containers, é necessário configurar as variáveis de ambiente.

1.  Na raiz do projeto, duplique o arquivo de exemplo:
    ```bash
    cp .env.example .env
    ```

2.  Abra o arquivo `.env` recém-criado e preencha as variáveis se necessário (para rodar localmente, as configurações padrão do `.env.example` já funcionam para a infraestrutura).

---

## 🐳 Rodando a Infraestrutura (Banco de Dados e Fila)

Atualmente, o projeto possui a configuração via Docker para os serviços de infraestrutura (MongoDB e RabbitMQ).

Para iniciar os serviços, execute na raiz do projeto:

```bash
docker compose up -d
```

## 🐍 Rodando o Python (Producer)

```bash
docker compose up -d

# 1. Entre na pasta
cd weather-collector

# 2. Crie e ative o ambiente virtual (Recomendado)
python3 -m venv venv
source venv/bin/activate  # Linux/Mac/WSL
# .\venv\Scripts\activate # Windows

# 3. Instale as dependências
pip install -r requirements.txt

# 4. Execute
python main.py
 ```


## 🐹  Rodando o go (Cosumer)

# 1. Entre na pasta (Em um novo terminal)
 ```bash
cd weather-worker

# 2. Baixe as dependências
go mod tidy

# 3. Execute
go run main.go
```

## 🦁 Rodando a API (NestJS)

O backend é responsável por receber os dados tratados do Worker, persistir no MongoDB e expor endpoints para o Frontend.

### 📋 Configuração

1. **Acesse a pasta da API:**
   ```bash
   cd api
  ```
  
  ```bash
  npm install
  ```


   ```bash
   npm run start:dev
  ```
  
A API estará rodando em: **http://localhost:3000**

---

## 📚 Documentação da API (Swagger)

A API possui documentação interativa completa usando **Swagger/OpenAPI**.

### 🔗 Acessar Swagger

Após iniciar a API, acesse:

- **Swagger UI**: http://localhost:3000/api
- **JSON Schema**: http://localhost:3000/api-json

### 🎯 Funcionalidades do Swagger

- ✅ Visualizar todos os endpoints disponíveis
- ✅ Testar endpoints diretamente no navegador
- ✅ Ver exemplos de request/response
- ✅ Autenticar usando JWT (botão "Authorize")
- ✅ Documentação organizada por tags:
  - **auth**: Login e autenticação
  - **users**: CRUD de usuários
  - **weather**: Dados climáticos e insights de IA

### 🔐 Como testar com autenticação:

1. Acesse http://localhost:3000/api
2. Execute o endpoint `POST /auth/login` com credenciais válidas
3. Copie o `access_token` da resposta
4. Clique no botão **"Authorize"** no topo da página
5. Cole o token no campo de autenticação
6. Agora você pode testar endpoints protegidos!

---