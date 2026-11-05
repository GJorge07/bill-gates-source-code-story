# Código-fonte.

Landing page interativa sobre a vida de Bill Gates, contada como um programa sendo compilado.

HTML · CSS · JavaScript · three.js · GSAP

**[Ver a página no ar](https://bill-gates-source-code-story.vercel.app)**

## 📌 Sobre o projeto

Este repositório é a minha entrega da **P0 da Trilha da 202**.

A [Trilha da 202]é a trilha de builders AI-native da 202 Lab : (https://202lab.com.br). Ela roda dentro do próprio Claude Code: você clona a "sala", abre a pasta e o Claude conduz as aulas, corrige as práticas e registra o progresso. A sala é onde se tem aula; a prática acontece numa pasta irmã, a "oficina", aberta em outra janela.

A P0, do módulo 1, é a "landing page livre": escolher o que construir, colocar a página num repositório público no GitHub e publicá-la. É a primeira prática da trilha.

O tema livre virou a história de Bill Gates, do que veio antes do nascimento dele até hoje. Além da página, o repositório guarda o que usei para dirigir o agente durante o trabalho:

- **`SPEC.md`:** o contrato completo da página, com o conceito, o formato dos capítulos e as regras de conteúdo.
- **`DESIGN.md`:** as decisões de design que as próximas edições precisam respeitar.
- **`CLAUDE.md`:** as instruções do projeto para o Claude Code.
- **`.claude/`:** um hook que bloqueia mudanças de tipografia e a skill `novo-capitulo`, que cria capítulos já no formato do SPEC.


## ✨ O que tem na página

Cada época tem material e paleta próprios: a página passa por papel de jornal, teletipo, painel do Altair, monitor âmbar, Windows, mar profundo, sombra e luz.

- **Boot:** a abertura, que pergunta se você quer ativar a trilha sintetizada.
- **Raízes:** uma chuva que desvia do ponteiro e uma árvore genealógica que "compila" as constantes da família.
- **Nascimento:** uma cena em 3D conduzida pela rolagem.
- **Lakeside:** um teletipo em que você joga o jogo da velha.
- **Altair:** um painel de alavancas para acionar com o mouse, o toque ou o teclado.
- **Microsoft:** do nome Micro-Soft ao acordo com a IBM e o MS-DOS, em monitor âmbar.
- **Windows:** uma máquina do tempo com janelas para arrastar, ícones e menu Iniciar.
- **Propósito:** a Fundação e um globo em 3D para girar.
- **Luz e sombra:** uma lanterna que ilumina o texto e afirmações para arrastar até uma categoria.
- **O livro:** o livro *Código-fonte* e um jogo de lenda ou verdade.
- **Hoje:** IA, clima, 2045, a linha do tempo completa e as fontes.
- **Acessibilidade e desempenho:** a página respeita "reduzir movimento", pausa o que está fora da tela e aceita teclado nas interações.

## 🛠️ Tecnologias

| | |
|---|---|
| Estrutura | HTML5, gerado em um único arquivo |
| Estilo | CSS puro, com tokens de cor e fonte por era |
| Interação | JavaScript puro, Canvas 2D e SVG |
| Animação e 3D | GSAP 3.12.2 com ScrollTrigger e three.js r128 |
| Build | Script próprio em Node (`build.mjs`), sem dependências |
| Deploy | Vercel |

## 🚀 Como rodar

Não precisa instalar nada. Basta abrir o `index.html` no navegador, com internet, porque as fontes e as bibliotecas vêm de CDN.

Para servir localmente:

```bash
python -m http.server 5173
```

e acessar `http://localhost:5173`.

O `index.html` é gerado, então as edições são feitas em `parts/`. Para gerar a página de novo, com Node instalado:

```bash
node build.mjs                                # gera o index.html completo
node build.mjs --only 03 --out dist/t03.html  # testa um capítulo só
```

## 📁 Estrutura

```
.
├── index.html                    # página final, gerada pelo build
├── build.mjs                     # monta o index.html a partir de parts/
├── parts/
│   ├── 00-core/                  # shell, estilos e runtime compartilhados
│   ├── 00-hero.html              # abertura
│   └── 01-raizes.html ... 10-hoje.html   # um arquivo por capítulo
├── reports/                      # relatório consolidado de pesquisa
├── Bill Gates história completa/ # notas de pesquisa por tema
├── SPEC.md                       # contrato da página
├── DESIGN.md                     # decisões de design
├── CLAUDE.md                     # instruções para o Claude Code
├── .claude/                      # hook e skill do projeto
└── README.md
```

## 🎨 Identidade visual

São nove eras de cor, e o fundo da página faz a transição entre elas conforme a história avança. A tipografia é Bricolage Grotesque nos títulos e no texto, e IBM Plex Mono no que lembra código, datas e terminal. Tudo é desenhado em SVG, Canvas, CSS ou WebGL, sem imagens externas nem logotipos oficiais.

## 👤 Autor

Gabriel Dobrowolski Jorge
