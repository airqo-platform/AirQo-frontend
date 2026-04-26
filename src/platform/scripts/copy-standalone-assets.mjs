import fs from 'node:fs';
import path from 'node:path';

const projectRoot = process.cwd();
const standaloneRoot = path.join(projectRoot, '.next', 'standalone');
const publicSource = path.join(projectRoot, 'public');
const publicTarget = path.join(standaloneRoot, 'public');
const staticSource = path.join(projectRoot, '.next', 'static');
const staticTarget = path.join(standaloneRoot, '.next', 'static');

const copyDirectory = (source, target) => {
  if (!fs.existsSync(source)) {
    return false;
  }

  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.rmSync(target, { recursive: true, force: true });
  fs.cpSync(source, target, { recursive: true });
  return true;
};

if (!fs.existsSync(standaloneRoot)) {
  throw new Error(
    `Standalone output not found at ${standaloneRoot}. Run \"yarn build\" first.`
  );
}

copyDirectory(publicSource, publicTarget);
copyDirectory(staticSource, staticTarget);
