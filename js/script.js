// Sample articles with images
const articles = [
  {
    id: 1,
    title: 'Global Summit 2025 Announced',
    category: 'World',
    author: 'Jane Doe',
    date: '2025-06-10',
    content: 'World leaders will meet in Paris to discuss climate action and global cooperation.',
    image: 'images/featured1.jpg'
  },
  {
    id: 2,
    title: 'AI Breakthroughs in 2025',
    category: 'Tech',
    author: 'John Smith',
    date: '2025-06-09',
    content: 'New AI models are transforming industries from healthcare to finance.',
    image: 'images/featured2.jpg'
  },
  {
    id: 3,
    title: 'Peace Talks Progress',
    category: 'World',
    author: 'Jane Doe',
    date: '2025-06-08',
    content: 'Negotiations in the Middle East show promising signs.',
    image: 'images/featured3.jpg'
  }
];

// Load from localStorage
const submissions = JSON.parse(localStorage.getItem('submissions')) || [];
const subscribers = JSON.parse(localStorage.getItem('subscribers')) || [];
let personalStories = JSON.parse(localStorage.getItem('personalStories')) || [];
const AUTH_PASSWORD = 'radar@6060'; // Shared password
let isAuthenticated = localStorage.getItem('isAuthenticated') === 'true'; // Check authentication status

// Toggle sidebar and switch buttons
function toggleNav() {
  const sidebar = document.querySelector('.sidebar');
  const hamburger = document.querySelector('.hamburger');
  const searchToggle = document.querySelector('.search-toggle');
  const closeBtn = document.querySelector('.close-btn');
  const isActive = sidebar.classList.toggle('active');

  hamburger.style.display = isActive ? 'none' : 'inline';
  searchToggle.style.display = isActive ? 'none' : 'inline';
  closeBtn.classList.toggle('active', isActive);
  hamburger.setAttribute('aria-expanded', isActive);
  searchToggle.setAttribute('aria-expanded', isActive);
}

// Contact form submission
function handleFormSubmit(event) {
  event.preventDefault();
  const type = document.querySelector('#submission-type')?.value;
  const name = document.querySelector('#name')?.value;
  const email = document.querySelector('#email')?.value;
  const message = document.querySelector('#message')?.value;

  if (type && name && email && message) {
    const submission = { type, name, email, message, date: new Date().toISOString() };
    submissions.push(submission);
    localStorage.setItem('submissions', JSON.stringify(submissions));
    const typeText = type === 'feedback' ? 'Feedback' : type === 'news-tip' ? 'News Tip' : 'Article Submission';
    document.querySelector('#form-message').innerHTML = `Thank you, ${name}! Your ${typeText} has been received.`;
    event.target.reset();
  } else {
    alert('Please fill all fields.');
  }
}

// Newsletter subscription
function handleNewsletterSubmit(event) {
  event.preventDefault();
  const email = document.querySelector('#email-sub')?.value;

  if (email) {
    const subscriber = { email, date: new Date().toISOString() };
    subscribers.push(subscriber);
    localStorage.setItem('subscribers', JSON.stringify(subscribers));
    document.querySelector('#newsletter-message').innerHTML = `Subscribed: ${email}`;
    event.target.reset();
  } else {
    alert('Please enter an email.');
  }
}

// Search functionality
function searchArticles(query) {
  const results = articles.filter(article =>
    article.title.toLowerCase().includes(query.toLowerCase()) ||
    article.content.toLowerCase().includes(query.toLowerCase())
  );
  const output = document.querySelector('#search-results');
  if (output) {
    output.innerHTML = results.length ? results.map(article => `
      <article class="article-card">
        <img src="${article.image}" alt="${article.title} image">
        <h2>${article.title}</h2>
        <p>By ${article.author} on ${article.date}</p>
        <p>${article.content.substring(0, 100)}...</p>
      </article>
    `).join('') : '<p>No results found.</p>';
  }
}

// Render articles
function renderArticles(category = null) {
  const articleContainer = document.querySelector('#articles');
  if (articleContainer) {
    const filteredArticles = category ? articles.filter(article => article.category === category) : articles;
    articleContainer.innerHTML = filteredArticles.map(article => `
      <article class="article-card">
        <img src="${article.image}" alt="${article.title} image" loading="lazy">
        <h2>${article.title}</h2>
        <p>By ${article.author} on ${article.date}</p>
        <p>${article.content.substring(0, 100)}...</p>
        <div class="share-buttons">
          <a href="https://twitter.com/intent/tweet?url=https://reportradar.com&text=${article.title}" target="_blank" rel="noopener">Twitter</a>
          <a href="https://www.facebook.com/sharer/sharer.php?u=https://reportradar.com" target="_blank" rel="noopener">Facebook</a>
        </div>
        <form class="comment-form" data-article-id="${article.id}">
          <div class="form-group">
            <label for="comment-name-${article.id}">Name:</label>
            <input type="text" id="comment-name-${article.id}" required aria-required="true">
          </div>
          <div class="form-group">
            <label for="comment-${article.id}">Comment:</label>
            <textarea id="comment-${article.id}" required aria-required="true"></textarea>
          </div>
          <button type="submit">Post Comment</button>
        </form>
        <div class="comments" data-article-id="${article.id}"></div>
      </article>
    `).join('');

    // Attach comment form listeners
    document.querySelectorAll('.comment-form').forEach(form => {
      form.addEventListener('submit', handleCommentSubmit);
    });

    // Render existing comments
    filteredArticles.forEach(article => {
      const comments = JSON.parse(localStorage.getItem(`comments-${article.id}`)) || [];
      const commentDiv = document.querySelector(`.comments[data-article-id="${article.id}"]`);
      if (commentDiv) {
        commentDiv.innerHTML = comments.map(comment => `
          <p><strong>${comment.name}</strong>: ${comment.text} <small>${new Date(comment.date).toLocaleDateString()}</small></p>
        `).join('');
      }
    });
  }
}

// Fetch and render Edge-like stories using NewsAPI
async function fetchEdgeStories() {
  const apiKey = 'YOUR_API_KEY'; // Replace with your NewsAPI key
  const url = `https://newsapi.org/v2/top-headlines?country=us&apiKey=${apiKey}`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch stories');
    const data = await response.json();
    const apiStories = data.articles.slice(0, 5);

    // Combine with personal stories
    const allStories = [...personalStories, ...apiStories].slice(0, 10); // Limit to 10 total

    const container = document.querySelector('#edge-stories-container');
    if (container) {
      container.innerHTML = allStories.length ? allStories.map((story, index) => {
        const isPersonal = personalStories.some(ps => ps.title === story.title && ps.author === story.author);
        const storyId = isPersonal ? personalStories.findIndex(ps => ps.title === story.title && ps.author === ps.author) : -1;
        return `
          <article class="article-card" data-story-id="${isPersonal ? storyId : -1}">
            <img src="${story.urlToImage || 'https://via.placeholder.com/300x200'}" alt="${story.title} image" loading="lazy">
            <h2>${story.title}</h2>
            <p>By ${story.author || 'Unknown'} on ${new Date(story.publishedAt || Date.now()).toLocaleDateString()}</p>
            <p>${story.description?.substring(0, 100) || 'No description'}...</p>
            <a href="${story.url || '#'}" target="_blank" rel="noopener">Read more</a>
            ${isPersonal && isAuthenticated ? `
              <div class="story-actions">
                <button class="edit-story" data-story-id="${storyId}">Edit</button>
                <button class="delete-story" data-story-id="${storyId}">Delete</button>
              </div>` : ''}
          </article>
        `;
      }).join('') : '<p>No stories found.</p>';

      // Attach event listeners for edit/delete
      document.querySelectorAll('.edit-story').forEach(button => {
        button.addEventListener('click', handleEditStory);
      });
      document.querySelectorAll('.delete-story').forEach(button => {
        button.addEventListener('click', handleDeleteStory);
      });
    }
  } catch (error) {
    console.error('Error fetching stories:', error);
    const container = document.querySelector('#edge-stories-container');
    if (container) container.innerHTML = '<p>Failed to load stories.</p>';
  }
}

// Handle adding a personal story
function handleAddStory(event) {
  event.preventDefault();
  const title = document.querySelector('#story-title').value;
  const author = document.querySelector('#story-author').value;
  const description = document.querySelector('#story-description').value;
  const image = document.querySelector('#story-image').value;
  const url = document.querySelector('#story-url').value;

  if (title && author && description && image && url) {
    const newStory = {
      title,
      author,
      description,
      urlToImage: image,
      url,
      publishedAt: new Date().toISOString()
    };
    personalStories.push(newStory);
    localStorage.setItem('personalStories', JSON.stringify(personalStories));
    document.querySelector('#add-story-message').innerHTML = 'Story added successfully!';
    event.target.reset();
    fetchEdgeStories();
  } else {
    alert('Please fill all fields.');
  }
}

// Handle editing a story
function handleEditStory(event) {
  const storyId = parseInt(event.target.dataset.storyId);
  const story = personalStories[storyId];
  if (story) {
    const newTitle = prompt('Edit Title:', story.title);
    const newAuthor = prompt('Edit Author:', story.author);
    const newDescription = prompt('Edit Description:', story.description);
    const newImage = prompt('Edit Image URL:', story.urlToImage);
    const newUrl = prompt('Edit Link:', story.url);

    if (newTitle && newAuthor && newDescription && newImage && newUrl) {
      personalStories[storyId] = {
        ...story,
        title: newTitle,
        author: newAuthor,
        description: newDescription,
        urlToImage: newImage,
        url: newUrl
      };
      localStorage.setItem('personalStories', JSON.stringify(personalStories));
      fetchEdgeStories();
    }
  }
}

// Handle deleting a story
function handleDeleteStory(event) {
  const storyId = parseInt(event.target.dataset.storyId);
  if (confirm('Are you sure you want to delete this story?')) {
    personalStories.splice(storyId, 1);
    localStorage.setItem('personalStories', JSON.stringify(personalStories));
    fetchEdgeStories();
  }
}

// Comment submission
function handleCommentSubmit(event) {
  event.preventDefault();
  const articleId = event.target.dataset.articleId;
  const name = event.target.querySelector('input[type="text"]').value;
  const comment = event.target.querySelector('textarea').value;

  if (name && comment) {
    const comments = JSON.parse(localStorage.getItem(`comments-${articleId}`)) || [];
    comments.push({ name, text: comment, date: new Date().toISOString() });
    localStorage.setItem(`comments-${articleId}`, JSON.stringify(comments));
    const commentDiv = document.querySelector(`.comments[data-article-id="${articleId}"]`);
    commentDiv.innerHTML += `<p><strong>${name}</strong>: ${comment} <small>${new Date(comment.date).toLocaleDateString()}</small></p>`;
    event.target.reset();
  } else {
    alert('Please enter your name and comment.');
  }
}

// Handle Add Story button click
function handleAddStoryButton() {
  if (!isAuthenticated) {
    const password = prompt('Enter the password to add a story:');
    if (password === AUTH_PASSWORD) {
      isAuthenticated = true;
      localStorage.setItem('isAuthenticated', 'true');
      document.getElementById('add-story-section').classList.remove('hidden');
      document.getElementById('add-story-button').style.display = 'none'; // Hide button after auth
      fetchEdgeStories();
    } else {
      alert('Incorrect password. Access denied.');
    }
  }
}

// Event listeners
document.querySelector('.hamburger')?.addEventListener('click', toggleNav);
document.querySelector('.search-toggle')?.addEventListener('click', toggleNav);
document.querySelector('.close-btn')?.addEventListener('click', toggleNav);
document.querySelector('#contact-form')?.addEventListener('submit', handleFormSubmit);
document.querySelector('#newsletter-form')?.addEventListener('submit', handleNewsletterSubmit);
document.querySelector('#search-bar')?.addEventListener('input', (e) => searchArticles(e.target.value));
document.querySelector('#add-story-form')?.addEventListener('submit', handleAddStory);
document.querySelector('#add-story-button')?.addEventListener('click', handleAddStoryButton);

// Render content on page load
document.addEventListener('DOMContentLoaded', () => {
  const page = window.location.pathname.split('/').pop() || 'index.html';
  if (page === 'world.html') renderArticles('World');
  else if (page === 'tech.html') renderArticles('Tech');
  else if (page === 'index.html') {
    renderArticles();
    fetchEdgeStories();
    if (isAuthenticated) {
      document.getElementById('add-story-section').classList.remove('hidden');
      document.getElementById('add-story-button').style.display = 'none';
    }
  }
});