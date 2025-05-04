# Central de Notificações

Esse projeto é uma **Central de Notificações** que envia notificações em tempo real por diversos canais, como **Email**, **SMS** e **Push**. A aplicação foi dividida entre o backend, feito com **Node.js** e **MongoDB**, e o frontend, que utiliza **React**.

---

## Objetivo

A ideia é permitir o envio de notificações por canais dinâmicos (Email, SMS, Push, etc.), com **arquitetura modular** e **fácil expansão** para novos canais. O código foi projetado para que novos tipos de canais possam ser adicionados sem necessidade de mexer na base existente.

---

## Funcionalidades

### 1. **Cadastro de Canal de Notificação**
- Mostra os canais disponíveis: **Email**, **SMS**, **Push**.
- Permite ativar ou desativar os canais conforme necessário.

### 2. **Envio de Notificações**
- Formulário onde o usuário insere **assunto** e **mensagem**.
- Checkboxes para selecionar os canais em que a notificação será enviada.
- O backend realiza o envio para os canais ativos.

### 3. **Status de Envio em Tempo Real**
- Uso de **WebSocket** para mostrar em tempo real se a notificação foi "Enviada" ou "Falhou".

### 4. **Histórico de Notificações**
- Mostra as últimas **20 notificações** enviadas, incluindo **canal**, **assunto** e **data**.

---

## Expansibilidade

O sistema foi feito para ser **expansível**, com a possibilidade de adicionar novos canais sem grandes modificações na estrutura.

### 1. **Adicionar Novos Canais de Notificação**
- **Padrão de Fábrica (Factory Pattern)**: Para adicionar novos canais, basta implementar um novo **sender** (ex: WhatsApp, Telegram, Slack) que siga a interface do sistema e integrá-lo à **NotificationFactory**.

### 2. **Integração com Novos Sistemas de Envio**
- Facilidade para integrar novas plataformas de envio (ex: novos provedores de SMS ou email) utilizando **Injeção de Dependência**, garantindo que o sistema se mantenha flexível e fácil de testar.

### 3. **WebSocket para Novos Canais**
- A arquitetura de **WebSocket** foi projetada para integrar facilmente novos canais de notificação e permitir a atualização do status de envio em tempo real.

---

## Padrões de Projeto

### 1. **Factory Pattern**
- **Aplicação**: Usado para criar instâncias de **senders** (EmailSender, SmsSender, PushSender).
- **Objetivo**: Facilita a inclusão de novos canais de notificação, sem alterar o funcionamento da aplicação.

### 2. **Strategy Pattern**
- **Aplicação**: Cada **sender** implementa uma interface comum de `send(notification)`.
- **Objetivo**: Permite enviar notificações de diferentes formas, dependendo do canal.

### 3. **Observer Pattern**
- **Aplicação**: Usado para broadcast de status de envio via **WebSocket**.
- **Objetivo**: Atualiza o frontend em tempo real sobre o status da notificação.

### 4. **Context API (Frontend)**
- **Aplicação**: Gerencia o estado global da aplicação, como **canais de notificação** e o **histórico**.
- **Objetivo**: Facilita a comunicação entre os componentes React.

### 5. **Factory Pattern (Frontend)**
- **Aplicação**: Usado para criação dinâmica dos formulários de envio.
- **Objetivo**: Adiciona novos campos específicos para canais de notificação sem alterar o código central.

---

## Estrutura do Projeto

### Backend
- **Node.js** + **Express**
  - **Controladores**: Gerenciam as requisições e respostas.
  - **Services**: Contêm a lógica de negócios, como o envio das notificações.
  - **Factories**: Lógica para criar instâncias dos **senders**.
  - **Models**: Estrutura do banco de dados no MongoDB (ex: `Notification`, `Channel`).

### Frontend
- **React** + **Context API** + **React Hooks**
  - **Components**: Contêm os formulários de envio de notificações e visualização do histórico.
  - **Contexts**: Gerenciam o estado global da aplicação.
  - **Factories**: Responsáveis pela criação dinâmica dos formulários de notificação.

---

## Endpoints

### 1. **GET /notifications**
- Retorna o histórico das últimas 20 notificações enviadas.
  
### 2. **POST /notifications**
- Cria uma nova notificação com **assunto**, **mensagem** e **canais** selecionados.
  
### 3. **GET /channels**
- Lista os canais de notificação disponíveis e seu status (ativo/inativo).
  
### 4. **PUT /channels/:name**
- Ativa ou desativa um canal de notificação baseado no nome (`email`, `sms`, `push`).
  
