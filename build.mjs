// Monta index.html (um único arquivo) a partir de parts/.
// Uso: node build.mjs [--only 03,04] [--out dist/teste.html]
import { readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const opt = (name) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : null;
};
const only = opt('--only')?.split(',').map((s) => s.trim().padStart(2, '0'));
const out = resolve(root, opt('--out') ?? 'index.html');

const core = join(root, 'parts', '00-core');
const read = (p) => readFileSync(p, 'utf8');

if (!existsSync(join(core, 'shell.html'))) {
  console.error('parts/00-core/shell.html ainda não existe (o core está em construção).');
  process.exit(1);
}

const parts = readdirSync(join(root, 'parts'))
  .filter((f) => /^\d\d-.+\.html$/.test(f))
  .filter((f) => !only || only.includes(f.slice(0, 2)) || f.startsWith('00-'))
  .sort();

// --only inclui o core; o hero (00-hero) só entra se pedido explicitamente ("00") ou sem --only.
const chosen = parts.filter((f) => !only || !f.startsWith('00-') || only.includes('00'));

const chapters = chosen
  .map((f) => `\n<!-- ===== ${f} ===== -->\n${read(join(root, 'parts', f))}`)
  .join('\n');

const html = read(join(core, 'shell.html'))
  .replace('<!--CORE_CSS-->', () => `<style>\n${read(join(core, 'core.css'))}\n</style>`)
  .replace('<!--CORE_JS-->', () => `<script>\n${read(join(core, 'core.js'))}\n</script>`)
  .replace('<!--CHAPTERS-->', () => chapters);

mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, html);
console.log(`ok: ${out} (${(html.length / 1024).toFixed(1)} KB) — partes: ${chosen.join(', ')}`);
