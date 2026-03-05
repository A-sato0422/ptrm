import { defineConfig, Plugin } from 'vite';
import * as fs from 'fs';
import * as path from 'path';

/**
 * ビルド時（および dev サーバー時）に HTML パーシャルを静的展開するプラグイン。
 *
 * 使い方:
 *   <!-- #partial:header -->        → src/partials/header.html の内容に置換
 *   <!-- #partial:nav:index -->     → src/partials/nav.html の内容に置換し、
 *                                     data-nav="index" のボタンに class="nav-btn active" を付与
 */
function htmlPartialsPlugin(): Plugin {
  const partialsDir = path.resolve(__dirname, 'src/partials');

  function loadPartial(name: string): string {
    return fs.readFileSync(path.join(partialsDir, `${name}.html`), 'utf-8');
  }

  function buildNav(activePage: string): string {
    const navHtml = loadPartial('nav');
    // data-nav="<activePage>" のボタンだけに active クラスを付与
    return navHtml.replace(
      new RegExp(`(data-nav="${activePage}"[^>]*class="nav-btn)(")`),
      '$1 active$2'
    ).replace(
      new RegExp(`class="nav-btn"([^>]*data-nav="${activePage}")`),
      'class="nav-btn active"$1'
    );
  }

  function transformHtml(html: string, filename: string): string {
    const page = path.basename(filename, '.html'); // "index", "action", "stage", "profile" …

    // <!-- #partial:header --> を展開
    html = html.replace(/<!--\s*#partial:header\s*-->/g, loadPartial('header'));

    // <!-- #partial:nav --> または <!-- #partial:nav:ページ名 --> を展開
    html = html.replace(/<!--\s*#partial:nav(?::(\w+))?\s*-->/g, (_match, p) => {
      return buildNav(p ?? page);
    });

    return html;
  }

  return {
    name: 'html-partials',
    transformIndexHtml: {
      order: 'pre',
      handler(html, ctx) {
        return transformHtml(html, ctx.filename);
      },
    },
  };
}

export default defineConfig({
  root: '.',
  base: '/',
  plugins: [htmlPartialsPlugin()],
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: './index.html',  // mainは慣習的にトップページを指す
        action: './action.html',
        stage: './stage.html',
        profile: './profile.html',
        clients: './clients.html',
        clientDetail: './client-detail.html',
        settings: './settings.html',
      },
    },
  },
  server: {
    port: 3000,
    open: true,
  },
});

