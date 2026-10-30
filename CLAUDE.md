# CLAUDE.md

Landing page "Código-fonte" sobre a vida de Bill Gates, em pt-BR com acentuação correta. `SPEC.md` é o contrato completo: leia antes de mexer em qualquer capítulo.
`index.html` é gerado: edite `parts/` e rode `node build.mjs` (para testar um capítulo: `--only 03 --out dist/t03.html`). Não há testes; verifique no navegador em 1440×900 e 390×844, sem erros no console.
Os capítulos são isolados: CSS sempre com prefixo `#ch-NN`, JS só dentro do callback, só as bibliotecas do shell (three r128, GSAP), sem imagens externas nem logotipos.
As fontes de fatos são `reports/` e `Bill Gates história completa/`. A pasta `research_notes/` citada no SPEC está vazia. Nada inventado; citações apócrifas só aparecem como lenda no cap. 09.
`.playwright-mcp/` e `dist/` são resíduos de teste: não commitar.
