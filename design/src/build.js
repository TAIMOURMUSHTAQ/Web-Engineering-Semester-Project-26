// Builds design/figma-plugin/ from design/src/  (run: node design/src/build.js)
const fs = require('fs');
const path = require('path');

const src = __dirname;
const out = path.join(src, '..', 'figma-plugin');
fs.mkdirSync(out, { recursive: true });

const erd = fs.readFileSync(path.join(src, 'erd-data.js'), 'utf8')
  .replace(/if \(typeof module[^\n]*\n?/, '');
const plugin = fs.readFileSync(path.join(src, 'plugin.js'), 'utf8');

fs.writeFileSync(path.join(out, 'code.js'), erd + '\n' + plugin);
fs.copyFileSync(path.join(src, 'manifest.json'), path.join(out, 'manifest.json'));
fs.copyFileSync(path.join(src, 'ui.html'), path.join(out, 'ui.html'));
fs.copyFileSync(path.join(src, 'HOW-TO-RUN.txt'), path.join(out, 'HOW-TO-RUN.txt'));

// Zip for distribution: OrderHub-Figma-Plugin.zip/OrderHub-Figma-Plugin/*
const { execFileSync } = require('child_process');
const zip = path.join(src, '..', 'OrderHub-Figma-Plugin.zip');
if (fs.existsSync(zip)) fs.unlinkSync(zip);
execFileSync('python', ['-c', 'import zipfile,os,sys; z=zipfile.ZipFile(sys.argv[1],"w",zipfile.ZIP_DEFLATED); [z.write(os.path.join(sys.argv[2],f),"OrderHub-Figma-Plugin/"+f) for f in ["manifest.json","code.js","ui.html","HOW-TO-RUN.txt"]]; z.close()', zip, out]);
console.log('Zipped', zip);
console.log('Built', out);
