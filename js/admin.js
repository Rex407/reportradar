// Load from localStorage
let personalStories = JSON.parse(localStorage.getItem('personalStories')) || [];
const AUTH_PASSWORDS = {
  'Editor-in-Chief': 'radar@6060',
  'Tech Reporter': 'tech@6060'
};
let currentRole = localStorage.getItem('currentRole') || null;
let editingIndex = null;

// Render article list with category filtering
function renderArticleList(filter = 'all') {
  const articleList = document.getElementById('article-list');
  if (articleList) {
    const filteredStories = filter === 'all' ? personalStories : personalStories.filter(story => story.category === filter);
    articleList.innerHTML = filteredStories.length ? filteredStories.map((story, index) => `
      <div class="article-item ${story.category.toLowerCase()}">
        <h3>${story.title}</h3>
        <p>By ${story.author} | <span class="category-label">${story.category}</span></p>
        <button onclick="editArticle(${index})">Edit</button>
        <button onclick="deleteArticle(${index})">Delete</button>
      </div>
    `).join('') : '<p>No articles in this category.</p>';
  }
}

// Handle authentication
function handleAuth(event) {
  event.preventDefault();
  const role = document.getElementById('admin-role').value;
  const password = document.getElementById('admin-password').value;

  if (AUTH_PASSWORDS[role] && AUTH_PASSWORDS[role] === password) {
    currentRole = role;
    localStorage.setItem('currentRole', currentRole);
    document.getElementById('auth-section').classList.add('hidden');
    document.getElementById('admin-content').classList.remove('hidden');
    renderArticleList();
  } else {
    document.getElementById('auth-message').innerHTML = 'Invalid role or password.';
  }
}

// Handle adding or editing an article
function handleArticleForm(event) {
  event.preventDefault();
  const title = document.getElementById('article-title').value;
  const author = document.getElementById('article-author').value;
  const description = document.getElementById('article-description').value;
  const image = document.getElementById('article-image').value;
  const url = document.getElementById('article-url').value;
  const category = document.getElementById('article-category').value;

  if (title && author && description && image && url) {
    const article = { title, author, description, urlToImage: image, url, category, publishedAt: new Date().toISOString() };
    if (editingIndex !== null) {
      personalStories[editingIndex] = article;
      document.getElementById('edit-article-btn').style.display = 'none';
      document.getElementById('add-article-btn').style.display = 'block';
      editingIndex = null;
    } else {
      personalStories.push(article);
    }
    localStorage.setItem('personalStories', JSON.stringify(personalStories));
    event.target.reset();
    renderArticleList(document.getElementById('category-filter').value);
  } else {
    alert('Please fill all fields.');
  }
}

// Edit article
window.editArticle = function(index) {
  const story = personalStories[index];
  document.getElementById('article-title').value = story.title;
  document.getElementById('article-author').value = story.author;
  document.getElementById('article-description').value = story.description;
  document.getElementById('article-image').value = story.urlToImage;
  document.getElementById('article-url').value = story.url;
  document.getElementById('article-category').value = story.category;
  editingIndex = index;
  document.getElementById('add-article-btn').style.display = 'none';
  document.getElementById('edit-article-btn').style.display = 'block';
};

// Delete article
window.deleteArticle = function(index) {
  if (confirm('Are you sure you want to delete this article?')) {
    personalStories.splice(index, 1);
    localStorage.setItem('personalStories', JSON.stringify(personalStories));
    renderArticleList(document.getElementById('category-filter').value);
  }
};

// Handle category filter change
function handleFilterChange() {
  const filter = document.getElementById('category-filter').value;
  renderArticleList(filter);
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
  if (currentRole) {
    document.getElementById('auth-section').classList.add('hidden');
    document.getElementById('admin-content').classList.remove('hidden');
    renderArticleList();
  }
  document.getElementById('auth-form')?.addEventListener('submit', handleAuth);
  document.getElementById('article-form')?.addEventListener('submit', handleArticleForm);
  document.getElementById('category-filter')?.addEventListener('change', handleFilterChange);
});