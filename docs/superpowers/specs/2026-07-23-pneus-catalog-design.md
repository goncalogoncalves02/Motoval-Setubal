# Catálogo de Pneus — Especificação

## Objetivo

Substituir a área pública “Ofertas” por um catálogo de “Pneus”, apresentado como uma seleção de pneus novos e usados. A alteração deve abranger URLs, navegação, conteúdo visível, nomes técnicos e SEO, sem mudar o modelo de produtos no Supabase nem o layout atual.

## Rotas e compatibilidade

- A listagem pública passa de `/ofertas` para `/pneus`.
- O detalhe de produto passa de `/ofertas/:slug` para `/pneus/:slug`.
- O Netlify deve responder com redirecionamentos permanentes:
  - `/ofertas` → `/pneus` com HTTP 301.
  - `/ofertas/*` → `/pneus/:splat` com HTTP 301, preservando o slug.
- As regras 301 devem preceder a regra geral da SPA, `/*` → `/index.html` com status 200.
- Toda a configuração de redirects deve ficar em `motoval-setubal/netlify.toml`. O ficheiro redundante `motoval-setubal/public/_redirects` deve ser removido porque o Netlify avalia `_redirects` antes de `netlify.toml`, o que permitiria ao rewrite geral ocultar os novos redirects.
- O React Router deve manter redirects de compatibilidade para os dois URLs antigos. Estes cobrem o servidor de desenvolvimento e navegação client-side; em produção, o Netlify continua a ser responsável pelos verdadeiros 301.

## Conteúdo e navegação

O layout e a funcionalidade atual dos filtros, paginação, cartões e detalhes permanecem iguais. As referências públicas à antiga área devem usar a nova taxonomia:

- Navbar desktop e menu hambúrguer: `Pneus`, com destino `/pneus`.
- Footer: `Pneus`, com destino `/pneus`.
- Teaser da homepage:
  - badge: `Para Carros e Motos`;
  - título: `Pneus Novos e Usados`;
  - subtítulo: `Pneus a preços acessíveis — carros e motos. Stock limitado, atualizado regularmente.`;
  - CTA: `Ver Todos os Pneus`;
  - destino: `/pneus`.
- Página de listagem:
  - H1: `Pneus Novos e Usados`;
  - subtítulo: `Pneus a preços acessíveis. Stock limitado, contacta-nos para mais informações.`;
  - estado vazio sem filtros: `Brevemente novos pneus disponíveis`.
- Página de detalhe:
  - mensagens de produto indisponível referem os pneus disponíveis, não ofertas;
  - CTA: `Ver Pneus`;
  - breadcrumb: `Pneus`;
  - link de retorno: `Voltar aos Pneus`.
- Painel administrativo: o título da secção passa de `Ofertas` para `Pneus`; os termos existentes `Produto` e `Novo Produto` permanecem.

## Nomes técnicos

Para que o código represente o domínio atual:

- `src/pages/OfertasPage.jsx` passa para `src/pages/PneusPage.jsx`, exportando `PneusPage`.
- `src/components/OfertasTeaser.jsx` passa para `src/components/PneusTeaser.jsx`, exportando `PneusTeaser`.
- `ofertasTeaser` passa para `pneusTeaser`.
- O ID `ofertas-teaser` e o seletor correspondente passam para `pneus-teaser`.
- Imports e referências relacionadas devem acompanhar estes nomes.
- A tabela `products`, os campos do Supabase e os componentes genéricos de produtos não mudam.

## SEO

- Todos os canonical URLs da listagem e dos detalhes devem usar `/pneus`.
- A rota estática que alimenta o sitemap deve ser `/pneus`, com a frequência e prioridade atuais.
- O JSON-LD `ItemList` deve usar:
  - nome `Pneus Novos e Usados - Motoval Setúbal`;
  - URL absoluta `https://motovalsetubal.com/pneus`.
- O breadcrumb JSON-LD dos detalhes deve usar o nome `Pneus` e URLs `/pneus`.
- O título base da listagem deve ser `Pneus Novos e Usados em Palmela | Motoval Setúbal`.
- Quando existirem produtos, o título pode continuar dinâmico:
  - primeira página: `<total> Pneus Novos e Usados | Motoval Setúbal`;
  - páginas seguintes: `Pneus Novos e Usados — Página <n> | Motoval Setúbal`.
- As descrições devem falar de pneus novos e usados disponíveis em Palmela sem linguagem de “ofertas especiais”.
- `public/robots.txt` não contém o URL antigo e já aponta para o sitemap gerado. Deve permanecer inalterado, mas a verificação deve confirmar que continua a apontar para `https://motovalsetubal.com/sitemap.xml`.
- Parâmetros de filtro continuam a produzir `noindex,follow`; não há mudança nesse comportamento.

## Verificação e regressões

- Criar um check Node focado na migração de rotas e conteúdo, seguindo o padrão `scripts/check-*.mjs`.
- O check deve confirmar as rotas `/pneus`, canonical e JSON-LD, redirects Netlify, referência ao sitemap no `robots.txt` e ausência de URLs/nomenclatura pública antiga fora das regras de compatibilidade.
- Expandir `scripts/check-seo.mjs` para cobrir `itemListSchema` e a rota `/pneus` do sitemap.
- Executar primeiro os checks em estado vermelho, antes da implementação.
- No final executar:
  - `npm run lint`;
  - `node scripts/check-price.mjs`;
  - `node scripts/check-slug.mjs`;
  - `node scripts/check-seo.mjs`;
  - `node scripts/check-postgrest-filter.mjs`;
  - o novo check da migração;
  - `npm run build`;
  - `git diff --check`.
- Inspecionar o `dist/sitemap.xml` gerado para garantir que contém `/pneus` e não contém `/ofertas`.
- Rever o diff final sem abrir pull request.

## Fora do âmbito

- Não alterar o esquema ou os dados no Supabase.
- Não redesenhar a página, filtros, cartões ou painel administrativo.
- Não alterar preços, slugs de produtos ou comportamento de WhatsApp.
- Não abrir PR nem fazer merge; outras funcionalidades serão adicionadas ao mesmo branch.
