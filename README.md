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