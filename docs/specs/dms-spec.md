# Especificação - Document Management System

## 1. Objetivo

Entregar um sistema web simples para que usuários enviem, consultem e baixem documentos armazenados localmente pela aplicação.

## 2. Escopo

### Dentro do escopo

- Upload de um documento por requisição.
- Listagem dos documentos disponíveis para o usuário.
- Download de um documento pelo identificador.
- Gestão simples por usuário, usando um identificador de usuário sem autenticação completa.
- Interface React para upload, listagem, estados de carregamento e download.
- API HTTP Express para os fluxos do sistema.
- Persistência dos arquivos no filesystem local e dos metadados em memória.

### Fora do escopo

- Banco de dados ou persistência durável dos metadados.
- Armazenamento externo ou em nuvem.
- Login, sessões, tokens, autorização por papéis ou integração com provedor de identidade.
- Versionamento, edição, preview, OCR, busca textual, compartilhamento ou colaboração.
- Exclusão de documentos e administração avançada.

## 3. Requisitos funcionais

| ID | Requisito |
| --- | --- |
| RF-01 | O sistema deve aceitar upload usando `multipart/form-data` com um campo de arquivo definido pelo contrato da API. |
| RF-02 | O sistema deve rejeitar requisições sem arquivo e retornar erro de validação em formato JSON. |
| RF-03 | Cada upload válido deve gerar um identificador único, registrar os metadados e gravar o conteúdo em `backend/storage`. |
| RF-04 | O sistema deve associar o documento ao usuário informado pelo cliente ou pela configuração da aplicação, conforme o mecanismo simples definido para o MVP. |
| RF-05 | O sistema deve retornar os metadados do documento criado sem expor o caminho físico interno do arquivo. |
| RF-06 | O sistema deve listar os documentos em formato JSON, ordenados do mais recente para o mais antigo. |
| RF-07 | A listagem deve permitir filtrar os documentos pelo usuário atual e não deve expor documentos de outro usuário quando houver contexto de usuário. |
| RF-08 | O sistema deve localizar um documento pelo identificador e transmitir seu conteúdo binário para download. |
| RF-09 | O download deve preservar o nome original por meio de `Content-Disposition` e informar o tipo MIME quando disponível. |
| RF-10 | O sistema deve retornar `404` para identificadores inexistentes ou arquivos que não estejam mais disponíveis. |
| RF-11 | O sistema deve retornar `400` para entradas inválidas, `413` para arquivos acima do limite configurado e `500` para falhas internas não recuperáveis. |
| RF-12 | O sistema deve expor um endpoint de saúde que permita verificar se a aplicação está disponível. |
| RF-13 | A interface deve permitir selecionar um arquivo, enviar o upload, atualizar a listagem e iniciar o download de um documento. |
| RF-14 | A interface deve apresentar estados de carregamento e mensagens de erro sem interromper a navegação da página. |

## 4. Requisitos não funcionais

| ID | Requisito |
| --- | --- |
| RNF-01 | O backend deve usar Node.js, Express e CommonJS, respeitando as dependências e scripts existentes. |
| RNF-02 | O backend deve seguir o fluxo de dependência `routes -> controllers -> services -> repositories`. |
| RNF-03 | As rotas devem somente encaminhar requisições; controllers devem tratar HTTP; services devem conter regras de negócio; repositories devem tratar filesystem e metadados. |
| RNF-04 | Uploads devem usar `multer` com `diskStorage` e ser gravados exclusivamente em `backend/storage`. |
| RNF-05 | Metadados devem permanecer em memória nesta fase e não podem depender de banco de dados ou serviço externo. |
| RNF-06 | O nome físico do arquivo deve ser seguro e gerado pela aplicação; nomes enviados pelo cliente não podem controlar caminhos do filesystem. |
| RNF-07 | O diretório de armazenamento deve ser criado quando necessário e os erros de leitura, gravação e ausência do arquivo devem ser tratados. |
| RNF-08 | Limites de tamanho, porta, diretório de armazenamento, campo do upload e usuário padrão devem ser configuráveis por variáveis de ambiente, com valores padrão documentados. |
| RNF-09 | A API deve usar JSON para respostas estruturadas, códigos HTTP coerentes e mensagens sem stack trace em produção. |
| RNF-10 | O frontend deve usar componentes funcionais, React Hooks, Vite e comunicação com o backend via `fetch` no prefixo `/api`. |
| RNF-11 | O sistema deve manter funções pequenas, responsabilidades únicas e dependências internas apontando para abstrações mais estáveis. |
| RNF-12 | Os fluxos críticos devem ter testes automatizados para upload, listagem, download, validação e erros principais. |

## 5. Modelo de dados

### 5.1 Metadados do documento

| Campo | Tipo | Obrigatório | Descrição |
| --- | --- | --- | --- |
| `id` | string | sim | Identificador único público do documento. |
| `originalName` | string | sim | Nome original enviado pelo usuário, usado apenas como informação e nome de download. |
| `storedName` | string | sim, interno | Nome seguro usado no filesystem; não deve ser retornado em respostas públicas. |
| `size` | number | sim | Tamanho do arquivo em bytes. |
| `mimeType` | string | sim | Tipo MIME informado ou detectado pelo upload. |
| `uploadedAt` | string | sim | Data e hora do upload em ISO 8601 UTC. |
| `owner` | string | sim | Identificador do usuário dono do documento. |

A coleção em memória deve manter os metadados necessários para localizar o arquivo e autorizar a operação. O caminho absoluto ou relativo do storage é detalhe do repository e não faz parte do contrato público.

### 5.2 Regras de dados

- `id` deve ser gerado no servidor e não pode ser aceito do cliente.
- `storedName` deve ser derivado de um identificador seguro, sem permitir `..`, separadores de diretório ou sobrescrita intencional.
- `originalName` deve ser normalizado para apresentação e tratado como dado não confiável.
- `owner` deve ser obtido do contexto de usuário definido pela aplicação; na ausência de autenticação, o MVP pode usar `DEFAULT_OWNER` configurável.
- A remoção do processo reinicia os metadados, mesmo que os arquivos ainda existam no storage; a reconciliação desses arquivos não faz parte do MVP.

## 6. Contratos de API

Todas as rotas de negócio devem ser expostas sob `/api` no frontend por meio do proxy do Vite. Os exemplos abaixo usam os caminhos públicos do backend.

### 6.1 GET `/health`

Verifica a disponibilidade da aplicação.

**Resposta `200 OK`:**

```json
{"status":"ok"}
```

### 6.2 POST `/upload`

Recebe um documento.

**Entrada:** `multipart/form-data`, com o campo `file` contendo um único arquivo. O usuário pode ser informado pelo mecanismo de contexto adotado, por exemplo `X-User-Id`; quando ausente, deve ser usado o usuário padrão configurado.

**Resposta `201 Created`:**

```json
{
  "id": "document-id",
  "originalName": "relatorio.pdf",
  "size": 12345,
  "mimeType": "application/pdf",
  "uploadedAt": "2026-09-15T12:00:00.000Z",
  "owner": "user-1"
}
```

**Erros:** `400` para campo ausente ou entrada inválida; `413` para limite excedido; `500` para falha ao gravar ou registrar o documento.

### 6.3 GET `/documents`

Lista os documentos do usuário atual.

**Entrada opcional:** contexto de usuário, como `X-User-Id`. A implementação pode aceitar um filtro explícito somente se ele não permitir acesso a documentos de outro usuário.

**Resposta `200 OK`:**

```json
{
  "documents": [
    {
      "id": "document-id",
      "originalName": "relatorio.pdf",
      "size": 12345,
      "mimeType": "application/pdf",
      "uploadedAt": "2026-09-15T12:00:00.000Z",
      "owner": "user-1"
    }
  ]
}
```

Uma coleção vazia deve retornar `200` com `documents: []`.

### 6.4 GET `/documents/:id/download`

Transmite o conteúdo binário do documento identificado por `id`, desde que ele pertença ao usuário atual.

**Resposta `200 OK`:** corpo binário com `Content-Type` correspondente ao `mimeType` e `Content-Disposition: attachment; filename="<nome-original>"`.

**Erros:** `400` para identificador inválido; `404` para documento ausente, inacessível ou arquivo não encontrado; `500` para falha inesperada de leitura.

### 6.5 Formato de erro

Respostas de erro devem usar o formato consistente:

```json
{
  "error": {
    "code": "DOCUMENT_NOT_FOUND",
    "message": "Documento não encontrado."
  }
}
```

O `code` deve ser estável para consumo do frontend e a mensagem não deve revelar caminhos internos ou detalhes de infraestrutura.

## 7. Decisões arquiteturais

### 7.1 Backend

O backend segue Clean Architecture simples, sem abstrações além das necessárias:

- `routes/`: registra endpoints, middlewares de upload e delega para controllers.
- `controllers/`: lê parâmetros, headers e arquivos; valida o mínimo necessário; traduz resultados e erros para HTTP.
- `services/`: aplica regras de ownership, geração de metadados, ordenação, validação e coordenação do upload/download.
- `repositories/`: encapsula a coleção de metadados em memória e as operações de filesystem em `backend/storage`.
- `app.js`: configura Express, middlewares, rotas e endpoint de saúde; não deve conter regra de negócio.

O `multer` deve ser configurado na borda HTTP com `diskStorage`. O service não deve conhecer detalhes de `req`/`res`, e o repository não deve conhecer HTTP.

### 7.2 Frontend

O frontend React deve organizar a experiência em componentes e páginas, mantendo chamadas HTTP em `src/services`. A página principal deve carregar documentos, enviar arquivos, mostrar feedback e acionar downloads por URL da API.

### 7.3 Fluxos principais

1. Upload: route/multer recebe o arquivo, controller coleta o resultado, service valida e registra, repository confirma o arquivo e os metadados, controller retorna `201`.
2. Listagem: controller obtém o usuário, service solicita documentos filtrados, repository retorna cópia dos metadados públicos, controller retorna `200`.
3. Download: controller recebe o identificador, service valida ownership e busca a referência, repository abre o arquivo, controller define headers e transmite o binário.

## 8. Plano de execução

O plano abaixo descreve as etapas de implementação; esta especificação não executa nenhuma delas.

1. **Configuração e fundação:** definir variáveis de ambiente, defaults, limite de upload, diretório local e tratamento global de erros.
2. **Repositories:** implementar o armazenamento de metadados em memória, o repository de arquivos locais e a criação segura de `backend/storage`.
3. **Services:** implementar upload, listagem filtrada por owner e resolução de download, incluindo regras de validação e erros de domínio.
4. **Controllers e routes:** configurar `multer.diskStorage`, declarar `/upload`, `/documents`, `/documents/:id/download` e `/health`, e mapear erros para os contratos HTTP.
5. **Integração do app:** conectar as rotas ao Express, configurar o prefixo esperado pelo proxy e confirmar que o app continua exportável para testes.
6. **Frontend:** criar a página principal, componentes de upload e listagem, service de `fetch`, estados de carregamento/erro/vazio e ação de download.
7. **Testes do backend:** cobrir health check, upload válido, ausência de arquivo, limite, listagem, isolamento por owner, download válido, `404` e falhas de filesystem; limpar arquivos temporários ao final.
8. **Testes e build do frontend:** validar renderização, envio, atualização da lista, mensagens de erro e geração do build de produção.
9. **Validação integrada:** executar backend e frontend localmente, testar o fluxo completo com um arquivo real, conferir headers do download e confirmar que nenhum caminho interno é exposto.
10. **Documentação operacional:** registrar comandos de desenvolvimento, variáveis de ambiente, limites, localização do storage e a perda esperada dos metadados após reinício.

## 9. Critérios de aceite

- Um arquivo válido é gravado em `backend/storage` com nome físico seguro e metadados retornados pela API.
- A listagem retorna somente metadados públicos, ordenados por data, respeitando o usuário atual.
- Um documento existente pode ser baixado com nome e tipo MIME adequados.
- Entradas inválidas, documentos ausentes, arquivos acima do limite e falhas internas retornam códigos e JSON conforme o contrato.
- O backend mantém as responsabilidades separadas nas quatro camadas definidas.
- O frontend realiza upload, listagem e download sem recarregamento manual da página.
- Os testes automatizados cobrem os fluxos críticos e o build do frontend é concluído.
- Nenhum banco de dados, armazenamento externo ou recurso fora do escopo é introduzido.