const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'src', 'admin-portal');

const colorMap = {
  '#f8fafc': 'var(--bg-light)',
  '#fff': 'var(--bg-surface)',
  '#ffffff': 'var(--bg-surface)',
  '#e2e8f0': 'var(--border-color)',
  '#f1f5f9': 'var(--bg-light)',
  '#0f172a': 'var(--text-dark)',
  '#1e293b': 'var(--text-dark)',
  '#334155': 'var(--text-dark)',
  '#475569': 'var(--text-body)',
  '#64748b': 'var(--text-body)',
  '#94a3b8': 'var(--text-light)',
  '#cbd5e1': 'var(--border-color-dark)',
  '#0492c2': 'var(--primary)',
  '#037ca5': 'var(--primary-dark)'
};

function processDirectory(directory) {
  const files = fs.readdirSync(directory);
  for (const file of files) {
    const fullPath = path.join(directory, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.css')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let changed = false;
      
      for (const [hex, cssVar] of Object.entries(colorMap)) {
        // case-insensitive replace of hex codes, avoiding replacing inside other words (though hex codes are usually distinct)
        const regex = new RegExp(hex + '\\b', 'ig');
        if (regex.test(content)) {
          content = content.replace(regex, cssVar);
          changed = true;
        }
      }
      
      if (changed) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated: ${fullPath}`);
      }
    }
  }
}

processDirectory(dir);
console.log('Done.');
