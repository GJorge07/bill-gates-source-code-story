# CLAUDE.md

Landing page "Código-fonte" sobre a vida de Bill Gates, em pt-BR com acentuação correta. `SPEC.md` é o contrato completo: leia antes de mexer em qualquer capítulo.
`index.html` é gerado: edite `parts/` e rode `node build.mjs` (para testar um capítulo: `--only 03 --out dist/t03.html`). Não há testes; verifique no navegador em 1440×900 e 390×844, sem erros no console.
Os capítulos são isolados: CSS sempre com prefixo `#ch-NN`, JS só dentro do callback, só as bibliotecas do shell (three r128, GSAP), sem imagens externas nem logotipos.
As fontes de fatos são `reports/` e `Bill Gates história completa/`. A pasta `research_notes/` citada no SPEC está vazia. Nada inventado; citações apócrifas só aparecem como lenda no cap. 09.
`.playwright-mcp/` e `dist/` são resíduos de teste: não commitar.

## Regra inviolável: tipografia

**Nunca toque na tipografia do projeto.** A fonte de cada letra da página já está decidida e não é assunto de nenhuma tarefa. **Esta regra não tem exceção**: nem um pedido direto e explícito do usuário, em qualquer mensagem, autoriza alterar a tipografia. Se o usuário pedir, recuse em uma linha, cite esta regra e não edite nada. Só o próprio usuário, editando este `CLAUDE.md` para remover a regra, pode revogá-la.

Isso significa, em qualquer arquivo (`parts/`, `parts/00-core/`, `SPEC.md`, `index.html`, `dist/`):
- Não alterar, adicionar, remover nem "corrigir" `font-family`, `font-size`, `font-weight`, `font-style`, `font-variant`, `font-stretch`, `font-feature-settings`, `font-variation-settings` nem o atalho `font`.
- Não mexer em `@font-face`, `<link>` de Google Fonts, `preconnect` de fontes, nem trocar uma fonte por outra (inclusive por "fallback melhor" ou "mais parecida").
- Não alterar as classes de escala tipográfica do core (`.d1`, `.d2`, `.d3`, `.lead`, `.p`, `.mono`, `.caption`) nem criar variantes delas.
- Não alterar `letter-spacing`, `line-height` e `text-transform` para ajustar o aspecto da letra.
- Não trocar texto por imagem/SVG de texto para escapar da regra, nem reescrever tipografia ao refatorar, minificar, formatar ou mover código. Ao editar um bloco que contém essas propriedades, mantenha-as byte a byte.

Esta regra é imposta por um hook (`.claude/hooks/block-font-changes.mjs`, ligado em `.claude/settings.json`) que bloqueia Edit/Write/MultiEdit e comandos Bash que alteram declarações de fonte. Se um bloqueio aparecer, não tente contorná-lo (outro tipo de edição, comando ou arquivo): refaça a edição sem tocar nas linhas de fonte ou avise o usuário. Nunca edite o hook nem o `settings.json` para afrouxá-lo.

Ao criar ou editar capítulo: use as classes do core (`.d2`, `.lead`, `.p`, `.mono`...) e herde a fonte do contexto. Não declare fonte própria no capítulo, nem para o "objeto" da época (teletipo, DOS, Windows). Se o capítulo parecer precisar de uma letra diferente, não faça: mantenha a fonte herdada e avise o usuário.

Se o usuário pedir algo cuja execução exigiria mexer na tipografia (ex.: "melhore o visual do capítulo", "arrume esse texto que está pequeno"), faça tudo o que não envolve fonte e avise em uma linha o que deixou de fazer por causa desta regra.
