const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const roots = [
  path.join(root, "src"),
  path.join(root, "App.js"),
  path.join(root, "index.js"),
];

function collect(fileOrDir, out) {
  if (!fs.existsSync(fileOrDir)) {
    return;
  }
  const stat = fs.statSync(fileOrDir);
  if (stat.isDirectory()) {
    for (const name of fs.readdirSync(fileOrDir)) {
      collect(path.join(fileOrDir, name), out);
    }
    return;
  }
  if (/\.(js|jsx|ts|tsx)$/.test(fileOrDir)) {
    out.push(fileOrDir);
  }
}

const files = [];
for (const item of roots) {
  collect(item, files);
}

const importRegex = /from\s+['\"](\.{1,2}\/[^'\"]+)['\"]/g;
const missing = [];

for (const filePath of files) {
  const text = fs.readFileSync(filePath, "utf8");
  for (const match of text.matchAll(importRegex)) {
    const rel = match[1];
    const line = text.slice(0, match.index).split("\n").length;
    const base = path.dirname(filePath);
    const target = path.resolve(base, rel);
    const candidates = [
      target,
      `${target}.js`,
      `${target}.jsx`,
      `${target}.ts`,
      `${target}.tsx`,
      path.join(target, "index.js"),
      path.join(target, "index.jsx"),
      path.join(target, "index.ts"),
      path.join(target, "index.tsx"),
    ];

    const exists = candidates.some((candidatePath) =>
      fs.existsSync(candidatePath)
    );
    if (!exists) {
      missing.push({
        file: path.relative(root, filePath).replace(/\\/g, "/"),
        line,
        rel,
      });
    }
  }
}

if (missing.length === 0) {
  console.log("NO_MISSING_IMPORTS");
  process.exit(0);
}

missing
  .sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line)
  .forEach((entry) => {
    console.log(`${entry.file}:${entry.line} -> ${entry.rel}`);
  });

process.exit(1);
