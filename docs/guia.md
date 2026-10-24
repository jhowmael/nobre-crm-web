# Guia de uso

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
