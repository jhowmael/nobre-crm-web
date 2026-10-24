# Nobre CRM Web

Frontend do CRM de funil de vendas da Nobre Brindes: um Kanban para o vendedor achar rápido a negociação que precisa trabalhar hoje. Todos os dados e regras vêm da API [nobre-crm-api](https://github.com/jhowmael/nobre-crm-api).

Tecnologias: Next.js, React, TypeScript, Tailwind CSS e TanStack Query.

## O que ele faz

- Mostra o funil em colunas (uma por etapa) e permite arrastar os cards entre elas.
- Destaca as negociações que exigem atenção (proposta vencida, cliente sem contato, evento chegando) no painel "Para trabalhar hoje".
- Tem busca, filtros, visão em lista e uma gaveta com o detalhe e o histórico de cada oportunidade.
- Explica na tela por que um movimento não é permitido, em vez de simplesmente recusar.

## Como colocar no ar

**Você precisa de:** Docker (para a API e o banco) e Node 20 ou superior.

**1. Suba a API e o banco.** Na pasta do `nobre-crm-api`, rode um comando de cada vez:

```
cp .env.example .env
docker compose --profile app up --build -d
docker compose --profile tools run --rm --build seed
```

Eles criam a configuração, iniciam o banco e a API (na primeira vez leva alguns minutos) e carregam os dados de exemplo. Confira em http://localhost:3333/health: deve responder `{"status":"ok","database":"up"}`.

**2. Suba o frontend.** Nesta pasta:

```
npm install
npm run dev
```

O primeiro comando baixa as dependências; o segundo inicia a interface. Abra http://localhost:3000.

**O que você deve ver:** o funil em colunas, com os cards da vendedora Ana e, no topo, o painel "Para trabalhar hoje" com a Clínica Vida. Em "Filtros", desligue "Só as minhas" para ver as 7 oportunidades. Tente arrastar a Clínica Vida de Follow-up para Forecast: a mudança é gravada no banco.

**Se algo der errado**

| Sintoma | O que fazer |
|---|---|
| A tela mostra "Não foi possível carregar o funil" | A API não está no ar. Rode o passo 1 e confira o endereço de saúde acima. |
| O funil abre vazio | Falta carregar os dados de exemplo: rode o terceiro comando do passo 1. |
| A porta 3000 está ocupada | Rode `npm run dev -- -p 3001` e inclua `http://localhost:3001` em `CORS_ORIGIN` no `.env` da API. |

## Estrutura

```
src/
  app/          layout e página
  components/   interface: Kanban, cards, gaveta de detalhe, modais, filtros e resumo
  hooks/        consultas e mutações com TanStack Query
  lib/          cliente HTTP, catálogo, urgência e tarefas
  api/          tipos gerados do contrato da API (não editar)
  test/         dados de apoio dos testes
```

## Testes

```
npm test
```

## Mais detalhes

- [docs/guia.md](docs/guia.md): roteiro do que experimentar na tela, problemas comuns e variáveis de ambiente.
- [docs/decisoes.md](docs/decisoes.md): de onde vem cada dado, decisões de produto, acessibilidade e limitações.
- [DESIGN.md](DESIGN.md) e [PRODUCT.md](PRODUCT.md): decisões de design e contexto do produto.
- Como eu resolveria os outros 3 problemas do case: [no repositório da API](https://github.com/jhowmael/nobre-crm-api/blob/main/docs/outros-problemas.md).

## Uso de IA

Usei um assistente de IA como apoio de desenvolvimento nos dois projetos, para gerar e revisar código, escrever migrations e testes, conferir contraste e acessibilidade, e redigir parte da documentação.

As decisões de produto e de regra de negócio foram minhas: o funil e a matriz de transições, as regras de preenchimento por etapa, a escolha da automação (retorno esquecido), os critérios de atenção, o modelo de dados e a defesa das regras em três camadas (DTO, domínio e banco). Também defini o visual e o comportamento da interface, e revisei o resultado rodando a aplicação e os testes.
