// Load news from localStorage
let newsArticles = JSON.parse(localStorage.getItem('newsArticles')) || [];

// Render news list
function renderNewsList() {
  const newsList = document.getElementById('news-list');
  if (newsList) {
    newsList.innerHTML = newsArticles.map(article => `
      <div class="news-card">
        <h3>${article.title}</h3>
        <p><small>Category: ${article.category}</small></p>
        <p>${article.description.substring(0, 50)}...</p>
        <button onclick="editNews(${newsArticles.indexOf(article)})">Edit</button>
        <button onclick="deleteNews(${newsArticles.indexOf(article)})">Delete</button>
      </div>
    `).join('');
  }
}

// Handle news form submission
document.getElementById('news-form')?.addEventListener('submit', (e) => {
  e.preventDefault();
  const title = document.getElementById('news-title').value;
  const category = document.getElementById('news-category').value;
  const description = document.getElementById('news-description').value;
  const image = document.getElementById('news-image').value;

  if (title && category && description && image) {
    const newArticle = { id: Date.now(), title, category, description, image, date: new Date().toISOString() };
    newsArticles.push(newArticle);
    localStorage.setItem('newsArticles', JSON.stringify(newArticles));
    document.getElementById('news-form').reset();
    renderNewsList();
  } else {
    alert('Please fill all fields.');
  }
});

// Edit news (simplified, add form population logic as needed)
window.editNews = (index) => {
  const article = newsArticles[index];
  document.getElementById('news-title').value = article.title;
  document.getElementById('news-category').value = article.category;
  document.getElementById('news-description').value = article.description;
  document.getElementById('news-image').value = article.image;

  newsArticles.splice(index, 1);
  localStorage.setItem('newsArticles', JSON.stringify(newsArticles));
  renderNewsList();
};

// Delete news
window.deleteNews = (index) => {
  if (confirm('Are you sure you want to delete this news?')) {
    newsArticles.splice(index, 1);
    localStorage.setItem('newsArticles', JSON.stringify(newsArticles));
    renderNewsList();
  }
};

// Load news on dashboard
document.addEventListener('DOMContentLoaded', () => {
  if (window.location.pathname.includes('dashboard.html')) {
    renderNewsList();
    renderComments(); // From comments.js
  }
});