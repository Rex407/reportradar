// Load comments from localStorage
let comments = JSON.parse(localStorage.getItem('comments')) || [];

// Add comment (simulated for contact form)
document.getElementById('contact-form')?.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const message = document.getElementById('message').value;

  if (name && email && message) {
    const newComment = { id: Date.now(), name, email, message, date: new Date().toISOString() };
    comments.push(newComment);
    localStorage.setItem('comments', JSON.stringify(comments));
    document.getElementById('contact-message').textContent = 'Message sent successfully!';
    e.target.reset();
  } else {
    document.getElementById('contact-message').textContent = 'Please fill all fields.';
  }
});

// Render comments on dashboard
function renderComments() {
  const commentsList = document.getElementById('comments-list');
  if (commentsList) {
    commentsList.innerHTML = comments.map(comment => `
      <div class="comment-card">
        <h3>${comment.name}</h3>
        <p><small>${new Date(comment.date).toLocaleDateString()}</small></p>
        <p>${comment.message}</p>
        <button onclick="deleteComment(${comment.id})">Delete</button>
      </div>
    `).join('');
  }
}

// Delete comment
window.deleteComment = (id) => {
  if (confirm('Are you sure you want to delete this comment?')) {
    comments = comments.filter(comment => comment.id !== id);
    localStorage.setItem('comments', JSON.stringify(comments));
    renderComments();
  }
};

// Load comments on dashboard
document.addEventListener('DOMContentLoaded', () => {
  if (window.location.pathname.includes('dashboard.html')) {
    renderComments();
  }
});