#!/usr/bin/env node
/**
 * generate-configmap.mjs
 *
 * Turns a directory of JSON story/category files into a ready-to-apply
 * Kubernetes ConfigMap YAML.
 *
 * Usage:
 *   node scripts/generate-configmap.mjs <content-dir> [options]
 *
 * Options:
 *   --namespace <ns>   ConfigMap namespace (default: headlamp)
 *   --name <name>      ConfigMap name (default: ocp-learning-content)
 *   --out <file>       Write output to file instead of stdout
 *
 * Expected directory layout:
 *
 *   <content-dir>/
 *     categories/
 *       my-category.json      ← { id, title, description?, order }
 *     stories/
 *       01-first-story.json   ← { id, categoryId, title, description, order,
 *                                  xp, dependsOn?, guide, verification }
 *
 * guide shape:
 *   { "type": "url",      "url": "https://..." }
 *   { "type": "markdown", "content": "## Heading\n\nBody..." }
 *
 * verification shape (array):
 *   [{ "apiVersion": "...", "kind": "...", "name"?: "...",
 *      "conditions"?: [{ "type": "...", "status": "..." }],
 *      "fields"?:     [{ "path": ".spec.foo", "exists"?: true, "equals"?: "bar" }] }]
 */

import fs from 'fs';
import path from 'path';

// ── Argument parsing ──────────────────────────────────────────────────────────

const args = process.argv.slice(2);
if (!args.length || args[0] === '--help') {
  console.log('Usage: node scripts/generate-configmap.mjs <content-dir> [--namespace headlamp] [--name ocp-learning-content] [--out file.yaml]');
  process.exit(args[0] === '--help' ? 0 : 1);
}

const contentDir = path.resolve(args[0]);
let namespace = 'headlamp';
let cmName = 'ocp-learning-content';
let outFile = null;

for (let i = 1; i < args.length; i++) {
  if (args[i] === '--namespace' && args[i + 1]) { namespace = args[++i]; }
  else if (args[i] === '--name' && args[i + 1]) { cmName = args[++i]; }
  else if (args[i] === '--out' && args[i + 1]) { outFile = path.resolve(args[++i]); }
}

// ── File helpers ──────────────────────────────────────────────────────────────

function readJsonFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter(f => f.endsWith('.json'))
    .sort()
    .map(f => {
      const fullPath = path.join(dir, f);
      try {
        return JSON.parse(fs.readFileSync(fullPath, 'utf8'));
      } catch (err) {
        console.error(`Error parsing ${fullPath}: ${err.message}`);
        process.exit(1);
      }
    });
}

// ── Validation ────────────────────────────────────────────────────────────────

function validateCategory(cat, file) {
  for (const field of ['id', 'title', 'order']) {
    if (cat[field] === undefined) {
      console.error(`Category in ${file} is missing required field "${field}"`);
      process.exit(1);
    }
  }
}

function validateStory(story, file) {
  for (const field of ['id', 'categoryId', 'title', 'description', 'order', 'xp', 'guide', 'verification']) {
    if (story[field] === undefined) {
      console.error(`Story in ${file} is missing required field "${field}"`);
      process.exit(1);
    }
  }
  if (!['url', 'markdown'].includes(story.guide?.type)) {
    console.error(`Story "${story.id}" guide.type must be "url" or "markdown"`);
    process.exit(1);
  }
  if (story.guide.type === 'url' && !story.guide.url) {
    console.error(`Story "${story.id}" guide.type is "url" but guide.url is missing`);
    process.exit(1);
  }
  if (story.guide.type === 'markdown' && !story.guide.content) {
    console.error(`Story "${story.id}" guide.type is "markdown" but guide.content is missing`);
    process.exit(1);
  }
  if (!Array.isArray(story.verification)) {
    console.error(`Story "${story.id}" verification must be an array`);
    process.exit(1);
  }
}

// ── Load content ──────────────────────────────────────────────────────────────

const categoriesDir = path.join(contentDir, 'categories');
const storiesDir    = path.join(contentDir, 'stories');

if (!fs.existsSync(contentDir)) {
  console.error(`Content directory not found: ${contentDir}`);
  process.exit(1);
}

const categories = readJsonFiles(categoriesDir);
const stories    = readJsonFiles(storiesDir);

if (!categories.length && !stories.length) {
  console.error(`No JSON files found in ${categoriesDir} or ${storiesDir}`);
  process.exit(1);
}

categories.forEach((c, i) => validateCategory(c, `categories/${i}.json`));
stories.forEach((s, i) => validateStory(s, `stories/${i}.json`));

// ── Emit ConfigMap YAML ───────────────────────────────────────────────────────

function indentLines(str, spaces) {
  const pad = ' '.repeat(spaces);
  return str.split('\n').map(l => pad + l).join('\n');
}

const categoriesJson = JSON.stringify(categories, null, 2);
const storiesJson    = JSON.stringify(stories, null, 2);

const yaml = `apiVersion: v1
kind: ConfigMap
metadata:
  name: ${cmName}
  namespace: ${namespace}
data:
  categories: |
${indentLines(categoriesJson, 4)}
  stories: |
${indentLines(storiesJson, 4)}
`;

if (outFile) {
  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, yaml, 'utf8');
  console.log(`Wrote ConfigMap to ${outFile}`);
  console.log(`  ${categories.length} category/categories, ${stories.length} story/stories`);
} else {
  process.stdout.write(yaml);
}
