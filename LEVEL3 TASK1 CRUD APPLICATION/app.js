/* =========================================================
   Article Manager — Front-end CRUD Logic
   Fetches from /api/articles, renders list, handles create/update/delete
   ========================================================= */

const API_BASE = 'http://localhost:3001/api';
let articles = [];
let currentEditingId = null;

// ============ DOM Elements ============
const articlesContainer = document.getElementById('articles-container');
const messageContainer = document.getElementById('message-container');
const createBtn = document.getElementById('create-btn');
const articleModal = document.getElementById('article-modal');
const closeModalBtn = document.getElementById('close-modal-btn');
const articleForm = document.getElementById('article-form');
const modalTitle = document.getElementById('modal-title');

// ============ Load all articles ============
async function loadArticles() {
  try {
    articlesContainer.innerHTML = '<div class="loading">Loading articles...</div>';
    messageContainer.innerHTML = '';

    const response = await fetch(`${API_BASE}/articles`);
    if (!response.ok) throw new Error('Failed to load articles');

    articles = await response.json();
    renderArticles();
  } catch (error) {
    showError('Failed to load articles: ' + error.message);
    articlesContainer.innerHTML = '<div class="empty-state">⚠️ Could not load articles</div>';
  }
}

// ============ Render articles list ============
function renderArticles() {
  if (articles.length === 0) {
    articlesContainer.innerHTML = '<div class="empty-state">No articles yet. Click "New Article" to create one.</div>';
    return;
  }

  articlesContainer.innerHTML = articles
    .map(article => `
      <div class="article-card">
        <div class="article-content">
          <h3>${escapeHTML(article.title)}</h3>
          <p>${escapeHTML(article.excerpt)}</p>
          <div class="article-meta">
            By <strong>${escapeHTML(article.author)}</strong> · ${new Date(article.createdAt).toLocaleDateString()}
          </div>
        </div>
        <div class="article-actions">
          <button class="btn btn-secondary" onclick="openEditModal(${article.id})">Edit</button>
          <button class="btn btn-danger" onclick="deleteArticle(${article.id})">Delete</button>
        </div>
      </div>
    `)
    .join('');
}

// ============ Open create/edit modal ============
function openCreateModal() {
  currentEditingId = null;
  modalTitle.textContent = 'New Article';
  articleForm.reset();
  articleModal.classList.add('is-open');
  document.getElementById('title').focus();
}

function openEditModal(id) {
  const article = articles.find(a => a.id === id);
  if (!article) return;

  currentEditingId = id;
  modalTitle.textContent = 'Edit Article';

  document.getElementById('title').value = article.title;
  document.getElementById('author').value = article.author;
  document.getElementById('excerpt').value = article.excerpt;
  document.getElementById('content').value = article.content;

  articleModal.classList.add('is-open');
  document.getElementById('title').focus();
}

// ============ Close modal ============
function closeModal() {
  articleModal.classList.remove('is-open');
  articleForm.reset();
  currentEditingId = null;
}

// ============ Save article (create or update) ============
async function saveArticle(e) {
  e.preventDefault();

  const title = document.getElementById('title').value.trim();
  const author = document.getElementById('author').value.trim();
  const excerpt = document.getElementById('excerpt').value.trim();
  const content = document.getElementById('content').value.trim();

  if (!title || !author || !excerpt || !content) {
    showError('All fields are required');
    return;
  }

  const payload = { title, author, excerpt, content };

  try {
    let response;
    if (currentEditingId) {
      // Update
      response = await fetch(`${API_BASE}/articles/${currentEditingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!response.ok) throw new Error('Failed to update article');
      showSuccess('Article updated');
    } else {
      // Create
      response = await fetch(`${API_BASE}/articles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!response.ok) throw new Error('Failed to create article');
      showSuccess('Article created');
    }

    closeModal();
    await loadArticles();
  } catch (error) {
    showError(error.message);
  }
}

// ============ Delete article ============
async function deleteArticle(id) {
  if (!confirm('Delete this article? This cannot be undone.')) return;

  try {
    const response = await fetch(`${API_BASE}/articles/${id}`, { method: 'DELETE' });
    if (!response.ok) throw new Error('Failed to delete article');

    showSuccess('Article deleted');
    await loadArticles();
  } catch (error) {
    showError(error.message);
  }
}

// ============ Show/hide messages ============
function showError(message) {
  messageContainer.innerHTML = `<div class="error">${escapeHTML(message)}</div>`;
  setTimeout(() => { messageContainer.innerHTML = ''; }, 5000);
}

function showSuccess(message) {
  messageContainer.innerHTML = `<div class="success">✓ ${escapeHTML(message)}</div>`;
  setTimeout(() => { messageContainer.innerHTML = ''; }, 3000);
}

// ============ Escape HTML to prevent XSS ============
function escapeHTML(text) {
  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
  return text.replace(/[&<>"']/g, m => map[m]);
}

// ============ Event listeners ============
createBtn.addEventListener('click', openCreateModal);
closeModalBtn.addEventListener('click', closeModal);
articleForm.addEventListener('submit', saveArticle);

// Close modal on backdrop click
articleModal.addEventListener('click', (e) => {
  if (e.target === articleModal) closeModal();
});

// Close on Escape
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && articleModal.classList.contains('is-open')) closeModal();
});

// Load articles on page load
document.addEventListener('DOMContentLoaded', loadArticles);