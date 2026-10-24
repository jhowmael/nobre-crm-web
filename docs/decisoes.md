# Decisões, acessibilidade e limitações

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

## Limitações

- Sem autenticação real: o usuário é escolhido no menu e o `sellerId` sai do navegador. A chave de API, se usada, fica visível no JavaScript.
- A busca é feita pela API com `ILIKE`, que não ignora acentos ("clinica" não acha "Clínica").
- A geração de tarefas é disparada pelo frontend além do job diário; com muitos usuários simultâneos, o ideal é a API gerar as tarefas ao gravar (ou por fila) e o frontend só ler.
- A tela não pagina: com os filtros atuais a API devolve a lista completa do escopo. O cliente já lê `X-Total-Count` para quando a paginação for necessária.
- Cada ação dispara algumas leituras (lista, histórico, tarefas). Com o limite padrão da API (120 requisições por minuto por IP) isso não é problema para um usuário, mas vários usuários atrás do mesmo IP podem receber 429.
