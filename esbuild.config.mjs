import esbuild from 'esbuild';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { copy } from 'esbuild-plugin-copy';
import fs from 'fs';
import crypto from 'crypto';

// Load `.env` variables
const environment = process.env.NODE_ENV || 'development';

const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory
const envFilePath = path.resolve(__dirname, `.env.${environment}`);
const dotenvConfig = dotenv.config({ path: envFilePath }).parsed || {};

// Merge `process.env` with `dotenv` variables
const env = {
  ...dotenvConfig, // Values from `.env` file
  ...process.env, // Values set directly in the build command
};

const envKeys = Object.keys(env).reduce((acc, key) => {
  acc[`process.env.${key}`] = JSON.stringify(env[key]);
  return acc;
}, {});

const buildDir = 'dist';

// Build process
esbuild
  .build({
    entryPoints: ['./src/index.tsx'],
    bundle: true,
    minify: true,
    sourcemap: true,
    outdir: 'dist',
    define: {
      ...envKeys,
    },
    loader: {
      '.css': 'text',
      '.png': 'file',
      '.svg': 'file',
    },
    target: ['es2015'],
    plugins: [
      copy({
        // Plugin options
        resolveFrom: 'cwd',
        assets: [
          {
            from: './public/*', // Source files
            to: buildDir, // Destination directory
          },
        ],
      }),
    ],
  })
  .then(() => {
    // 1. Prepare cached-files and noncached-files
    const cachedDir = path.resolve(buildDir, 'cached-files');
    const noncachedDir = path.resolve(buildDir, 'noncached-files');
    for (const dir of [cachedDir, noncachedDir]) {
      if (fs.existsSync(dir)) {
        fs.rmSync(dir, { recursive: true });
      }
      fs.mkdirSync(dir);
    }

    // 2. Calculate checksum for built `index.js`
    const indexJsPath = path.join(buildDir, 'index.js');
    const content = fs.readFileSync(indexJsPath);
    const hash = crypto.createHash('sha256').update(content).digest('hex').slice(0, 8); // 8 characters
    const hashedFileName = `index.${hash}.js`;
    const hashedFilePath = path.join(buildDir, hashedFileName);

    // 3. Rename index.js
    fs.renameSync(indexJsPath, hashedFilePath);

    // 4. Replace in index.html into noncached-files
    const indexHtmlPath = path.join(buildDir, 'index.html');
    let indexHtml = fs.readFileSync(indexHtmlPath, 'utf8');
    indexHtml = indexHtml.replace('src="./index.js"', `src="${hashedFileName}"`);
    fs.writeFileSync(path.join(noncachedDir, 'index.html'), indexHtml);

    // 5. Copy other assets to cached-files
    const files = fs.readdirSync(buildDir);
    for (const file of files) {
      if (!['index.js', 'index.html', 'cached-files', 'noncached-files'].includes(file)) {
        const src = path.join(buildDir, file);
        const dest = path.join(cachedDir, file);
        fs.copyFileSync(src, dest);
      }
    }

  })
  .catch((err) => {
    console.error('Build failed:', err);
    process.exit(1);
  });
