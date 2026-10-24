# Nobre CRM Web

Frontend do CRM de funil de vendas da Nobre Brindes: um Kanban para o vendedor achar rápido a negociação que precisa trabalhar hoje. Todos os dados e regras vêm da API [nobre-crm-api](https://github.com/jhowmael/nobre-crm-api).

Tecnologias: Next.js, React, TypeScript, Tailwind CSS e TanStack Query.

## Como colocar no ar

Precisa de Docker (para a API e o banco) e Node 20 ou superior.

**1. API e banco** (na pasta `nobre-crm-api`):

```
cp .env.example .env
docker compose --profile app up --build -d
docker compose --profile tools run --rm --build seed
```

**2. Frontend** (nesta pasta):

```
npm install
npm run dev
```

Abra http://localhost:3000. A API fica em http://localhost:3333.

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
