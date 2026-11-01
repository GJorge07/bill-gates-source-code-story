# DESIGN.md

Decisões de design da landing page "Código-fonte". Este arquivo registra apenas as três decisões abaixo. Ele é um contrato para edições futuras: nesta etapa a página não foi alterada, e o código atual pode ainda divergir do que está escrito aqui.

## 1. Espaço entre capítulos

Token único:

```css
--space-section: clamp(5rem, 14vh, 10rem);
```

- Toda entrada e toda saída de capítulo usa `var(--space-section)`.
- Os espaços internos de um capítulo (entre blocos, colunas, cartões) podem continuar próprios.

## 2. Fonte

- Todo capítulo usa `var(--font-display)` e `var(--font-mono)`.
- Nunca escreva o nome da fonte à mão.

Valores dos tokens (definidos em `:root`):

```css
--font-display: "Bricolage Grotesque", system-ui, -apple-system, "Segoe UI", sans-serif;
--font-mono: "IBM Plex Mono", ui-monospace, "SFMono-Regular", Menlo, Consolas, monospace;
```

**Exceções de fonte** (registradas, por escolha de estilo de época):

| Capítulo | Fonte mantida | Onde |
|---|---|---|
| 03 | `'Courier New'` | todo o capítulo (máquina antiga) |
| 04 | `Georgia` | capa da revista e cartas (`.c4-card .f`, `.c4-mag-top span`, `.c4-mag-h`) |
| 06 | `Tahoma` | interface do Windows, via `--sans` (`Tahoma, "Segoe UI", system-ui, sans-serif`) |
| 06 | `Helvetica Neue`, `Tahoma`, `Trebuchet MS`, `Segoe UI` | `--font` dos skins de SO no `.desk[data-v]` |

### Limitação conhecida: fontes em JavaScript

`var()` não funciona em `ctx.font` do canvas nem em `document.fonts.load`. Por isso estas fontes continuam escritas à mão no JS e precisam ser mantidas em sincronia com os tokens:

- `parts/00-hero.html`: `document.fonts.load('800 100px "Bricolage Grotesque"')`, `FAM` e o `ctx.font` com `IBM Plex Mono`.
- `parts/01-raizes.html`: `ctx.font` com `IBM Plex Mono`.
- `parts/02-nascimento.html`: `g.font` com `IBM Plex Mono`.

## 3. Cor de ação

- `--accent` é a única cor de coisa clicável: botão, link e foco.
- `--accent2` é só destaque decorativo, nunca em botão ou link.

### Cores avulsas (exceções)

Estas cores ficam fora dos tokens, como exceções registradas:

| Capítulo | Valores |
|---|---|
| 03 | `#4228b4`, `#e6d79c` |
| 04 | `#b3262b`, `#f1e7cc` |
| 06 | `#c0c0c0` |
| 08 | `#8a8a8a`, `#9a9a9a` |
| 09 | `#2f6f73`, `#8fb6c9` |

## Referência: tokens de cor das nove eras (valores atuais)

Definidos em `body[data-era="..."]`, em `parts/00-core/core.css`.

| Era | `--bg` | `--fg` | `--accent` | `--accent2` |
|---|---|---|---|---|
| void (padrão) | `#05060d` | `#f3eef0` | `#ff5a7a` | `#7a8cff` |
| newsprint | `#cfd2cc` | `#1b2230` | `#2f6f73` | `#a8492f` |
| teletype | `#17161c` | `#ece7c9` | `#8f7dff` | `#e6d27a` |
| altair | `#0b1a2b` | `#dfe8f2` | `#ff3b3b` | `#6fb1ff` |
| amber | `#120b02` | `#ffb42e` | `#ffd37a` | `#ff7a1a` |
| win | `#008080` | `#0a0a0a` | `#000080` | `#c0c0c0` |
| deep | `#06222b` | `#e8f6f1` | `#2fd1a0` | `#ffd166` |
| shadow | `#0c0c0c` | `#f2f2f2` | `#ffffff` | `#8a8a8a` |
| light | `#f4f6fb` | `#0d1220` | `#2d5bff` | `#00b894` |

A era `win` também fixa `--panel: #c0c0c0`, `--line: #404040` e `--muted: #1c1c1c`.
