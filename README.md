# Monitor de Dores Crônicas

Trabalho da disciplina de Bancos de Dados. CRUD simples para acompanhar pacientes com dores crônicas de estômago, cabeça e hipersensibilidade, pensado para ajudar médicos a identificar padrões antes que a dor se torne insuportável.

## Tecnologias

- HTML + JavaScript puro (sem framework, sem build)
- [Firebase Firestore](https://firebase.google.com/docs/firestore) como banco de dados

## Funcionalidades

- CRUD de **Pacientes** (com médico responsável vinculado)
- CRUD de **Médicos**
- CRUD de **Registros de Dor** (data, local, intensidade 0-10, gatilho, sintomas)
- **Relatórios** com filtro por paciente, por médico e por período, com alerta automático quando a intensidade está alta

## Rodando localmente

Este projeto fala direto com o Firestore pelo navegador, então basta servir os arquivos estáticos:

```bash
python -m http.server 5500
```

Depois acesse `http://localhost:5500`. Não é possível abrir o `index.html` com duplo clique: os módulos JavaScript exigem `http://`.

Para usar com seu próprio projeto Firebase, edite `js/firebase-config.js` com as credenciais do seu app (Firebase Console → Configurações do projeto → Seus apps). O arquivo [firestore.rules](firestore.rules) traz um exemplo de regras de segurança para colar na aba **Regras** do Firestore Database.

## Estrutura

```
index.html
css/style.css
js/
  firebase-config.js   # credenciais do Firebase
  pacientes.js          # CRUD de pacientes
  medicos.js             # CRUD de médicos
  registros.js            # CRUD de registros de dor
  relatorios.js           # tela de relatórios com filtros
  app.js                   # navegação entre abas
firestore.rules
```
