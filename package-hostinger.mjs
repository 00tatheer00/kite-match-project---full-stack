import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = __dirname;
const standaloneDir = path.join(projectRoot, '.next', 'standalone');
const staticDir = path.join(projectRoot, '.next', 'static');
const publicDir = path.join(projectRoot, 'public');
const dataDir = path.join(projectRoot, 'data');
const envFile = path.join(projectRoot, '.env.local');

const distDir = path.join(projectRoot, 'dist-hostinger');
const zipFile = path.join(projectRoot, 'dist-hostinger.zip');

console.log('🚀 Starting Hostinger package generation...');

if (!fs.existsSync(standaloneDir)) {
  console.error('❌ .next/standalone does not exist! Please run npm run build first.');
  process.exit(1);
}

// 1. Clean previous dist
if (fs.existsSync(distDir)) {
  console.log('🧹 Cleaning old dist-hostinger directory...');
  fs.rmSync(distDir, { recursive: true, force: true });
}
fs.mkdirSync(distDir, { recursive: true });

// 2. Copy standalone files
console.log('📦 Copying standalone server files...');
fs.cpSync(standaloneDir, distDir, { recursive: true });

// 3. Copy .next/static to dist-hostinger/.next/static
const targetStatic = path.join(distDir, '.next', 'static');
if (fs.existsSync(staticDir)) {
  console.log('🎨 Copying .next/static to dist-hostinger/.next/static...');
  fs.mkdirSync(targetStatic, { recursive: true });
  fs.cpSync(staticDir, targetStatic, { recursive: true });
}

// 4. Copy public directory to dist-hostinger/public
const targetPublic = path.join(distDir, 'public');
if (fs.existsSync(publicDir)) {
  console.log('🖼️ Copying public directory...');
  fs.mkdirSync(targetPublic, { recursive: true });
  fs.cpSync(publicDir, targetPublic, { recursive: true });
}

// 5. Copy data directory (db.json)
const targetData = path.join(distDir, 'data');
if (fs.existsSync(dataDir)) {
  console.log('💾 Copying data directory...');
  fs.mkdirSync(targetData, { recursive: true });
  fs.cpSync(dataDir, targetData, { recursive: true });
}

// 6. Copy .env.production (or .env.local) as .env in dist
const prodEnvFile = path.join(projectRoot, '.env.production');
const targetEnv = path.join(distDir, '.env');
if (fs.existsSync(prodEnvFile)) {
  console.log('🔑 Copying .env.production to .env...');
  fs.copyFileSync(prodEnvFile, targetEnv);
} else if (fs.existsSync(envFile)) {
  console.log('🔑 Copying .env.local to .env...');
  fs.copyFileSync(envFile, targetEnv);
}

// 6.5. Copy .htaccess for Hostinger Apache/LiteSpeed routing & SSL
const htaccessSource = path.join(projectRoot, '.htaccess');
const htaccessTarget = path.join(distDir, '.htaccess');
if (fs.existsSync(htaccessSource)) {
  console.log('🌐 Copying .htaccess for Hostinger routing...');
  fs.copyFileSync(htaccessSource, htaccessTarget);
}

// 7. Verify / write a production package.json helper
const pkgJsonPath = path.join(distDir, 'package.json');
let pkg = {};
if (fs.existsSync(pkgJsonPath)) {
  pkg = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'));
}
pkg.scripts = {
  ...pkg.scripts,
  start: 'node server.js'
};
fs.writeFileSync(pkgJsonPath, JSON.stringify(pkg, null, 2));

console.log('✅ dist-hostinger directory prepared successfully!');

// 8. Create zip archive using PowerShell Compress-Archive
console.log('🗜️ Creating dist-hostinger.zip archive for easy Hostinger upload...');
try {
  if (fs.existsSync(zipFile)) {
    fs.unlinkSync(zipFile);
  }
  execSync(`powershell -Command "Compress-Archive -Path '${distDir}\\*' -DestinationPath '${zipFile}' -Force"`, {
    stdio: 'inherit'
  });
  console.log('🎉 ZIP file created successfully at:', zipFile);
} catch (err) {
  console.warn('⚠️ Could not automatically compress archive, but dist-hostinger folder is ready:', err.message);
}

console.log('🏁 Hostinger bundle is 100% READY!');
