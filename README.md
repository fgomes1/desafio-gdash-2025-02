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

### 6. Rodando a API (NestJS) 🦁

O backend é responsável por receber os dados tratados do Worker, persistir no MongoDB e expor endpoints para o Frontend.

#### 📋 Configuração

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
  