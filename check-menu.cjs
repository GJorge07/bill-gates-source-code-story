// Abre index.html em 390x844 e confere se o botão "Capítulos" está visível e dentro da tela.
// Uso: node check-menu.cjs   (precisa do pacote playwright resolvível, ex. via NODE_PATH)
const { chromium } = require('playwright');
const { pathToFileURL } = require('node:url');
const { join } = require('node:path');

const W = 390, H = 844;

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: W, height: H } });
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));

  await page.goto(pathToFileURL(join(__dirname, 'index.html')).href, { waitUntil: 'load' });

  const btn = page.getByRole('button', { name: 'Capítulos' });
  const problems = [];

  if ((await btn.count()) !== 1) {
    problems.push(`esperava 1 botão "Capítulos", achei ${await btn.count()}`);
  } else {
    await btn.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
    if (!(await btn.isVisible())) problems.push('botão não está visível');

    const box = await btn.boundingBox();
    if (!box) {
      problems.push('botão sem caixa de layout');
    } else {
      const fora = box.x < 0 || box.y < 0 || box.x + box.width > W || box.y + box.height > H;
      console.log(`caixa: x=${box.x.toFixed(1)} y=${box.y.toFixed(1)} w=${box.width.toFixed(1)} h=${box.height.toFixed(1)} (viewport ${W}x${H})`);
      if (fora) problems.push('botão sai dos limites da tela');

      // visível também significa não estar coberto por outro elemento
      const noTopo = await btn.evaluate((el) => {
        const r = el.getBoundingClientRect();
        const hit = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2);
        return !!hit && el.contains(hit);
      });
      if (!noTopo) problems.push('botão está coberto por outro elemento');
    }
  }

  await browser.close();

  if (errors.length) console.log(`erros no console: ${errors.join(' | ')}`);
  if (problems.length) {
    console.log(`FALHOU: ${problems.join('; ')}`);
    process.exit(1);
  }
  console.log('PASSOU');
})();
