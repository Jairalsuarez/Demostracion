import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

const src = path.resolve('public/images/IcoSinFondo.png');
const dstDir = path.resolve('public/images/icons');
fs.mkdirSync(dstDir, { recursive: true });

async function resize(size) {
  await sharp(src)
    .resize(size, size, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .png()
    .toFile(path.join(dstDir, `icon-${size}x${size}.png`));
  console.log(`Creado icon-${size}x${size}.png`);
}

Promise.all([resize(192), resize(512)]).then(() => console.log('Listo!'));
