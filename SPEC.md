# SPEC — "Código-fonte": a história de Bill Gates (landing page)

Entrega final: **um único arquivo `index.html`** (pasta `C:/Users/Gabriel Jorge/Projetos/202/`), gerado por `node build.mjs` a partir de fragmentos em `parts/`. Idioma: **português do Brasil**, com acentuação correta.

## 1. Conceito

A vida de Gates contada como um programa sendo **compilado**. Mas o que torna a página única é que **cada época tem seu próprio material e sua própria paleta**: a página muda de "matéria" conforme a história avança (papel de jornal → vazio → papel de teletipo → painel do Altair → monitor âmbar → Windows → mar profundo → sombra → luz de hoje). O fundo do `<body>` faz transição suave entre eras (feito pelo core, via `data-era`).

Tom: narrativo, íntimo, preciso. Texto curto, que conduz a interação (nunca parágrafos longos). Interação não é enfeite: cada capítulo tem **uma interação central** que ensina algo sobre aquele momento da vida (jogar o jogo da velha no teletipo, ligar chaves do Altair, escolher licenciar o DOS...).

### Proibido (marcas de página genérica)
- Fundo creme + serifada + terracota; fundo quase-preto + verde-ácido como estética única.
- Rótulos em CAIXA ALTA espaçada acima de todo título; numeração 01/02/03 sem que o conteúdo seja uma sequência; "→" em todo botão.
- Cards arredondados idênticos com sombra cinza; gradientes decorativos sem função.
- Fade-up em tudo. Movimento automático só quando chama atenção para algo; movimento que **responde à ação** do usuário é bem-vindo.
- Imagens externas, fotos hotlinkadas, logotipos oficiais. **Tudo é desenhado** (SVG, canvas, CSS, WebGL). Não reproduza logotipo da Microsoft/Windows/Apple; evoque (janelas, cores, bevel) sem copiar marca.

## 2. Estrutura de arquivos

```
202/
  SPEC.md                (este contrato)
  build.mjs              (não editar)
  parts/
    00-core/shell.html   (dono: agente CORE)  — <head>, loader, nav, áudio, runtime
    00-core/core.css
    00-core/core.js
    00-core/READY        (o CORE cria este arquivo quando o runtime estiver testável)
    00-hero.html         (CORE)    Abertura: boot
    01-raizes.html       Antes de nascer: os pais e os avós
    02-nascimento.html   3D: o nascimento
    03-lakeside.html     Teletipo, jogo da velha, Kent Evans, Traf-O-Data
    04-altair.html       Harvard e Altair BASIC
    05-dos.html          Microsoft nasce; o acordo da IBM e o MS-DOS
    06-windows.html      Máquina do tempo do Windows; antitruste; Apple
    07-proposito.html    Dinheiro, Giving Pledge, Fundação, globo 3D
    08-luz-sombra.html   Casamento, divórcio, Epstein, mitos
    09-livro-telas.html  O livro "Código-fonte", documentários, citações verdadeiras vs. lendas
    10-hoje.html         IA, clima, 2045, linha do tempo mestra, fontes e créditos
  dist/                  (saídas de teste; cada agente usa seu próprio nome)
  index.html             (saída final)
```

Cada capítulo é **um único arquivo** `parts/NN-slug.html`. Um agente só escreve no **seu** arquivo. Não edite arquivos de outros.

### Build
```
node build.mjs                          # gera index.html com tudo
node build.mjs --only 03 --out dist/t03.html     # só o core + capítulo 03 (teste)
node build.mjs --only 03,04 --out dist/x.html
```
`--only` sempre inclui o core. Abra o resultado com `file:///C:/Users/Gabriel%20Jorge/Projetos/202/dist/t03.html`. Teste de verdade (Playwright MCP, se disponível via ToolSearch: `browser_navigate`, `browser_take_screenshot`, `browser_console_messages`, `browser_evaluate`, `browser_resize`) em **1440×900 e 390×844**. Sem erros no console. Se Playwright não estiver disponível, use `node --check` nos scripts e revise o código com rigor.
Espere o arquivo `parts/00-core/READY` existir antes de testar (o core está sendo escrito em paralelo). Enquanto isso, escreva seu capítulo contra este contrato.

## 3. Formato de um capítulo

```html
<section class="chapter" id="ch-03" data-era="teletype" data-title="Lakeside" data-year="1968">
  ...conteúdo...
</section>
<style>
  /* TODO seletor começa com #ch-03 */
  #ch-03 .algo { ... }
</style>
<script>
Gates.chapter('ch-03', function (ctx) {
  // roda no carregamento, na ordem do DOM. Prepare DOM, ScrollTrigger, eventos. Barato.
  return {
    enter()   {},   // capítulo ficou visível (primeira vez: crie WebGL/loops pesados aqui)
    leave()   {},   // saiu da tela: pause loops
    progress(p) {}, // 0→1 conforme a seção atravessa a janela (opcional)
    resize()  {},   // opcional
  };
});
</script>
```
- `id` = `ch-NN`; `data-era` ∈ lista abaixo; `data-title` (aparece na navegação) e `data-year` (texto curto: "1955", "1975–81").
- **Todo CSS com prefixo `#ch-NN`**. Nada global. Nada de `body {}` ou `html {}`.
- Todo JS dentro do callback de `Gates.chapter`. Nada de variáveis globais soltas.
- Cada capítulo pode ter vários "atos". Capítulos **pinados** (cena fixa enquanto o scroll avança) devem usar `ScrollTrigger` com `pin: true`, `scrub`, e altura total razoável (≤ 500vh). Seção pinada em celular: precisa funcionar também (ou usar versão simplificada sem pin).
- Cada capítulo deve ter **altura total entre ~150vh e ~600vh**; o conjunto da página deve fluir como uma história, sem becos.

### `ctx` (fornecido pelo core)
| propriedade | descrição |
|---|---|
| `ctx.root` | o elemento `<section>` |
| `ctx.$(sel)` / `ctx.$$(sel)` | `querySelector` / `querySelectorAll` (array) dentro do capítulo |
| `ctx.gsap`, `ctx.ScrollTrigger`, `ctx.THREE` | bibliotecas globais (v. §6) |
| `ctx.audio.play(nome, {vol, rate})` | nomes: `click`, `key`, `tick`, `heartbeat`, `cry`, `chime`, `boot`, `whoosh`, `error`, `success`, `teletype`, `bell`, `flip`, `pop`. Mudo até o usuário ativar o som (você não precisa checar). |
| `ctx.audio.ac`, `ctx.audio.master` | `AudioContext` e `GainNode` mestre, se precisar sintetizar algo próprio (verifique `ctx.audio.enabled`) |
| `ctx.reduced` | `true` se `prefers-reduced-motion` (ofereça alternativa estática/mais calma) |
| `ctx.touch` | `true` em dispositivo de toque |
| `ctx.onFrame(fn)` | registra `fn(timeMs, dtMs)` rodando via rAF **somente enquanto o capítulo está visível** |
| `ctx.visible` | boolean, se o capítulo está em vista |
| `ctx.webgl(canvas, opts)` | cria `THREE.WebGLRenderer` com pixelRatio limitado (≤2), antialias e tratamento de resize do canvas; retorna `{renderer, setSize(), dispose()}` |
| `ctx.say(texto)` | anuncia texto para leitores de tela (aria-live) |
| `ctx.fact(id)` | abre o painel "ressalva" do core com a nota de fonte `id` (ver §7) — opcional |

Utilitários HTML automáticos (core): `data-reveal="fade|up|left|right|scale"` (entrada ao rolar, usar com **muita** parcimônia, só onde ajuda a leitura), `data-count="106.5" data-decimals="1" data-prefix="US$ " data-suffix=" bi"` (contador animado ao entrar), `data-parallax="0.2"`.

### Eras (`data-era`) → variáveis CSS (definidas no `<body>`, transição de 1.2s)
Cada capítulo pode (e deve) pintar o próprio cenário, mas o texto e os controles usam estas variáveis para ficar coerentes: `--bg`, `--fg`, `--muted`, `--accent`, `--accent2`, `--line`, `--panel`.

| era | quando | `--bg` | `--fg` | `--accent` | `--accent2` | material |
|---|---|---|---|---|---|---|
| `newsprint` | 1900–1955 (raízes) | #cfd2cc | #1b2230 | #2f6f73 | #a8492f | jornal de Seattle, tinta azul-marinho, chuva |
| `void` | nascimento | #05060d | #f3eef0 | #ff5a7a | #7a8cff | escuro absoluto, pulso, luz de vida |
| `teletype` | 1968–1972 | #17161c | #ece7c9 | #8f7dff | #e6d27a | papel amarelado de teletipo, fita violeta |
| `altair` | 1974–1975 | #0b1a2b | #dfe8f2 | #ff3b3b | #6fb1ff | painel azul-metálico, LEDs vermelhos |
| `amber` | 1975–1981 | #120b02 | #ffb42e | #ffd37a | #ff7a1a | monitor âmbar, DOS |
| `win` | 1985–2001 | #008080 | #0a0a0a | #000080 | #c0c0c0 | cinza bevel e verde-azulado de interface clássica |
| `deep` | 2000–2025 (propósito) | #06222b | #e8f6f1 | #2fd1a0 | #ffd166 | mar profundo, mapa-múndi, bioluminescência |
| `shadow` | luz e sombra | #0c0c0c | #f2f2f2 | #ffffff | #8a8a8a | preto e branco, alto contraste |
| `light` | hoje | #f4f6fb | #0d1220 | #2d5bff | #00b894 | tela limpa de hoje |

### Tipografia e classes do core
- Display e texto: **Bricolage Grotesque** (variável). Código, datas, tela de terminal: **IBM Plex Mono**. (Carregadas pelo core via Google Fonts; defina fallback `system-ui` / `ui-monospace`.) Cada capítulo pode usar fontes de sistema próprias no seu "objeto" (ex.: Windows usa `Tahoma, Segoe UI, sans-serif`; teletipo usa `Courier New`).
- Escala: `.d1` (hero, clamp 3rem–9rem), `.d2` (títulos de capítulo), `.d3`, `.lead` (parágrafo-guia ≤ 60ch), `.p` (corpo ≤ 62ch), `.mono`, `.caption`.
- `.container` (max 1180px, gutter 20–48px), `.stack` (flex coluna com gap), `.btn` (botão sóbrio, foco visível), `.chip`, `.hint` (instrução de interação, com ícone sutil), `.sr-only`.
- Mínimo de acessibilidade: foco visível, contraste suficiente, alvos de toque ≥ 44px, interações operáveis por teclado, `aria-label`s, `ctx.reduced` respeitado.

## 4. Orçamento e desempenho
- WebGL: **no máximo 1 renderer por capítulo**, criado em `enter()` (via `ctx.webgl`), loop pausado em `leave()`. Capítulos com WebGL: 02 (nascimento), 07 (globo), 09 (livro, opcional, prefira CSS 3D). Demais: Canvas 2D / SVG / CSS 3D.
- Mantenha cada capítulo ≤ ~60 KB de fonte. Sem bibliotecas além das do §6. Sem fetch de rede em tempo de execução (tudo embutido).
- 60 fps em notebook comum; no celular reduza partículas (`ctx.touch`).

## 5. Conteúdo: regras de verdade
- Fonte da verdade: `reports/Bill Gates história completa.md` (relatório consolidado) e `research_notes/Bill Gates história completa/0*.md` (notas por tema). **Leia o relatório inteiro e as notas relevantes ao seu capítulo antes de escrever.**
- O usuário aceitou pequena incerteza, mas **não invente fatos**. Para itens incertos/conflitantes (a tabela de conflitos do relatório), use formulações como "cerca de", "segundo relatos", "dizem que" ou omita.
- **Nunca use as citações apócrifas** (640K, "pessoa preguiçosa", GM/carros) como se fossem dele; elas só aparecem como "lenda" no jogo do capítulo 09.
- Temas sensíveis (Epstein, divórcio, críticas à fundação, teorias de conspiração): tom sóbrio, sem sensacionalismo; alegações marcadas como alegações; o que ele nega aparece como negado.
- Não afirme que Gates "criou" o que foi criado por outros (DOS veio do 86-DOS da Seattle Computer Products; o Altair BASIC contou com Allen e Davidoff).
- Cada afirmação factual forte deve poder ser rastreada ao relatório. Cada capítulo termina (ou contém, discretamente) um botão/ícone "ressalvas" que lista em 2–5 linhas as incertezas do capítulo, usando `ctx.fact('ch-NN')` — o capítulo 10 consolida as fontes principais.

## 6. Bibliotecas (carregadas pelo core, não importe de novo)
- `three` r128 (global `THREE`): `https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js`. Sem OrbitControls/loaders (escreva seus controles). Sem pós-processamento de `examples/`.
- `gsap` 3.12.2 + `ScrollTrigger` (globais): cdnjs.
- Só isso. Todo o resto é código seu.

## 7. Painel de ressalvas
O core fornece `Gates.facts[id] = {title, items:[{text, url?}]}` e `ctx.fact(id)`. Cada capítulo registra as suas no `Gates.chapter` (ex.: `Gates.facts['ch-03'] = {...}` antes de retornar). O core cria o painel lateral acessível, e o capítulo 10 lista as fontes principais com links reais (URLs presentes nas notas).

## 8. Qualidade esperada
Bar muito alto: parece peça de estúdio premiada, não trabalho escolar. Hierarquia tipográfica clara, ritmo de cena (respiros, silêncio, clímax), microinterações com peso físico (inércia, som, resposta tátil), nada quebrado em celular. A **direção de arte vem do objeto de cada época**, não de um template. Antes de entregar: teste, tire screenshots, critique, corrija.
