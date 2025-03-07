import { execSync } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import { argv, env } from 'process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const packageJsonPath = path.resolve(__dirname, '../package.json');
const indexTsPath = path.resolve(__dirname, '../src/index.ts');

const versionType = argv[2] || env.VERSION_TYPE;

if (!['major', 'minor', 'patch'].includes(versionType)) {
  console.error('Invalid version type. Use major, minor, or patch.');
  process.exit(1);
}

execSync(`pnpm version ${versionType} --no-git-tag-version`, { stdio: 'inherit' });

const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'));
const newVersion = packageJson.version;

// Read src/index.ts
let indexTsContent = await fs.readFile(indexTsPath, 'utf-8');

// Replace the version string in src/index.ts
indexTsContent = indexTsContent.replace(/version: '(\d+\.\d+\.\d+)'/, `version: '${newVersion}'`);

// Write the updated content back to src/index.ts
await fs.writeFile(indexTsPath, indexTsContent);

console.log(`Updated src/index.ts to version ${newVersion}`);
