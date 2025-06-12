document.addEventListener("DOMContentLoaded", () => {
  const storyId = getStoryIdFromURL();
  const stories = JSON.parse(localStorage.getItem("stories")) || [];

  const story = stories.find(s => s.id === parseInt(storyId));

  if (story) {
    displayStory(story);
    loadComments(storyId);
  } else {
    document.getElementById("story-content").innerHTML = "<p>Story not found.</p>";
  }

  document.getElementById("comment-form").addEventListener("submit", function (e) {
    e.preventDefault();
    const commentText = document.getElementById("comment").value.trim();
    if (commentText !== "") {
      addComment(storyId, commentText);
      document.getElementById("comment").value = "";
    }
  });
});

function getStoryIdFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

function displayStory(story) {
  const container = document.getElementById("story-content");
  container.innerHTML = `
    <h1>${story.title}</h1>
    <img src="${story.image}" alt="${story.title}" loading="lazy">
    <p><em>${story.date}</em></p>
    <p>${story.content}</p>
  `;
}

// --- Comment System using localStorage ---
function loadComments(storyId) {
  const comments = JSON.parse(localStorage.getItem(`comments-${storyId}`)) || [];
  const list = document.getElementById("comment-list");
  list.innerHTML = "";
  comments.forEach(comment => {
    const li = document.createElement("li");
    li.textContent = comment;
    list.appendChild(li);
  });
}

function addComment(storyId, text) {
  const key = `comments-${storyId}`;
  const comments = JSON.parse(localStorage.getItem(key)) || [];
  comments.push(text);
  localStorage.setItem(key, JSON.stringify(comments));
  loadComments(storyId);
}
