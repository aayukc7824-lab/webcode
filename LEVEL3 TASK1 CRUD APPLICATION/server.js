/* =========================================================
   Article CRUD API — Express server
   Endpoints: GET /articles, POST /articles, PUT /articles/:id, DELETE /articles/:id
   Data persisted to data.json file
   ========================================================= */

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3001;
const DATA_FILE = path.join(__dirname, 'data.json');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// ============ Helper: Read articles from file ============
function readArticles() {
  try {
    const data = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
}

// ============ Helper: Write articles to file ============
function writeArticles(articles) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(articles, null, 2));
}

// ============ GET /articles — List all articles ============
app.get('/api/articles', (req, res) => {
  const articles = readArticles();
  res.json(articles);
});

// ============ GET /articles/:id — Get single article ============
app.get('/api/articles/:id', (req, res) => {
  const articles = readArticles();
  const article = articles.find(a => a.id === parseInt(req.params.id));

  if (!article) {
    return res.status(404).json({ error: 'Article not found' });
  }

  res.json(article);
});

// ============ POST /articles — Create new article ============
app.post('/api/articles', (req, res) => {
  const { title, excerpt, content, author } = req.body;

  // Validation
  if (!title || !excerpt || !content || !author) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const articles = readArticles();
  const newArticle = {
    id: articles.length > 0 ? Math.max(...articles.map(a => a.id)) + 1 : 1,
    title,
    excerpt,
    content,
    author,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  articles.push(newArticle);
  writeArticles(articles);

  res.status(201).json(newArticle);
});

// ============ PUT /articles/:id — Update article ============
app.put('/api/articles/:id', (req, res) => {
  const { title, excerpt, content, author } = req.body;
  const articles = readArticles();
  const index = articles.findIndex(a => a.id === parseInt(req.params.id));

  if (index === -1) {
    return res.status(404).json({ error: 'Article not found' });
  }

  const updatedArticle = {
    ...articles[index],
    title: title || articles[index].title,
    excerpt: excerpt || articles[index].excerpt,
    content: content || articles[index].content,
    author: author || articles[index].author,
    updatedAt: new Date().toISOString()
  };

  articles[index] = updatedArticle;
  writeArticles(articles);

  res.json(updatedArticle);
});

// ============ DELETE /articles/:id — Delete article ============
app.delete('/api/articles/:id', (req, res) => {
  const articles = readArticles();
  const index = articles.findIndex(a => a.id === parseInt(req.params.id));

  if (index === -1) {
    return res.status(404).json({ error: 'Article not found' });
  }

  const deletedArticle = articles[index];
  articles.splice(index, 1);
  writeArticles(articles);

  res.json({ message: 'Article deleted', article: deletedArticle });
});

// ============ Serve front-end ============
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// ============ Start server ============
app.listen(PORT, () => {
  console.log(`🚀 API server running at http://localhost:${PORT}`);
  console.log(`📝 Try GET http://localhost:${PORT}/api/articles`);
});