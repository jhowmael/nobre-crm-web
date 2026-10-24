# Product

## Platform

web

## Users

Vendedores do time comercial da Nobre Brindes (hoje Ana, Bruno e Carla, vindos de `GET /sellers` da API). Usam o CRM no dia a dia, em sessões curtas e repetidas ao longo do expediente, majoritariamente no computador do escritório e às vezes no celular, entre ligações e visitas. O trabalho é descobrir rápido qual negociação precisa de ação hoje e movê-la no funil. (Inferido do README e do enunciado; não houve entrevista.)

## Product Purpose

CRM interno de funil de vendas B2B de brindes corporativos. Mostra as oportunidades em um Kanban de seis etapas (Primeiro Contato, Apresentação de Orçamento, Follow-up, Forecast, Fechamento e Perdida) e em lista, destaca o que precisa de atenção e conduz as transições com as regras do funil. Sucesso: o vendedor abre a tela e, em segundos, sabe o que trabalhar hoje e consegue agir.

## Positioning

O funil é dirigido por regras de negócio explícitas, todas mantidas pela API (`nobre-crm-api`): transições permitidas e mensagens de bloqueio (`GET /catalogs`), campos exigidos por etapa e alertas de atenção calculados a partir de prazos de proposta, contato e data do evento (campo `attention` de cada oportunidade). A tela explica cada bloqueio no momento em que ele acontece, com o texto que a API envia.

## Operating Context

- Todos os dados vêm da API REST (`nobre-crm-api`, NestJS, Prisma, PostgreSQL), pelo cliente tipado em `src/lib/api.ts`; a data de referência é a `today` de `GET /catalogs` (15/10/2026 com `APP_TODAY` no case).
- Login simulado: o usuário padrão é a Ana; o menu do usuário troca para qualquer vendedor ativo da API. Não há autenticação real.
- As tarefas de retorno ("Para trabalhar hoje") são geradas pela automação da API.

## Capabilities and Constraints

- Kanban com arraste por mouse, toque e teclado; lista ordenável; busca e filtros resolvidos pela API (só as minhas, só o que precisa de atenção, vendedor, etapa); gaveta de detalhe; modais de perda, de fechamento, de completar dados e de nova oportunidade; painel de tarefas de retorno com conclusão; troca de tema; menu do usuário.
- Fechamento e Perdida são finais. Não se pulam etapas nem se volta para Primeiro Contato.
- Interface em pt-BR. Código sem comentários.

## Brand Commitments

- Nome: Nobre Brindes. Cor da marca: verde #83b735 (usada no monograma).
- Tom: direto, operacional, em português do Brasil, sem jargão técnico.

## Evidence on Hand

Os 7 registros do case, carregados pelo seed da API (`nobre-crm-api/prisma/seed-data.ts`). Não há fotos, logotipo vetorial oficial nem depoimentos; nada disso deve ser inventado.

## Product Principles

1. O que precisa de ação hoje aparece primeiro e é encontrado em segundos.
2. Toda regra que bloqueia um movimento se explica no lugar e no momento do bloqueio.
3. Familiaridade antes de expressão: controles padrão, comportamento previsível.
4. Funciona por mouse, toque, teclado e leitor de tela.

## Accessibility & Inclusion

WCAG 2.1 AA nos dois temas; alvos de toque de pelo menos 44 px em telas de toque; texto de no mínimo 12 px (a escala usa 13 px como menor tamanho); respeito a `prefers-reduced-motion` e `prefers-contrast`.
