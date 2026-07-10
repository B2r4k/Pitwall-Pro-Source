import fs from 'fs';
import path from 'path';

const files = fs.readdirSync('src');
for (const file of files) {
  if (file.endsWith('.js') && file !== 'vite-env.d.ts') {
    fs.unlinkSync(path.join('src', file));
  }
}
