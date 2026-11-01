#!/usr/bin/env node
// Hook PreToolUse: impõe a regra "Nunca toque na tipografia" do CLAUDE.md, sem exceção.
//
// Como funciona: extrai as declarações de tipografia do texto ANTES e DEPOIS da edição
// (font-*, @font-face, links de Google Fonts, letter-spacing, line-height, text-transform,
// equivalentes em JS e `ctx.font =` de canvas). Se o conjunto mudou, bloqueia (exit 2).
// Editar qualquer outra coisa, inclusive linhas ao redor, passa normalmente.
//
// Entrada: JSON do hook em stdin. Saída: exit 0 (liberado) ou exit 2 + motivo em stderr (bloqueado).

import { readFileSync, existsSync } from 'node:fs';
import { extname } from 'node:path';

const CODE_EXT = new Set(['.html', '.htm', '.css', '.scss', '.js', '.mjs', '.cjs', '.jsx', '.ts', '.tsx', '.svg']);

// Cada padrão captura uma "declaração de tipografia" inteira, valor incluído.
// O valor vai até ; } ou fim de linha (não para em aspas: nomes de fonte vêm entre aspas).
const PATTERNS = [
  /@font-face\s*\{[^}]*\}/gi,
  /@import[^;\n]*fonts?[^;\n]*;?/gi,
  /<link\b[^>]*fonts\.(?:googleapis|gstatic)[^>]*>/gi,
  // CSS: propriedades font*, custom properties --font*, e as três propriedades de aspecto da letra
  /(?<![a-z0-9_])(?:font(?:-[a-z-]+)?|letter-spacing|line-height|text-transform)\s*:\s*[^;}\n<]+/gi,
  // JS (camelCase) em objetos de estilo ou atribuições: el.style.fontSize = ..., { fontWeight: ... }
  /\b(?:fontFamily|fontSize|fontWeight|fontStyle|fontVariant|fontStretch|fontFeatureSettings|fontVariationSettings|letterSpacing|lineHeight|textTransform)\s*[:=]\s*[^;}\n]+/g,
  // canvas: ctx.font = '12px Foo'
  /\.font\s*=\s*[^;\n]+/g,
  // style.setProperty('font-size', ...)
  /setProperty\(\s*['"](?:--)?(?:font|letter-spacing|line-height|text-transform)[^)]*\)/gi,
];

function extract(text) {
  const out = [];
  for (const re of PATTERNS) {
    for (const m of (text || '').matchAll(re)) {
      out.push(m[0].replace(/\s+/g, ' ').replace(/\s*;\s*$/, '').trim());
    }
  }
  return out.sort();
}

// diferença de multiconjuntos: o que entrou e o que saiu
function diff(before, after) {
  const count = (arr) => arr.reduce((m, x) => m.set(x, (m.get(x) || 0) + 1), new Map());
  const b = count(before), a = count(after);
  const added = [], removed = [];
  for (const [k, n] of a) for (let i = 0; i < n - (b.get(k) || 0); i++) added.push(k);
  for (const [k, n] of b) for (let i = 0; i < n - (a.get(k) || 0); i++) removed.push(k);
  return { added, removed };
}

function isGuardedFile(p) {
  if (!p) return false;
  const norm = String(p).replace(/\\/g, '/');
  if (norm.includes('/.claude/')) return false; // este próprio hook e as skills descrevem a regra com essas palavras
  return CODE_EXT.has(extname(norm).toLowerCase());
}

function block(file, d) {
  const lines = [
    'BLOQUEADO pela regra de tipografia do CLAUDE.md (sem exceção, nem a pedido do usuário).',
    `Arquivo: ${file}`,
  ];
  if (d.added.length) lines.push('Entrou: ' + d.added.slice(0, 6).map((s) => `\n  + ${s}`).join(''));
  if (d.removed.length) lines.push('Saiu: ' + d.removed.slice(0, 6).map((s) => `\n  - ${s}`).join(''));
  lines.push(
    'Refaça a edição mantendo todas as linhas de fonte idênticas, byte a byte. ' +
    'Se o pedido exige mudar a tipografia, não faça: avise o usuário em uma linha, citando a regra.'
  );
  process.stderr.write(lines.join('\n') + '\n');
  process.exit(2);
}

const BASH_FONTISH = /font-(?:family|size|weight|style|variant|stretch|feature-settings|variation-settings)|@font-face|letter-spacing|line-height|text-transform|fonts\.googleapis|\bfont\s*:/i;
const BASH_WRITES = /\bsed\b[^|\n]*\s-[a-zA-Z]*i|\bperl\b[^|\n]*\s-[a-zA-Z]*i|\btee\b|>>?\s*\S+\.(?:html|css|js|mjs|cjs|svg)\b|\bnode\b[^|\n]*\s-e\b|\bpython3?\b[^|\n]*\s-c\b|\bSet-Content\b|\bOut-File\b|\bAdd-Content\b/i;

let input;
try {
  input = JSON.parse(readFileSync(0, 'utf8'));
} catch {
  process.stderr.write('block-font-changes: entrada do hook ilegível.\n');
  process.exit(1); // com onFailure "block" isto bloqueia a ação por segurança
}

const tool = input.tool_name;
const ti = input.tool_input || {};

if (tool === 'Edit') {
  if (isGuardedFile(ti.file_path)) {
    const d = diff(extract(ti.old_string), extract(ti.new_string));
    if (d.added.length || d.removed.length) block(ti.file_path, d);
  }
} else if (tool === 'MultiEdit') {
  if (isGuardedFile(ti.file_path)) {
    const edits = Array.isArray(ti.edits) ? ti.edits : [];
    const d = diff(extract(edits.map((e) => e.old_string).join('\n')), extract(edits.map((e) => e.new_string).join('\n')));
    if (d.added.length || d.removed.length) block(ti.file_path, d);
  }
} else if (tool === 'Write') {
  if (isGuardedFile(ti.file_path)) {
    const before = existsSync(ti.file_path) ? readFileSync(ti.file_path, 'utf8') : '';
    const d = diff(extract(before), extract(ti.content));
    if (d.added.length || d.removed.length) block(ti.file_path, d);
  }
} else if (tool === 'Bash') {
  const cmd = String(ti.command || '');
  if (BASH_FONTISH.test(cmd) && BASH_WRITES.test(cmd)) {
    process.stderr.write(
      'BLOQUEADO pela regra de tipografia do CLAUDE.md (sem exceção): o comando parece gravar ' +
      'propriedades de fonte em arquivos. Use apenas leitura (grep/cat) ou não toque na tipografia.\n'
    );
    process.exit(2);
  }
}

process.exit(0);
