---
name: Nobre CRM
description: Funil de vendas B2B da Nobre Brindes, em modo de trabalho (Operate)
colors:
  frame: "#f0f3ed"
  sheet: "#ffffff"
  sheet-edge: "#e3e7df"
  surface: "#ffffff"
  overlay: "#ffffff"
  raised: "#f3f5f1"
  active: "#e7ebe3"
  border: "#e1e5dc"
  border-strong: "#c3c9bd"
  rule: "#edf0ea"
  field-border: "#868f82"
  ink: "#151a14"
  ink-2: "#565e54"
  accent: "#3d6e12"
  accent-hover: "#335d0f"
  accent-press: "#2a4d0c"
  on-accent: "#ffffff"
  accent-ink: "#3d6e12"
  accent-tint: "#ebf3e1"
  accent-tint-strong: "#d8e9c4"
  brand: "#83b735"
  on-brand: "#1b2a0c"
  negative: "#b42318"
  negative-tint: "#fdecea"
  negative-ink: "#8a1c14"
  warning-tint: "#fff4e0"
  warning-ink: "#8a4b00"
  positive: "#1e7b4f"
  dark-frame: "#111312"
  dark-sheet: "#191b1a"
  dark-surface: "#202321"
  dark-overlay: "#252826"
  dark-ink: "#f1f3ef"
  dark-ink-2: "#a9b0a6"
  dark-accent: "#8ccf4d"
  dark-on-accent: "#0f1a05"
typography:
  title:
    fontFamily: "-apple-system, BlinkMacSystemFont, SF Pro Text, Segoe UI Variable Text, Segoe UI, system-ui, Roboto, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 600
    lineHeight: "1.625rem"
    letterSpacing: "-0.01em"
  figure:
    fontFamily: "-apple-system, BlinkMacSystemFont, SF Pro Text, Segoe UI Variable Text, Segoe UI, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 600
    lineHeight: "1.75rem"
  headline:
    fontFamily: "-apple-system, BlinkMacSystemFont, SF Pro Text, Segoe UI Variable Text, Segoe UI, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 600
    lineHeight: "1.375rem"
  body:
    fontFamily: "-apple-system, BlinkMacSystemFont, SF Pro Text, Segoe UI Variable Text, Segoe UI, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: "1.25rem"
  caption:
    fontFamily: "-apple-system, BlinkMacSystemFont, SF Pro Text, Segoe UI Variable Text, Segoe UI, system-ui, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 400
    lineHeight: "1.125rem"
  code:
    fontFamily: "ui-monospace, SF Mono, Cascadia Mono, Menlo, Consolas, monospace"
    fontSize: "0.8125rem"
    fontWeight: 400
    lineHeight: "1.125rem"
rounded:
  chip: "4px"
  control: "6px"
  card: "8px"
  panel: "12px"
  sheet: "16px"
spacing:
  base: "4px"
  gap: "16px"
  pad: "24px"
  pad-phone: "16px"
  inset: "8px"
  control-pointer: "32px"
  control-touch: "44px"
  row: "48px"
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.on-accent}"
    rounded: "{rounded.control}"
    height: "{spacing.control-pointer}"
    padding: "0 12px"
  button-primary-hover:
    backgroundColor: "{colors.accent-hover}"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    height: "{spacing.control-pointer}"
    padding: "0 12px"
  button-plain:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    height: "{spacing.control-pointer}"
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    height: "{spacing.control-pointer}"
    padding: "0 10px"
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
    padding: "12px"
  pill-negative:
    backgroundColor: "{colors.negative-tint}"
    textColor: "{colors.negative-ink}"
    rounded: "{rounded.chip}"
  pill-warning:
    backgroundColor: "{colors.warning-tint}"
    textColor: "{colors.warning-ink}"
    rounded: "{rounded.chip}"
---

# Design System: Nobre CRM

Fonte normativa dos tokens: `src/app/globals.css` (variáveis em `:root`, `:root[data-theme="dark"]`, `prefers-contrast: more`, `pointer: coarse` e `prefers-reduced-motion`, expostas ao Tailwind v4 por `@theme inline`). Este arquivo descreve o sistema construído e as decisões que o justificam.

## Overview

**Creative North Star: "A folha verde do vendedor"**

App de trabalho, com sensação nativa de macOS e iOS (diretrizes de interface da Apple, HIG). A tela responde a uma pergunta: o que eu preciso trabalhar hoje? A estrutura é a de um produto da categoria (barra de ferramentas, título, resumo, quadro), sem fantasia de outro objeto.

O estilo é uma moldura (frame) tingida de verde-acinzentado que leva a barra superior, com o trabalho numa folha branca recuada 8 px das bordas da janela, com borda de 1 px, raio 16 e sem sombra. A "cara" do produto é a moldura tingida a partir do verde da marca e o monograma "N" no verde #83b735.

**Key Characteristics:**
- Cor só onde há significado: ação primária, seleção, estado de atenção e a marca no monograma.
- Fonte do sistema (SF Pro no Apple, Segoe UI no Windows), uma família, escala fixa em rem.
- Profundidade por tom, não por sombra; sombra só no que flutua.
- Um único eixo de alinhamento: logo, título, resumo e primeiro card começam na mesma linha vertical; usuário, botão primário e resumo terminam na mesma linha.

## Colors

Estratégia: Restrained (neutros tingidos do verde da marca + um acento). Light é o padrão; dark é composto à parte, não invertido.

### Primary
- **Verde de ação** (`accent` #3d6e12 / dark #8ccf4d): botão primário, foco, seleção ativa, estados de arraste permitido. Texto branco sobre ele: 6,1:1; no escuro, texto #0f1a05: 9,5:1.
- **Verde da marca** (`brand` #83b735): só o monograma, com "N" em #1b2a0c (6,4:1).

### Neutral
- `frame` #f0f3ed (moldura), `sheet` #ffffff (folha), `raised` #f3f5f1 (poços, trilhos, itens da lista de trabalho), `active` #e7ebe3 (pressionado, trilho do segmented control).
- Linhas em três passos: `rule` #edf0ea (divisórias internas), `border` #e1e5dc (cards e painéis, cerca de 1,2:1), `border-strong` #c3c9bd (botões secundários e estados de arraste). Campos de formulário usam `field-border` #868f82 (3,35:1) para cumprir WCAG 1.4.11.
- Texto em dois tons: `ink` #151a14 e `ink-2` #565e54 (6,7:1 no branco, 6,0:1 na moldura).

### Status
- Agir hoje: `negative` #b42318 (6,6:1), pílula `negative-tint` com `negative-ink`.
- Acompanhar: pílula `warning-tint` #fff4e0 com `warning-ink` #8a4b00 (6,2:1).
- Positivo: `positive` #1e7b4f.
- Etapas: rampa de um só matiz verde (Primeiro Contato cinza-verde, depois verdes cada vez mais escuros até Fechamento) e Perdida em vermelho; todas com 3:1 ou mais sobre a folha, sempre acompanhadas do nome.

### Named Rules
**The Signal Rule.** Vermelho é sinal, não textura: no máximo uma marca vermelha por card (a pílula de atenção). A data do evento e a borda lateral colorida deixaram de ser vermelhas.

**The Two-Theme Rule.** Toda cor existe nos dois temas e em `prefers-contrast: more`; nenhum hex fica fora de `globals.css`, exceto as tintas das pessoas (variáveis `--person-*`).

## Typography

**Família:** pilha do sistema (`-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI Variable Text", "Segoe UI", system-ui…`). Monoespaçada (`ui-monospace`) só para códigos de oportunidade (OPP-2001).

### Hierarchy
- **Title** (600, 1,25rem/1,625rem, -0,01em): o h1 "Funil de vendas" e o nome da empresa na gaveta.
- **Figure** (600, 1,5rem): valores do resumo (1rem no celular).
- **Headline** (600, 1rem): nome da empresa no card, títulos de modal e de popover.
- **Body** (400/500/600, 0,875rem/1,25rem): texto corrente, controles, títulos de coluna e de seção.
- **Caption** (400/500, 0,8125rem/1,125rem): metadados, sublinhas, pílulas. É o menor tamanho da interface.

Números com `tabular-nums` em valores, datas e contagens. Tamanhos em rem para acompanhar a preferência de tamanho de texto do navegador (equivalente web do Dynamic Type).

### Named Rules
**The No-Eyebrow Rule.** Nada de rótulos pequenos em caixa alta acima de títulos; seções são títulos em caixa normal.

## Layout

- Grade de 4 px. `gap` 16 px entre blocos e colunas; `pad` 24 px dentro da folha (16 px no celular); `inset` 8 px entre folha e janela (0 no celular, onde a folha vira a tela).
- Um eixo à esquerda (`--gutter` = inset + borda + pad) compartilhado por logo, h1, resumo e primeiro card; o mesmo eixo à direita para usuário, botão primário e resumo. A busca fica centrada na janela, que é também o centro da folha.
- Colunas do Kanban: base de 272 px (214 px a partir de 1400 px, para mostrar as seis etapas sem rolagem em 1440) e crescem para preencher a largura; o quadro rola na horizontal dentro da própria área, nunca a página.
- Até 767 px a página rola na vertical e as colunas têm altura natural; a partir de 768 px a página cabe na janela e cada coluna rola por dentro.
- Celular: barra superior com marca, tema e usuário; linha de ferramentas com busca, filtros e Kanban/Lista; resumo em grade 2×2; popovers viram folhas inferiores.

## Elevation & Depth

Superfícies em repouso não têm sombra; a separação vem de um passo de tom ou de uma linha de 1 px.

### Shadow Vocabulary
- `shadow-float` (0 1px 2px / 0 8px 24px, 6–12%): balão de bloqueio, nota de etapa, aviso de atualização, dica de arraste.
- `shadow-overlay` (0 2px 6px / 0 24px 48px, 8–18%): modais, gaveta, popovers, toasts e o card sendo arrastado.

### Named Rules
**The Float-Only Rule.** Sombra só no que flutua sobre a folha.

## Shapes

Raios: 4 px (pílulas), 6 px (controles), 8 px (cards, painéis do resumo), 12 px (popovers, modais, colunas em estado de arraste), 16 px (folha e gaveta). Avatares são círculos com tinta clara própria por pessoa (Ana verde, Bruno azul, Carla rosa).

## Components

### Buttons
Primário (verde preenchido, um por contexto), secundário (superfície com borda), plano (sem borda, para ícones e ações terciárias) e destrutivo discreto (texto vermelho com borda neutra, para "Marcar como perdida"). Altura 32 px com ponteiro fino e 44 px em toque; estados de hover, pressionado, foco (anel verde de 2 px) e desabilitado legível.

### Segmented control
Kanban/Lista: trilho `active`, segmento selecionado em superfície branca com anel de 1 px e texto em semibold; só texto em telas largas e só ícones no celular, nunca os dois juntos (diretrizes da Apple). Alvos de 44 px em toque.

### Cards / Containers
Card do Kanban: borda 1 px, raio 8, 12 px de padding, sem sombra; hover escurece a borda. Linhas: código e responsável, empresa (headline), brinde, valor e data do evento, validade da proposta e no máximo uma pílula de atenção.

### Inputs / Fields
Rótulo sempre visível acima do campo (500, body), borda de 3,35:1, foco com borda e anel verdes, erro com borda vermelha e mensagem anunciada (`role="alert"`).

### Navigation
Barra superior na moldura (56 px): monograma e nome, busca centrada, tema e usuário. Sem barra lateral: o produto tem uma tela e duas visões.

### Resumo "Para trabalhar hoje"
Um painel dividido: à esquerda a lista horizontal das tarefas de retorno do dia, uma por oportunidade (itens de 272 px que nunca encolhem, agir hoje antes de acompanhar, separados por uma linha; o item abre a gaveta e o botão de check à direita, separado por uma régua, conclui as tarefas daquela oportunidade), à direita os quatro números (Em aberto, Valor no funil, Agir hoje, Acompanhar). Abaixo de 1280 px os números descem para baixo da lista. Enquanto as tarefas carregam, a lista mostra esqueletos estáticos do mesmo tamanho dos itens.

## Motion

Duração 120/180/240 ms com ease-out exponencial `cubic-bezier(0.16, 1, 0.3, 1)`. Modais e popovers sobem 8 px com fade; a gaveta entra 24 px pela direita; o card bloqueado recusa com um tremor curto. Com `prefers-reduced-motion`, os deslocamentos vão a 0 e sobra só o fade (cross-fade, como pedem as diretrizes da Apple); o tremor é desligado. Esqueletos de carregamento são estáticos, sem pulsação.

## Do's and Don'ts

### Do:
- **Do** manter um eixo: tudo novo começa em `--gutter`.
- **Do** usar `ink-2` para texto secundário e nunca um cinza mais claro.
- **Do** mostrar o motivo de um bloqueio no lugar onde ele acontece.
- **Do** testar em 360, 768, 1280 e 1920 px, nos dois temas.

### Don't:
- **Don't** usar gradiente, vidro, blobs decorativos ou ícones em quadradinhos coloridos.
- **Don't** colocar borda lateral colorida em cards.
- **Don't** usar texto abaixo de 13 px nem caixa alta espaçada.
- **Don't** pôr sombra em superfícies em repouso.

## Decisões entre critérios concorrentes

Prioridade aplicada: (1) acessibilidade e usabilidade, (2) as diretrizes da Apple para estrutura, hierarquia, tokens, componentes e movimento, (3) boas práticas de telas de aplicativo (menos ornamento, mais escaneabilidade).

| Conflito | Decisão |
|---|---|
| Tipografia: uma fonte web de marca contra a fonte do sistema recomendada pelas diretrizes da Apple. | Fonte do sistema (SF Pro no Apple, Segoe UI no Windows). |
| Cor do botão primário: primário quase preto contra o acento da marca. | Primário em verde de acento, um por contexto. |
| Barras em material translúcido (Liquid Glass) contra "sem vidro, sem desfoque". | Barra opaca na moldura. No web não existe o material do sistema, o conteúdo não rola por baixo da barra e o vidro era decorativo. |
| As diretrizes da Apple desaconselham alternador de tema próprio do app; o produto tem troca de tema e o pedido é tema claro por padrão. | Mantido o alternador e o claro como padrão (função do produto), com o escuro composto à parte e `prefers-contrast: more` atendido. |
| SF Symbols contra licença: não podem ser usados na web. | Lucide, um só conjunto, traço uniforme de 16 px, sempre com rótulo acessível. |
| Bordas de controle muito leves (1,2 a 1,5:1) contra WCAG 1.4.11 (3:1 para identificar campos). | Campos com borda de 3,35:1; botões e cards seguem linhas leves. |
| Destrutivo: não pintar de vermelho a confirmação de uma ação que a pessoa pediu explicitamente. | "Confirmar perda" usa o botão primário; o gatilho "Marcar como perdida" usa o estilo destrutivo discreto. |
| Quarto nível de aninhamento (moldura, folha e card bastam) contra a convenção de colunas com fundo no Kanban. | Colunas sem fundo em repouso; elas só ganham fundo e borda durante o arraste (permitida, sobre o alvo, bloqueada). |
| Fechar o modal: Cancelar + ação, sem botão de fechar duplicado. | Removido o X dos modais; Esc e clique fora continuam fechando. A gaveta mantém o X, que é sua única saída visível. |
| Popover em tela compacta: usar folha. | Filtros e menu do usuário viram folha inferior abaixo de 640 px. |

## Escolhas defendidas

- Coluna parcialmente visível em 768 px: o corte visível fica a 27 px da borda da janela e é a pista de que há mais etapas na rolagem horizontal (divulgação progressiva).
- Espaço vazio abaixo dos cards e alturas diferentes entre colunas: o espaço é a área de soltar das colunas e a altura de cada card depende dos dados; colunas de Kanban são pilhas independentes.
- Fonte monoespaçada só nos códigos OPP.

## Remoções e por quê

- Blobs decorativos atrás do quadro e colunas em vidro com desfoque: ornamento sem função.
- Barra superior verde saturada: em tela clara a cor fica nos dados; a marca ficou no monograma.
- Borda lateral colorida de 3 px nos cards com alerta: ela desalinhava o texto em 4 px.
- Rótulos em caixa alta espaçada na gaveta e no menu.
- Sombras em cards e chips em repouso, esqueletos pulsantes e o X duplicado dos modais.
