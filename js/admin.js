const form = document.getElementById('story-form');
const adminList = document.getElementById('admin-story-list');

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const title = document.getElementById('title').value;
  const content = document.getElementById('content').value;

  const stories = JSON.parse(localStorage.getItem('stories')) || [];
  stories.push({ title, content });
  localStorage.setItem('stories', JSON.stringify(stories));
  form.reset();
  renderStories();
});

function renderStories() {
  const stories = JSON.parse(localStorage.getItem('stories')) || [];
  adminList.innerHTML = stories.map((story, index) =>
    `<div>
      <h3>${story.title}</h3>
      <p>${story.content}</p>
      <button onclick="deleteStory(${index})">Delete</button>
    </div>`
  ).join('');
}

function deleteStory(index) {
  const stories = JSON.parse(localStorage.getItem('stories')) || [];
  stories.splice(index, 1);
  localStorage.setItem('stories', JSON.stringify(stories));
  renderStories();
}

renderStories();
