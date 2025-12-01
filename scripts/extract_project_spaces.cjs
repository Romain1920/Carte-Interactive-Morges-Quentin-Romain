const fs = require('fs');
const path = require('path');
const srcPath = path.join(__dirname, '..', 'src', 'main.js');
const content = fs.readFileSync(srcPath, 'utf8');
const marker = 'const projectSpacesOverlay = ';
const startIdx = content.indexOf(marker);
if (startIdx === -1) {
  throw new Error('projectSpacesOverlay definition not found');
}
let idx = startIdx + marker.length;
let braceCount = 0;
let started = false;
for (; idx < content.length; idx++) {
  const ch = content[idx];
  if (ch === '{') {
    braceCount++;
    started = true;
  } else if (ch === '}') {
    braceCount--;
  }
  if (started && braceCount === 0) {
    idx++;
    break;
  }
}
const raw = content.slice(startIdx + marker.length, idx).trim();
const overlay = eval('(' + raw + ')');
const outPath = path.join(__dirname, 'project_spaces.geojson');
fs.writeFileSync(outPath, JSON.stringify(overlay));
console.log('Wrote', overlay.features?.length || 0, 'features to', outPath);
