import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

// Khi blog chạy ở đường dẫn con (ví dụ /blog), thêm đường dẫn đó vào mọi link bắt đầu bằng /
// trong HTML đã build. Nhờ vậy trang và bài viết vẫn viết link như /about hay /images/a.png.
export default function baseLinks(base) {
  return {
    name: 'base-links',
    hooks: {
      'astro:build:done': async ({ dir }) => {
        if (!base) return;
        const root = fileURLToPath(dir);
        // Astro đã tự thêm đường dẫn con cho file trong _astro, không thêm lần nữa
        const link = new RegExp(`(\\s(?:href|src)=["'])/(?!/|${base.slice(1)}/_astro/)`, 'g');
        const files = await readdir(root, { recursive: true });
        for (const file of files.filter((f) => f.endsWith('.html'))) {
          // Dashboard trong projects/<tên>/ là file độc lập, không thuộc phần Astro build.
          // Riêng projects/index.html là trang của blog nên vẫn phải sửa.
          if (/^projects\/.+\//.test(file.replaceAll('\\', '/'))) continue;
          const path = join(root, file);
          const html = await readFile(path, 'utf8');
          await writeFile(path, html.replace(link, `$1${base}/`));
        }
      },
    },
  };
}
