const fs = require('fs');
const path = require('path');

const catalogPath = path.resolve(__dirname, '../public/data/kitab/catalog.json');
const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf-8'));

const items = catalog.map((k) => ({
  id: k.id,
  ulama: k.ulama,
  kategori: k.kategori,
  judul: k.judul,
  deskripsi: k.deskripsi,
  bab: k.babList.map((b) => ({
    nomor: b.nomor,
    judul: b.judul,
    teks: '',
  })),
}));

const tsContent = `import type { KitabItem } from "./kitab-data"

export const TURATS_EXPANDED_KITAB_DATA: KitabItem[] = ${JSON.stringify(items, null, 2)} as KitabItem[];
`;

const targetFile = path.resolve(__dirname, '../src/lib/turats-kitab-data.ts');
fs.writeFileSync(targetFile, tsContent, 'utf-8');

const stat = fs.statSync(targetFile);
console.log('Optimized turats-kitab-data.ts written successfully:', (stat.size / 1024).toFixed(1) + ' KB');
