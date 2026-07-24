# Filtros de Pneus em Cadeia — Especificação

## Objetivo

Facilitar a descoberta de pneus fazendo com que Marca, Medida, Condição e Preço apresentem apenas opções compatíveis com os restantes filtros ativos.

O caso principal é a seleção do tipo de veículo:

- ao selecionar `Mota`, as opções passam a refletir apenas pneus de mota;
- ao selecionar `Carro`, as opções passam a refletir apenas pneus de carro;
- ao selecionar `Todos`, as opções consideram ambos os tipos.

Se uma seleção deixar de ser compatível, deve ser retirada automaticamente do URL. O cliente não precisa de limpar manualmente filtros herdados da escolha anterior.

Esta especificação substitui a decisão da secção “Consulta ao Supabase” da especificação anterior que mantinha Marca e Medida independentes do tipo de veículo.

## Âmbito

Esta alteração abrange:

- cálculo das opções disponíveis para Marca, Medida, Condição e Preço;
- remoção automática de seleções incompatíveis;
- sincronização das correções com os parâmetros do URL;
- integração desses resultados em `PneusPage` e `ProductFilters`;
- checks Node focados na lógica facetada e na integração.

Não requer:

- nova coluna ou migração Supabase;
- alterações aos produtos existentes;
- alterações ao painel administrativo;
- novas dependências;
- alterações a SEO, rotas, slugs, autenticação, RLS, storage ou WhatsApp.

## Abordagem escolhida

A página carrega uma vez os campos mínimos de todos os produtos ativos e calcula as opções no browser.

Query auxiliar:

```js
supabase
  .from('products')
  .select('vehicle_type, brand, tire_size, condition, price_amount')
  .eq('is_active', true)
```

Esta abordagem é adequada ao catálogo atual, que tem poucas dezenas de produtos. Evita várias queries por alteração de filtro e mantém a interface imediata.

A query paginada existente continua responsável pelos produtos visíveis e pela contagem total. A query auxiliar serve exclusivamente para calcular opções e validar seleções.

## Módulo de domínio

Criar um módulo puro dedicado, por exemplo:

```text
motoval-setubal/src/lib/facetedFilters.js
```

O módulo recebe:

- os produtos ativos com os cinco campos necessários;
- o estado normalizado dos filtros;
- os intervalos definidos em `PRICE_BUCKETS`.

O módulo produz:

- `brandOptions`;
- `sizeOptions`;
- `conditionOptions`;
- `priceBucketOptions`;
- uma versão reconciliada dos filtros selecionados.

O módulo não conhece React, `URLSearchParams` nem Supabase. Assim, a semântica dos filtros pode ser testada diretamente com Node.

## Normalização dos produtos

Antes do cálculo:

- `brand` e `tire_size` são aparados;
- marcas são comparadas sem distinção de maiúsculas/minúsculas, mantendo a primeira grafia apresentada;
- `condition` usa os valores existentes `Novos` e `Usados`;
- `price_amount` é convertido para número finito;
- `vehicle_type` só é considerado quando é `carro` ou `mota`;
- campos vazios ou inválidos não criam opções.

## Semântica de filtragem

Dentro do mesmo filtro, múltiplos valores combinam por OR:

- Marca A ou Marca B;
- Medida X ou Medida Y;
- Novo ou Usado.

Entre filtros diferentes, as condições combinam por AND:

```text
Veículo AND Marca AND Medida AND Condição AND Preço
```

Os limites dos intervalos de preço permanecem iguais aos atuais:

- limite mínimo exclusivo;
- limite máximo inclusivo;
- `Até 30€` inclui valores menores ou iguais a 30;
- `Mais de 100€` inclui valores estritamente superiores a 100.

## Cálculo das opções disponíveis

Cada dropdown respeita todos os outros filtros ativos, ignorando apenas a sua própria seleção:

| Opções calculadas | Filtros aplicados |
| --- | --- |
| Marca | Veículo, Medida, Condição e Preço |
| Medida | Veículo, Marca, Condição e Preço |
| Condição | Veículo, Marca, Medida e Preço |
| Preço | Veículo, Marca, Medida e Condição |

Os valores selecionados que continuam válidos para o veículo atual permanecem visíveis no respetivo dropdown para poderem ser removidos. Valores sem qualquer produto no veículo atual são eliminados pela reconciliação.

As opções são ordenadas:

- Marca alfabeticamente com locale `pt-PT`;
- Medida alfabeticamente com locale `pt-PT`, mantendo o comportamento atual;
- Condição na ordem `Novos`, `Usados`;
- Preço na ordem definida por `PRICE_BUCKETS`.

## Filtro Veículo

O dropdown `Veículo` não é limitado pelos restantes filtros. Apresenta sempre:

- `Todos`;
- `Carro`;
- `Mota`.

Isto permite trocar diretamente de carro para mota sem limpar primeiro Marca, Medida, Condição ou Preço.

Depois da troca, a reconciliação preserva o veículo escolhido e remove os filtros incompatíveis.

## Reconciliação e prioridade

O URL continua a ser a fonte de verdade. Depois de os dados auxiliares carregarem, as seleções são reconciliadas segundo esta prioridade:

```text
Veículo → Marca → Medida → Condição → Preço
```

Regras:

1. `veiculo` é normalizado pela lógica atual e nunca é alterado pela reconciliação facetada;
2. marcas sem qualquer produto para o veículo atual são removidas;
3. medidas sem qualquer produto para o veículo e marcas preservadas são removidas;
4. condições sem qualquer produto para os filtros anteriores são removidas;
5. o intervalo de preço é removido quando não contém qualquer produto compatível com os filtros anteriores.

Esta ordem faz com que uma escolha explícita de veículo prevaleça sobre filtros herdados.

Se a reconciliação alterar algum valor:

- atualizar `marca`, `medida`, `condicao` e `preco`;
- remover `pagina`;
- usar `setSearchParams(next, { replace: true })`;
- efetuar a atualização apenas quando o URL calculado for diferente do atual.

A comparação antes de escrever evita ciclos de renderização e entradas adicionais no histórico.

## Exemplo com o stock atual

Com `veiculo=mota`, o resultado esperado é:

- Marca: `Bridgestone`;
- Medida: `120/70 ZR17`, `180/55 ZR17`;
- Condição: `Novos`;
- Preço: `Mais de 100€`.

Se o URL anterior contiver uma marca, medida, condição ou preço exclusivos de carro, esses valores são removidos automaticamente.

## Integração em PneusPage

`PneusPage` substitui o carregamento atual de Marca/Medida por um carregamento do conjunto mínimo de campos.

Estado sugerido:

```js
const [facetProducts, setFacetProducts] = useState([])
const [facetsReady, setFacetsReady] = useState(false)
```

Depois do carregamento:

1. normalizar os filtros lidos do URL;
2. obter a reconciliação e as opções através do helper puro;
3. sincronizar o URL num efeito protegido por comparação;
4. passar as quatro listas de opções a `ProductFilters`.

A query paginada de produtos continua a usar os filtros do URL. Durante o único render entre a deteção de valores incompatíveis e a correção com `replace`, o estado de loading atual pode continuar a ser usado; não deve existir um loop nem ficar conteúdo permanentemente inconsistente.

## Integração em ProductFilters

`ProductFilters` passa a receber:

```text
brandOptions
sizeOptions
conditionOptions
priceBucketOptions
```

Alterações:

- Condição deixa de usar diretamente a constante completa e renderiza `conditionOptions`;
- Preço deixa de mapear sempre `PRICE_BUCKETS` e renderiza `priceBucketOptions`;
- dropdowns sem opções não são apresentados;
- dropdowns com uma única opção continuam disponíveis;
- a contagem de filtros ativos mantém a semântica atual;
- `Limpar filtros` continua a resultar em `veiculo=todos`.

O dropdown Veículo permanece sempre disponível.

## Loading e erros

Enquanto a query auxiliar ainda não terminou:

- Veículo continua disponível;
- não reconciliar nem apagar parâmetros do URL;
- preservar opções já carregadas, se existirem;
- a query paginada e o catálogo continuam a funcionar.

Se a query auxiliar falhar:

- registar o erro;
- manter o último conjunto de opções válido;
- não remover seleções do URL sem evidência;
- continuar a permitir Veículo e Limpar filtros;
- não bloquear nem deixar a página vazia por causa da falha auxiliar.

Numa falha inicial sem opções anteriores, valores já selecionados no URL devem continuar acessíveis para serem removidos. Condição e Preço podem usar as listas completas atuais como fallback; Marca e Medida podem usar os valores selecionados.

## Testes

Criar um check Node focado, por exemplo:

```text
motoval-setubal/scripts/check-faceted-filters.mjs
```

O check deve usar dados fictícios e cobrir:

- veículo mota limita as quatro facetas;
- veículo carro exclui opções exclusivas de mota;
- `todos` considera ambos os tipos;
- Marca respeita Medida, Condição e Preço, ignorando a própria Marca;
- Medida respeita Marca, Condição e Preço, ignorando a própria Medida;
- Condição respeita os restantes filtros;
- Preço respeita os restantes filtros e os limites existentes;
- OR dentro de Marca, Medida e Condição;
- AND entre filtros diferentes;
- deduplicação de marcas sem distinção de maiúsculas/minúsculas;
- remoção de marca incompatível após trocar de veículo;
- remoção subsequente de medida, condição e preço incompatíveis;
- preservação de seleções compatíveis;
- ausência de reconciliação antes de os dados estarem disponíveis.

Estender o check de integração existente para confirmar:

- a query auxiliar seleciona apenas os cinco campos necessários;
- `PneusPage` usa o helper puro;
- a correção do URL usa `replace`;
- a correção remove a paginação;
- `ProductFilters` recebe as quatro opções calculadas;
- Condição e Preço deixam de usar listas incondicionais.

## Verificação

Gate local:

```bash
npm run lint
node scripts/check-price.mjs
node scripts/check-slug.mjs
node scripts/check-seo.mjs
node scripts/check-postgrest-filter.mjs
node scripts/check-pneus-route.mjs
node scripts/check-supabase-config.mjs
node scripts/check-vehicle-type.mjs
node scripts/check-faceted-filters.mjs
npm run build
git diff --check main...HEAD
```

O lint mantém a baseline conhecida de 3 erros e 1 aviso. Esta alteração não pode introduzir novos diagnósticos.

QA manual quando o browser integrado estiver disponível:

1. entrar em `/pneus` e selecionar Mota;
2. confirmar as opções Bridgestone, duas medidas, Novos e Mais de 100€;
3. trocar para Carro e confirmar a remoção automática de valores incompatíveis;
4. combinar Marca, Medida, Condição e Preço;
5. confirmar que cada dropdown só mostra opções compatíveis;
6. abrir um detalhe e regressar, preservando o URL reconciliado;
7. repetir em telemóvel e desktop.

## Fora do âmbito

- Nova migração ou função RPC PostgreSQL.
- Uma query Supabase separada para cada faceta.
- Contagens numéricas ao lado de cada opção.
- Desativar opções indisponíveis em vez de as esconder.
- Reordenar ou redesenhar os dropdowns.
- Alterações ao admin.
- Abrir pull request ou fazer merge.
