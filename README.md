# Nobre CRM Web

Frontend do CRM interno da Nobre Brindes: um funil de vendas B2B em Kanban para o time comercial encontrar rápido a negociação que precisa trabalhar hoje.

Este repositório é só a interface. A API (`nobre-crm-api`: NestJS, Prisma e PostgreSQL) é a **fonte única da verdade**: oportunidades, vendedores, regras do funil, alertas e tarefas de retorno vêm dela. O frontend não guarda dados próprios nem repete regras de negócio.

**Tecnologias:** Next.js 15, React 19, TypeScript, Tailwind CSS 4, TanStack Query, dnd-kit, openapi-typescript e Vitest.

**Neste README:** [Subir em 3 minutos](#subir-em-3-minutos) · [O que experimentar](#o-que-experimentar) · [Problemas comuns](#problemas-comuns) · [Variáveis](#variáveis-de-ambiente) · [De onde vem cada dado](#de-onde-vem-cada-dado) · [Decisões de produto](#decisões-de-produto) · [Testes](#testes) · [Design](#design) · [Limitações](#limitações)

## Subir em 3 minutos

Requisitos: Docker (para a API e o banco) e Node 20 ou superior (para este frontend).

**1. A API e o banco** (na pasta `nobre-crm-api`, detalhes no README dela):

```
cp .env.example .env
docker compose --profile app up --build -d
docker compose --profile tools run --rm --build seed
```

**2. O frontend** (nesta pasta):

```
npm install
npm run dev
```

Abra http://localhost:3000. A API responde em http://localhost:3333 (Swagger em `/docs`). O `.env.local` é opcional: o endereço padrão da API já é `http://localhost:3333`.

Para desligar a API e o banco: `docker compose --profile app --profile tools down`, na pasta da API.

## O que experimentar

Com os dados do case, a tela abre como a vendedora Ana (a data de referência é 15/10/2026):

1. **Para trabalhar hoje:** no painel do topo aparece a Clínica Vida ("Evento em 3 dias e ainda em Follow-up"). Clique nela para abrir o detalhe.
2. **Arrastar um card:** arraste a Clínica Vida de Follow-up para Forecast. A mudança é gravada na API e entra no histórico do card.
3. **Movimento bloqueado:** tente arrastar um card de Primeiro Contato direto para Fechamento. A coluna mostra o motivo em vez de aceitar o card; o mesmo vale para os cards de etapa final.
4. **Regras de preenchimento:** mover para Apresentação de Orçamento pede valor, itens e validade; marcar como Perdida pede o motivo, escolhido entre os do catálogo.
5. **Ver o funil inteiro:** em Filtros, desligue "Só as minhas" para ver as 7 oportunidades. Com o filtro desligado, a busca acha por empresa, código, vendedor ou brinde ("pulso", "OPP-2003", "agenda").
6. **Registrar um contato:** com "Só as minhas" desligado, abra a Agência Pulso e use "Registrar contato hoje" na gaveta: o alerta "Sem contato há 13 dias" desaparece do painel.
7. **Estados de erro:** abra http://localhost:3000/?falha=1 para ver a tela de erro com "Tentar novamente".
8. **Teclado:** Tab até um card, Espaço para pegar, setas para trocar de coluna, Espaço para soltar; Enter abre o detalhe.
9. **Tema:** o botão de lua/sol no topo alterna entre claro e escuro.

## Problemas comuns

| Sintoma | Causa e solução |
|---|---|
| A tela mostra "Não foi possível carregar o funil" | A API não está no ar. Rode o passo 1 e abra http://localhost:3333/health: deve responder `{"status":"ok","database":"up"}`. |
| O console do navegador mostra erro de CORS | Inclua a origem do frontend em `CORS_ORIGIN` no `.env` da API (padrão `http://localhost:3000`) e reinicie a API. |
| O funil abre vazio, ou sem a Clínica Vida | O banco não tem o seed. Rode o terceiro comando do passo 1. |
| "A API recusou a chave de acesso." | A API está com `API_KEY` definida. Preencha `NEXT_PUBLIC_API_KEY` em `.env.local` com o mesmo valor (só para demonstração). |
| A porta 3000 está ocupada | Outro programa usa a porta. Rode `npm run dev -- -p 3001` e inclua `http://localhost:3001` em `CORS_ORIGIN` da API. |
| `npm run api:types` não acha o `openapi.json` | Ele espera a API em `../nobre-crm-api`. Aponte outro caminho com `OPENAPI_SOURCE=/caminho/openapi.json`. |

Outros comandos: `npm run build`, `npm start`, `npm run lint`, `npm test` e `npm run api:types`.

## Variáveis de ambiente

| Variável | Padrão | Uso |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `http://localhost:3333` | endereço da API |
| `NEXT_PUBLIC_API_KEY` | vazia | enviada no cabeçalho `x-api-key` quando a API tem `API_KEY` definida |

Variáveis `NEXT_PUBLIC_*` vão para o JavaScript do navegador. Expor a chave da API ali só serve para demonstração: qualquer pessoa com acesso à tela consegue lê-la. Em produção a autenticação viria do SSO do grupo (OIDC/JWT emitido para o usuário logado), e a chave de API ficaria restrita à comunicação entre serviços.

## Tipos gerados do OpenAPI

Os tipos de domínio (`Stage`, `Opportunity`, `FollowupTask` etc.) derivam do contrato da API:

```
npm run api:types
```

O script (`scripts/api-types.mjs`) lê o `openapi.json` indicado em `OPENAPI_SOURCE` (padrão `../nobre-crm-api/openapi.json`) e gera `src/api/schema.ts` com o `openapi-typescript`, usando enums TypeScript reais (`Stage.FOLLOW_UP`, `AttentionLevel.high`…). O arquivo gerado é versionado e não deve ser editado à mão; `src/lib/types.ts` só dá nomes curtos a esses tipos. Quando a API mudar o contrato, rode `npm run openapi:export` lá e `npm run api:types` aqui; o `tsc` aponta o que precisa mudar.

## De onde vem cada dado

| Na tela | Origem |
|---|---|
| Data de referência ("Hoje, 15/10/2026") | `GET /catalogs` → `today` |
| Colunas, ordem, rótulos, dicas (ícone ⓘ) e requisitos das etapas | `GET /catalogs` → `stages[]` (`order`, `label`, `hint`, `requirement`, `final`) |
| Movimentos permitidos | `allowedTransitions` de cada oportunidade (a matriz completa vem em `catalogs.transitions`) |
| Mensagens de bloqueio (coluna durante o arraste, balão de etapa final, aviso ao soltar, gaveta) | `GET /catalogs` → `blockedReasons[origem][destino]` |
| Motivos de perda | `GET /catalogs` → `lossReasons` (só os ativos aparecem para escolha) |
| Alertas dos cards, da lista e da gaveta | `attention.level` e `attention.signals[].message` de cada oportunidade |
| Vendedores (filtro, criação, troca de usuário) | `GET /sellers` |
| "Para trabalhar hoje" e os números Agir hoje / Acompanhar | `GET /followup-tasks` |
| Histórico de etapas | `GET /opportunities/:id/history` |

O catálogo é carregado uma vez (`staleTime` infinito) por `useCatalogs` e distribuído por um contexto (`src/components/app-data.tsx`). Enquanto ele e os vendedores carregam, a tela mostra o esqueleto completo; se falharem, mostra o erro com "Tentar novamente". O que sobrou no frontend é apresentação: a cor de cada etapa (`var(--stage-*)`, em `src/lib/stages.ts`) e a ordem de urgência dos cards.

## Cliente HTTP

`src/lib/api.ts` é um cliente `fetch` tipado:

- base em `NEXT_PUBLIC_API_URL` e `x-api-key` de `NEXT_PUBLIC_API_KEY`;
- tempo limite com `AbortController` (10 s em leituras, 15 s em escritas), respeitando o cancelamento do TanStack Query;
- `ApiError` com `status`, `message` (já em linguagem de usuário) e `errors[]` (`{ field, message }` da API);
- falha de rede vira "Não foi possível conectar à API…"; o cabeçalho `X-Total-Count` é lido quando a listagem é paginada.

Como cada erro aparece:

| Status | Na tela |
|---|---|
| 409 | "Esta oportunidade foi alterada por outra pessoa. Os dados foram atualizados." A lista, o histórico e as tarefas são recarregados e o modal aberto continua com o que foi digitado; a nova tentativa usa a versão atualizada. |
| 400 / 422 | `errors[].message` embaixo do campo quando `field` é do formulário (`estimatedValue`, `items`, `proposalValidUntil`, `lossReasonCode`, `to`…); o que não tem campo vira aviso. |
| 429 | "Muitas requisições. Aguarde um instante e tente novamente.", com o botão "Tentar novamente". |
| 401 | "A API recusou a chave de acesso." |
| 503 e rede | mensagem de indisponibilidade ou de conexão, com "Tentar novamente" no aviso, no esqueleto de erro ou na faixa "Não foi possível atualizar". |

## Oportunidades

- Consultas e mutações com TanStack Query (`src/hooks/queries.ts`).
- Busca (com espera de 300 ms após a digitação), vendedor, etapa e "só o que precisa de atenção" são parâmetros de `GET /opportunities`. Uma segunda consulta, só com o vendedor do escopo, alimenta os totais das colunas ("2 de 5 oportunidades") e os números do resumo; sem filtros, as duas são a mesma consulta.
- A ordem por urgência é calculada no cliente a partir de `attention`: nível, quantidade de sinais, evento mais próximo e maior valor.
- Mover de etapa, editar validade, registrar motivo pendente e registrar contato atualizam a tela na hora e desfazem a mudança se a API recusar. Mover e editar enviam `expectedVersion` com a versão que a tela conhece; as escritas rodam em fila, e cada uma lê a versão mais recente do cache quando sai.
- Orçamento: o modal continua pedindo valor, itens e validade (a validade é opcional na API, mas a tela mantém a pergunta) e envia `estimatedValue`, `items` e `proposalValidUntil` junto com a mudança de etapa. Ele abre quando falta algum desses dados ou a validade já venceu.
- Perdida: o motivo é escolhido entre os ativos do catálogo (`lossReasonCode`), com observação opcional (`lossNote`).
- Motivo pendente: perdas migradas aparecem com `lossReasonPending`; "Registrar motivo" grava uma única vez com `PATCH /opportunities/:id`.
- Fechamento pede confirmação e só fecha o modal quando a API confirma.

## Tarefas de retorno (automação visível)

O painel "Para trabalhar hoje" mostra as tarefas abertas de `GET /followup-tasks` (`status=OPEN`, `dueUntil` igual ao `today` do catálogo e, com "Só as minhas" ou um vendedor filtrado, o `sellerId` dele). As tarefas são agrupadas por oportunidade (uma linha com todos os motivos), em ordem de nível (agir hoje antes de acompanhar) e de vencimento. Clicar abre a gaveta; o botão de check conclui as tarefas da linha (`PATCH /followup-tasks/:id/done`) e a linha some na hora. Os números Agir hoje e Acompanhar contam essas linhas.

**Decisão:** a API gera as tarefas por um job diário (dias úteis, 7h). Para a tela não depender do horário do job, o frontend chama `POST /followup-tasks/generate` uma vez ao abrir (a rotina é idempotente) e de novo, em segundo plano, depois de ações que mudam alertas: mover etapa, registrar contato, editar validade e criar oportunidade. Em seguida recarrega as tarefas. Assim, registrar um contato faz a tarefa "Sem contato há N dias" sumir e uma oportunidade nova com evento próximo já aparece no painel. Chamadas que chegam enquanto uma geração está em andamento são agrupadas em uma só. Se a geração falhar, a tela avisa e mostra as tarefas que já existiam.

## Decisões de produto

**Funil.** Primeiro Contato, Apresentação de Orçamento, Follow-up, Forecast e Fechamento, mais Perdida. Fechamento e Perdida são finais. As transições permitidas, os retornos (Follow-up → Orçamento, Forecast → Follow-up) e os motivos de bloqueio são definidos pela API e documentados no README dela.

**Gaveta de detalhes.** Mostra os alertas completos, as próximas etapas com o requisito de cada uma (do catálogo), os bloqueios que valem para a etapa atual (de `blockedReasons`) e, nos botões de mover, o que falta preencher (ex.: "Falta valor e brinde").

**Filtros.** Com a Ana logada, o funil abre com "Só as minhas" ligado, e a tela mostra o escopo (subtítulo "oportunidades de Ana" e "Para trabalhar hoje · Ana"). "Limpar filtros" desliga tudo, inclusive "Só as minhas". O filtro por etapa não esconde colunas: as outras etapas ficam vazias com o aviso "Filtro por etapa ativo".

**Login simulado.** O usuário inicial é o vendedor "Ana" da API (ou o primeiro da lista, se não houver Ana). A escolha fica no `localStorage` (`nobre-crm:user`, com tratamento para navegador sem armazenamento). "Só as minhas", o vendedor padrão da criação e o vendedor do contato usam o id desse usuário.

## Estrutura

```
scripts/        geração dos tipos a partir do OpenAPI
src/api         schema.ts gerado (não editar)
src/app         layout e página
src/components  interface (Kanban, cards, gaveta, modais, filtros, resumo, contexto de catálogo e vendedores)
src/hooks       consultas e mutações com TanStack Query
src/lib         cliente HTTP, aliases de tipos, catálogo, urgência, tarefas, formatação
src/test        fixtures dos testes
```

Tecnologias: Next.js 15, React 19, TypeScript, Tailwind CSS 4, TanStack Query, dnd-kit, openapi-typescript e Vitest.

## Testes

`npm test` (Vitest) cobre as partes puras: o mapeamento de erros do cliente (`ApiError`, 409, 422 com campos, 429, 401, 503, rede, tempo limite, `X-Total-Count`), o comparador de urgência, o agrupamento de tarefas por oportunidade e `blockedReason` lendo o catálogo. O catálogo de teste fica em `src/test/fixtures.ts`.

## Design

O sistema visual está documentado em `DESIGN.md` (tokens, componentes, decisões entre critérios concorrentes e o que foi removido) e o contexto de produto em `PRODUCT.md`. Os tokens vivem em `src/app/globals.css` e são expostos ao Tailwind por `@theme inline`.

- Modo de trabalho: barra superior numa moldura verde-acinzentada e o funil numa folha branca, sem sombras em repouso, sem gradientes, sem vidro.
- Fonte do sistema (SF Pro no Apple, Segoe UI no Windows), escala em rem: 13, 14, 16, 20 e 24 px.
- Verde só na ação primária, na seleção e no monograma; vermelho só em "Agir hoje" (no máximo uma marca por card).
- "Para trabalhar hoje" vem logo abaixo do título: lista horizontal das tarefas de retorno e, ao lado, os números do funil.
- Tema claro por padrão e escuro composto à parte; também há ajuste para `prefers-contrast: more`.
- Responsivo de 360 a 1920 px sem rolagem horizontal da página; o quadro rola por dentro. A partir de 1400 px as seis etapas cabem sem rolagem.

## Acessibilidade e UX

- Kanban com arraste por mouse, toque (pressionar e arrastar) e teclado (Espaço pega e solta, setas trocam de coluna). Enter abre o detalhe, onde também há botões para mover de etapa.
- Estados de carregamento (esqueleto da tela inteira enquanto o catálogo chega, do Kanban ou da tabela depois), erro com nova tentativa, funil vazio e busca sem resultados. Se uma atualização falhar depois que os dados já foram carregados, o quadro continua visível com um aviso e o botão "Tentar novamente"; o indicador ao lado de "Em aberto" mostra quando os dados estão sendo atualizados.
- Durante o arraste, um único anúncio para leitor de tela diz se a coluna sob o card aceita o movimento e, se não aceitar, o motivo vindo da API.
- A lista tem colunas de brinde e validade da proposta, com ordenação clicável em todas as colunas.
- Contraste AA verificado nos dois temas (texto 4,5:1, controles e foco 3:1; bordas de campos 3,35:1).
- Alvos de toque de pelo menos 44 px em telas de toque (32 px com mouse); texto de no mínimo 13 px, em rem.
- Foco visível em verde, erros de formulário anunciados (`role="alert"`), rótulos sempre visíveis.
- Movimento curto (120 a 240 ms); com `prefers-reduced-motion` sobra só o esmaecimento, sem deslocamentos.
- Em telas pequenas, filtros e menu do usuário abrem como folha inferior.

## Automação e os outros problemas do case

A automação escolhida (problema 4, retorno esquecido) roda no backend e aparece aqui no painel "Para trabalhar hoje". A descrição de como resolver os outros três problemas (SLA do primeiro contato, dados da empresa do lead e informações da ligação) está no README do backend, na seção "Os outros 3 problemas do case".

## Limitações

- Sem autenticação real: o usuário é escolhido no menu e o `sellerId` sai do navegador. A chave de API, se usada, fica visível no JavaScript.
- A busca é feita pela API com `ILIKE`, que não ignora acentos ("clinica" não acha "Clínica").
- A geração de tarefas é disparada pelo frontend além do job diário; com muitos usuários simultâneos, o ideal é a API gerar as tarefas ao gravar (ou por fila) e o frontend só ler.
- A tela não pagina: com os filtros atuais a API devolve a lista completa do escopo. O cliente já lê `X-Total-Count` para quando a paginação for necessária.
- Cada ação dispara algumas leituras (lista, histórico, tarefas). Com o limite padrão da API (120 requisições por minuto por IP) isso não é problema para um usuário, mas vários usuários atrás do mesmo IP podem receber 429.

## Uso de IA

Usei um assistente de IA como apoio de desenvolvimento nos dois projetos, para gerar e revisar código, escrever migrations e testes, conferir contraste e acessibilidade, e redigir parte da documentação.

As decisões de produto e de regra de negócio foram minhas: o funil e a matriz de transições (quais retornos de etapa fazem sentido e quais não), as regras de preenchimento por etapa, a escolha da automação (retorno esquecido), os critérios de atenção, o modelo de dados e a defesa das regras em três camadas (DTO, domínio e banco). Também defini o visual, a paleta e o comportamento da interface, e revisei o resultado, rodando a aplicação e os testes.

Para validar, os testes de integração rodam contra um PostgreSQL real, e os bugs que eles revelaram foram corrigidos no código.
