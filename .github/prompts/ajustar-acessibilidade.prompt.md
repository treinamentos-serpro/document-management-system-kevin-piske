---
description: Analisa e implementa ajustes de acessibilidade no frontend React conforme WCAG 2.1/2.2.
name: ajustar-acessibilidade
argument-hint: fluxo ou arquivo do frontend a ajustar (ex. upload, lista de documentos ou frontend/src/App.jsx)
agent: accessibility-expert
---

# Ajustar acessibilidade

Analise e implemente ajustes de acessibilidade no escopo `${input:escopo:fluxo ou arquivo do frontend}` do DMS.

Requisitos:

- Leia os componentes, serviços e estilos relacionados antes de editar.
- Faça uma revisão rápida de semântica, nomes acessíveis, teclado, foco, contraste, zoom e estados dinâmicos.
- Priorize HTML semântico e controles nativos; use ARIA somente quando necessário.
- Garanta acessibilidade nos fluxos de upload, listagem, atualização, mensagens de erro e download.
- Use componentes funcionais e Hooks já adotados no frontend, evitando duplicação e mudanças no backend sem necessidade.
- Implemente mensagens de carregamento, sucesso e erro perceptíveis por leitores de tela e por usuários visuais.
- Preserve a entrada do usuário em falhas recuperáveis e mantenha o foco visível com `:focus-visible`.
- Respeite `prefers-reduced-motion`, zoom de até 400% e não dependa apenas de cor, hover ou ícones.
- Adicione ou atualize testes quando houver infraestrutura adequada; não instale dependências sem justificar.
- Execute o build e os testes disponíveis após as alterações.

Ao finalizar, informe:

1. Problemas encontrados e critérios WCAG relacionados.
2. Arquivos alterados e comportamento corrigido.
3. Validações executadas e verificações manuais ainda necessárias.