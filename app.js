const express = require('express');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// ── Middleware ────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// ── View engine ───────────────────────────────────────
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// ── Routes ────────────────────────────────────────────

// Landing page
app.get('/', (req, res) => {
  res.render('index', {
    title: 'AI Productivity Tools — 10 AI-Powered Developer Tools',
    features: [
      { icon: '🤖', title: 'Explain Code', desc: 'AI-powered code analysis with language stats, function counts, and import detection.' },
      { icon: '📝', title: 'Commit Messages', desc: 'Smart git commit messages with conventional commits and emoji support.' },
      { icon: '📊', title: 'Summarize File', desc: 'LOC breakdown, health indicators, and structural overview of any file.' },
      { icon: '🔍', title: 'Unused Imports', desc: 'Scans for dead imports across TS, JS, Python, Java, PHP with one-click cleanup.' },
      { icon: '✅', title: 'Code Review', desc: 'Static analysis — finds console.logs, TODOs, deep nesting, empty catch blocks.' },
      { icon: '📜', title: 'Git Blame', desc: 'Line-by-line blame with author stats, percentages, and commit history.' },
      { icon: '✏️', title: 'Quick Refactor', desc: 'Reference count preview and one-click smart rename for symbols.' },
      { icon: '📖', title: 'Browse Docs', desc: 'Built-in documentation panel — no internet needed.' },
      { icon: '📈', title: 'Dashboard', desc: 'Live session timer and file stats in the status bar.' },
      { icon: '🌐', title: 'Bwat Web', desc: 'Full AI chat panel with all commands accessible from one place.' },
    ],
    shortcuts: [
      { keys: 'Ctrl+Shift+E / Cmd+Shift+E', cmd: 'Explain Code' },
      { keys: 'Ctrl+Shift+G / Cmd+Shift+G', cmd: 'Commit Message' },
      { keys: 'Ctrl+Shift+W / Cmd+Shift+W', cmd: 'Open Bwat Web' },
      { keys: 'Ctrl+Shift+I / Cmd+Shift+I', cmd: 'Summarize File' },
      { keys: 'Ctrl+Shift+U / Cmd+Shift+U', cmd: 'Unused Imports' },
      { keys: 'Ctrl+Shift+R / Cmd+Shift+R', cmd: 'Code Review' },
      { keys: 'Ctrl+Shift+H / Cmd+Shift+H', cmd: 'Git Blame' },
      { keys: 'Ctrl+Shift+D / Cmd+Shift+D', cmd: 'Quick Refactor' },
      { keys: 'Ctrl+Shift+P / Cmd+Shift+P', cmd: 'Dashboard' },
    ],
  });
});

// AI Chat page
app.get('/ai-chat', (req, res) => {
  res.render('ai-chat', { title: 'Bwat AI — AI Coding Assistant' });
});

// Download page
app.get('/download', (req, res) => {
  res.render('download', { title: 'Download AI Productivity Tools' });
});

// Docs page
app.get('/docs', (req, res) => {
  res.render('docs', { title: 'AI Productivity Tools — Documentation' });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', version: '0.2.0', uptime: process.uptime() });
});

// 404
app.use((req, res) => {
  res.status(404).render('index', { title: 'Page Not Found', features: [], shortcuts: [] });
});

// ── Start ────────────────────────────────────────────
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`AI Productivity Tools web app running at http://localhost:${PORT}`);
  });
}

module.exports = app;
