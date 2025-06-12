// Load theme from localStorage
const savedTheme = localStorage.getItem('theme') || 'light';
document.body.classList.add(savedTheme + '-mode');

// Toggle dark/light mode
document.querySelector('.mode-toggle').addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
  const theme = document.body.classList.contains('dark-mode') ? 'dark' : 'light';
  localStorage.setItem('theme', theme);
  document.querySelector('.mode-toggle').textContent = theme === 'dark' ? '☀️' : '🌙';
});

// Toggle mobile menu
document.querySelector('.hamburger').addEventListener('click', () => {
  const navMenu = document.querySelector('.nav-menu');
  const isActive = navMenu.classList.toggle('active');
  document.querySelector('.hamburger').setAttribute('aria-expanded', isActive);
});

// Fetch and display news
async function fetchNews(category = null) {
  const apiKey = '13b4ca5111e8454ba08fdb81d1bae245'; // Valid NewsAPI key
  const url = `https://newsapi.org/v2/top-headlines?country=us&category=${category || 'general'}&apiKey=${apiKey}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    if (!data.articles || data.articles.length === 0) {
      throw new Error('No articles found in response');
    }
    return data.articles.map(article => ({
      title: article.title || 'Untitled',
      description: article.description || 'No description available',
      url: article.url || '#',
      urlToImage: article.urlToImage || '../images/placeholder.webp',
      publishedAt: new Date(article.publishedAt).toLocaleDateString()
    })).slice(0, 6); // Limit to 6 articles
  } catch (error) {
    console.error('Error fetching news:', error.message);
    return [
      { 
        title: 'Sample News', 
        description: 'This is a sample article due to fetch failure.', 
        url: '#', 
        urlToImage: '../images/placeholder.webp', 
        publishedAt: '2025-06-12' // Updated to current month
      }
    ];
  }
}

// Render news
async function renderNews() {
  const container = document.getElementById('news-container');
  if (!container) return;

  const page = window.location.pathname.split('/').pop() || 'index.html';
  let category = null;
  if (page === 'world.html') category = 'general';
  else if (page === 'tech.html') category = 'technology';

  try {
    const news = await fetchNews(category);
    container.innerHTML = news.map(article => `
      <article class="news-card" role="article" aria-label="${article.title}">
        <img src="${article.urlToImage}" alt="${article.title} image" loading="lazy" type="image/webp">
        <h3>${article.title}</h3>
        <p>${article.description}</p>
        <p><small>Published: ${article.publishedAt}</small></p>
        <a href="${article.url}" target="_blank" rel="noopener noreferrer">Read more</a>
      </article>
    `).join('');
  } catch (error) {
    container.innerHTML = '<p class="error">Failed to load news. Please try again later.</p>';
    console.error('Rendering error:', error);
  }
}

// Handle newsletter subscription
document.getElementById('newsletter-form')?.addEventListener('submit', (e) => {
  e.preventDefault();
  const email = document.getElementById('email-sub').value.trim();
  const emailRegex = /^\S+@\S+\.\S+$/;
  if (emailRegex.test(email)) {
    const subscribers = JSON.parse(localStorage.getItem('subscribers')) || [];
    if (!subscribers.some(sub => sub.email === email)) {
      subscribers.push({ email, date: new Date().toISOString() });
      localStorage.setItem('subscribers', JSON.stringify(subscribers));
      document.getElementById('newsletter-message').textContent = 'Subscribed successfully!';
    } else {
      document.getElementById('newsletter-message').textContent = 'You are already subscribed.';
    }
    e.target.reset();
  } else {
    document.getElementById('newsletter-message').textContent = 'Please enter a valid email.';
  }
});

// Load news on page load
document.addEventListener('DOMContentLoaded', () => {
  renderNews();
  // Update weather time if needed (handled in HTML for now)
});