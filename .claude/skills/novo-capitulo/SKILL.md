---
name: novo-capitulo
description: Cria um novo capítulo da landing page "Código-fonte" (Bill Gates) em parts/NN-slug.html, já no formato do SPEC.md (section.chapter com id ch-NN, CSS prefixado, Gates.chapter, ressalvas) e testa com build.mjs --only. Use sempre que o usuário pedir para criar, adicionar, escrever, começar, rascunhar ou "fazer" um novo capítulo, uma nova seção, cena, ato ou época da página, mesmo sem dizer "skill" ou o número do capítulo (ex.: "preciso de um capítulo sobre a Fundação", "adiciona uma seção sobre o antitruste", "bota mais um capítulo depois do Windows", "cria o capítulo 11").
---

# Novo capítulo

Cada capítulo é um arquivo único e isolado em `parts/NN-slug.html`. O `build.mjs` junta tudo com o core (`parts/00-core/`) num `index.html`. O isolamento é o que permite escrever e testar um capítulo sem tocar nos outros. Por isso as regras abaixo existem: elas impedem que um capítulo quebre a página inteira.

Antes de começar, leia `SPEC.md` (contrato completo) se ainda não leu nesta conversa. Ele define eras, utilitários do `ctx`, orçamento de desempenho e o que é proibido visualmente.

## 1. Combine o essencial com o usuário

Só pergunte o que não der para deduzir do pedido. Precisa estar claro:

- **Tema e recorte**: de qual momento da vida ou da história trata o capítulo.
- **Posição**: o número `NN`. A ordem da página é a ordem alfabética dos arquivos, então inserir no meio exige **renumerar** os capítulos seguintes (arquivo, `id`, prefixos `#ch-NN`, `Gates.chapter('ch-NN')` e `Gates.facts['ch-NN']`). Se a posição for no meio, avise o custo e peça confirmação antes de renomear qualquer arquivo. Se for no fim, use o próximo número livre (hoje, depois do 10, seria o 11).
- **Era** (`data-era`): escolha uma das nove do SPEC (§3, tabela de eras). Uma era nova exige mexer em `core.css`, que não é do capítulo, então só proponha isso se o usuário quiser.
- **Interação central**: o SPEC pede **uma** interação que ensine algo sobre aquele momento, não enfeite. Proponha uma ideia ancorada no "objeto" da época e deixe o usuário aprovar ou trocar.

## 2. Levante os fatos antes de escrever

Fontes de verdade: `reports/Bill Gates história completa.md` e a pasta `Bill Gates história completa/` (`01` a `06`). A pasta `research_notes/` do SPEC está vazia, não conte com ela.

- Leia o relatório e as notas do tema. Cada afirmação forte tem que ser rastreável a eles.
- Não invente fatos. Para o que for incerto ou conflitante, use "cerca de", "segundo relatos", "dizem que", ou omita.
- Nunca use as citações apócrifas (640K, "pessoa preguiçosa", GM/carros) como se fossem dele. Elas só aparecem como lenda no capítulo 09.
- Temas sensíveis (Epstein, divórcio, críticas à fundação): tom sóbrio, alegações marcadas como alegações, o que ele nega aparece como negado.
- Não atribua a Gates o que outros criaram (o DOS veio do 86-DOS; o Altair BASIC contou com Allen e Davidoff).
- Anote as incertezas encontradas: elas viram o painel de ressalvas.

## 3. Crie o arquivo a partir do template

Copie `assets/capitulo-template.html` (nesta pasta da skill) para `parts/NN-slug.html` e substitua `NN`, `ERA`, `TITULO`, `ANO` e o conteúdo. O `slug` é curto, minúsculo, sem acento (ex.: `11-fundacao`).

Regras que o template já respeita e você deve manter:

- **CSS**: todo seletor começa com `#ch-NN`. Nada de `body {}`, `html {}` ou seletores globais.
- **JS**: tudo dentro do callback de `Gates.chapter('ch-NN', function (ctx) {...})`. Nenhuma variável global solta. Retorne `enter / leave / resize` e pause loops em `leave`.
- **Bibliotecas**: só three r128 e GSAP/ScrollTrigger, via `ctx.THREE`, `ctx.gsap`, `ctx.ScrollTrigger`. Não importe nada.
- **Sem imagens externas, fotos ou logotipos**. Tudo é desenhado (SVG, canvas, CSS, WebGL). Evoque marcas sem copiar.
- **Ressalvas**: registre `Gates.facts['ch-NN']` com 2 a 5 itens e ligue um botão a `ctx.fact('ch-NN')`.
- **Acessibilidade**: foco visível, alvos de toque ≥ 44px, interação por teclado, `aria-label`, respeitar `ctx.reduced` e `ctx.touch`.
- **Tamanho**: 150vh a 600vh de altura e ≤ ~60 KB de fonte. WebGL só se for essencial, com no máximo 1 renderer, criado em `enter()`.
- **Texto**: pt-BR com acentuação correta, curto, conduzindo a interação. Sem parágrafos longos.
- **Tipografia: não toque.** Siga a regra do `CLAUDE.md`. Use só as classes do core (`.d2`, `.d3`, `.lead`, `.p`, `.mono`, `.caption`) e não declare `font-*`, `@font-face`, `letter-spacing`, `line-height` nem `text-transform` no capítulo, nem para o objeto da época. A regra não tem exceção: se a cena parecer pedir outra letra, mantenha a fonte herdada e avise o usuário, mesmo que ele peça a troca.
- **Visual**: leia a lista de "Proibido" do SPEC (§1) antes de desenhar. A direção de arte vem do objeto da época, não de um template.

## 4. Construa e teste

Rode a partir de `P0/`:

```
node build.mjs --only NN --out dist/tNN.html
```

`--only` já inclui o core. Depois verifique no navegador (Playwright MCP, carregado via ToolSearch) abrindo `file:///C:/Users/Gabriel%20Jorge/Projetos/202/P0/dist/tNN.html`:

1. Tamanhos **1440×900** e **390×844** (`browser_resize`), com screenshot de cada um.
2. **Console sem erros nem avisos** do `[Gates]` (`browser_console_messages`). O core avisa quando há seção sem `Gates.chapter` ou o contrário, o que denuncia `id` errado.
3. A interação central funciona com mouse, toque e teclado.
4. Nada quebrado no celular, inclusive se houver seção pinada.

Se o Playwright não estiver disponível, rode `node --check` no JS do capítulo e revise com rigor. Corrija e repita até estar limpo.

## 5. Feche

- Gere o `index.html` completo com `node build.mjs` só se o usuário pedir. A saída de teste fica em `dist/`, que não vai para o git.
- Resuma em poucas linhas: arquivo criado, era, interação central, ressalvas registradas e o que não foi verificado.
- Se o capítulo deve entrar na linha do tempo mestra ou nos créditos do capítulo 10, avise o usuário em vez de editar o arquivo de outro capítulo (cada capítulo só escreve no seu).
