# Filtro de Pneus por Tipo de Veículo — Especificação

## Objetivo

Facilitar a descoberta de pneus perguntando, à entrada da página `/pneus`, se o cliente procura pneus para carro ou mota. A escolha inicial deve aplicar imediatamente o filtro correspondente, mas o cliente pode depois trocar o tipo ou consultar todos os pneus através dos filtros normais.

Esta feature abrange o esquema Supabase, a migração dos produtos existentes, a página pública de pneus, os filtros, a navegação para detalhes e o painel administrativo. Não altera preços, slugs, imagens, autenticação, WhatsApp ou o restante layout.

## Modelo de dados

A tabela `public.products` recebe uma coluna:

```text
vehicle_type text not null default 'carro'
```

A coluna aceita exclusivamente:

```text
carro
mota
```

A migração deve adicionar a restrição `products_vehicle_type_check` com `check (vehicle_type in ('carro', 'mota'))`.

O default de base de dados `carro` existe para manter compatibilidade com qualquer cliente antigo que ainda omita o campo durante a transição. O novo formulário administrativo não deve usar esse default para decidir pelo utilizador: o tipo é obrigatório e começa sem seleção em produtos novos.

## Migração dos produtos existentes

Existem 24 produtos no projeto Supabase Motoval Setubal. A migração deve ser atómica:

1. adicionar `vehicle_type` como `text not null default 'carro'`;
2. atualizar para `mota` os produtos cujos títulos são:
   - `Bridgestone Battlax T33 180/55 ZR17`;
   - `Bridgestone Battlax T33 120/70 ZR17`;
3. adicionar a restrição de valores permitidos.

O resultado esperado é:

- 22 produtos com `vehicle_type = 'carro'`;
- 2 produtos com `vehicle_type = 'mota'`;
- 0 valores nulos ou fora do conjunto permitido.

A migração deve ser guardada em `motoval-setubal/supabase/migrations/` e aplicada ao projeto remoto apenas depois de os checks e a revisão local passarem. As políticas RLS existentes não devem ser alteradas; depois da migração devem ser executados os advisors de segurança e desempenho.

## Estado no URL

O parâmetro `veiculo` é a fonte de verdade para a escolha:

| URL | Comportamento |
| --- | --- |
| `/pneus` | Abre a escolha inicial obrigatória |
| `/pneus?veiculo=carro` | Mostra apenas pneus para carro |
| `/pneus?veiculo=mota` | Mostra apenas pneus para mota |
| `/pneus?veiculo=todos` | Mostra todos os pneus sem abrir a escolha |

Qualquer valor desconhecido ou vazio é inválido e deve abrir a escolha inicial.

Ao escolher carro ou mota na mensagem inicial:

- preservar os restantes parâmetros de filtro;
- definir `veiculo` com `setSearchParams(..., { replace: true })`;
- remover `pagina`, voltando à primeira página;
- fechar a mensagem.

O valor `todos` é um estado explícito. Permite remover o filtro por veículo sem o sistema interpretar essa ação como uma primeira visita e voltar a abrir a mensagem.

## Escolha inicial

Criar um componente focado `VehicleTypePrompt` apresentado sobre a página de pneus:

- backdrop fixo, escurecido e com blur;
- título `Que tipo de pneus procura?`;
- opção `Pneus para carro`;
- opção `Pneus para mota`;
- ícones distintos de carro e mota;
- áreas de interação com pelo menos 44 px;
- responsivo em telemóvel e desktop;
- `role="dialog"` e `aria-modal="true"`;
- foco inicial na primeira opção;
- foco preso dentro do diálogo;
- scroll da página bloqueado enquanto o diálogo está aberto.

A escolha é obrigatória. O diálogo não tem botão de fechar e não fecha com clique exterior nem com `Escape`.

## Dropdown “Veículo”

O componente `ProductFilters` recebe um dropdown permanente `Veículo`, seguindo o estilo dos filtros atuais. As opções são de seleção única:

- `Todos`;
- `Carro`;
- `Mota`.

Regras:

- `Carro` e `Mota` aplicam o filtro correspondente;
- selecionar `Todos` define `veiculo=todos`;
- selecionar novamente a opção ativa `Carro` ou `Mota` equivale a `Todos`;
- “Limpar filtros” remove marca, medida, condição, preço e paginação, mas deixa `veiculo=todos`;
- `Carro` e `Mota` contam como um filtro ativo;
- `Todos` não conta como filtro ativo.

O dropdown deve estar disponível mesmo quando ainda não existem opções de marca ou medida.

## Consulta ao Supabase

A listagem deve aplicar:

```js
query.eq('vehicle_type', selectedVehicleType)
```

apenas quando o valor normalizado é `carro` ou `mota`. Para `todos` não deve adicionar filtro por veículo.

As queries que carregam opções de marca e medida devem continuar a considerar todos os produtos ativos, independentemente do tipo selecionado. Os restantes filtros e a paginação continuam a combinar como atualmente.

Quando `carro` ou `mota` estão selecionados:

- `hasActiveFilters` é verdadeiro;
- a página mantém `noindex,follow`, tal como nos restantes filtros.

Para `todos`, o filtro de veículo não ativa `noindex` por si só.

## Navegação para detalhes

Os cartões devem transportar a query string atual para `/pneus/:slug`. A página de detalhe deve:

- preservar a query no link `Voltar aos Pneus`;
- usar a query preservada no CTA de produto indisponível;
- manter canonical, breadcrumb JSON-LD e schema do produto sem query string;
- ignorar `veiculo` ao procurar o produto pelo slug.

Assim, carro, mota ou todos continuam selecionados ao abrir um pneu e regressar.

## Painel administrativo

O formulário de produto recebe um select obrigatório:

- label `Tipo de veículo *`;
- placeholder `Seleciona o tipo`;
- opções `Carro` e `Mota`;
- valor inicial vazio ao criar;
- valor existente ao editar.

A validação deve rejeitar o submit sem `vehicle_type` e apresentar uma mensagem clara. Inserts e updates devem incluir o campo.

Na lista administrativa, cada produto deve mostrar um badge `Carro` ou `Mota`, além do estado e da medida atuais.

## Organização do código

- Criar um módulo puro partilhado para valores válidos, labels e normalização do parâmetro `veiculo`.
- Criar `VehicleTypePrompt.jsx` como componente isolado.
- Manter a orquestração de URL e query em `PneusPage.jsx`.
- Estender `ProductFilters.jsx` através das props existentes, sem duplicar estado de filtros.
- Alterar apenas as secções necessárias de `AdminPage.jsx`; não realizar uma refatoração geral do ficheiro.
- Não adicionar dependências.

## Erros e compatibilidade

- Se o Supabase não estiver configurado localmente, a página continua a usar o fallback seguro já existente.
- Se a query falhar, o comportamento de erro atual não deve piorar nem deixar o diálogo preso.
- A migração é compatível com o frontend atualmente publicado porque a nova coluna tem default.
- O frontend novo só deve ser considerado pronto depois de confirmar que a migração existe no projeto remoto.

## Verificação

Adicionar checks Node sem dependências para cobrir:

- valores `carro`, `mota` e `todos`;
- normalização de parâmetros inválidos;
- SQL da coluna, default, check constraint e backfill dos dois Battlax;
- aplicação de `.eq('vehicle_type', ...)` apenas para carro/mota;
- comportamento do diálogo e escolha obrigatória;
- dropdown `Veículo`, opção `Todos` e contagem de filtros;
- `Limpar filtros` resultando em `veiculo=todos`;
- formulário administrativo obrigatório, payload e badge;
- preservação da query nos cartões e links de retorno.

Gate final:

```bash
npm run lint
node scripts/check-price.mjs
node scripts/check-slug.mjs
node scripts/check-seo.mjs
node scripts/check-postgrest-filter.mjs
node scripts/check-pneus-route.mjs
node scripts/check-supabase-config.mjs
node scripts/check-vehicle-type.mjs
npm run build
git diff --check main...HEAD
```

O lint tem uma baseline conhecida de 3 erros e 1 aviso, previamente aceite. A feature não pode introduzir novos erros ou avisos.

Depois de aplicar a migração remota:

- confirmar a existência e constraints de `vehicle_type`;
- confirmar as contagens 22 carro / 2 mota;
- executar advisors de segurança e desempenho;
- verificar manualmente `/pneus`, os filtros, detalhe/retorno e o admin em viewport móvel e desktop.

## Fora do âmbito

- Rotas separadas `/pneus/carro` e `/pneus/mota`.
- Páginas SEO dedicadas por tipo de veículo.
- Inferência automática do tipo a partir do título em novos produtos.
- Seleção múltipla simultânea de carro e mota.
- Alterações às políticas RLS, autenticação ou storage.
- Abertura de pull request ou merge do branch.
