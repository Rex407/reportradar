// Initialize stories and update header on page load
window.addEventListener('load', () => {
    try {
        let stories;
        fetch('https://raw.githubusercontent.com/Rex407/reportradar/main/data/stories.json')
            .then(response => response.json())
            .then(data => {
                stories = data || [];
                if (!Array.isArray(stories)) {
                    console.warn('No valid stories found, resetting.');
                    stories = [];
                }
                console.log('Loaded stories from GitHub:', stories);
                stories.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
                displayStories(stories);
                if (window.location.pathname.includes('admin.html')) {
                    displayAdminStories();
                }
            }).catch(error => {
                console.error('Error fetching stories from GitHub:', error);
                // Fallback to localStorage
                stories = JSON.parse(localStorage.getItem('stories')) || [];
                if (!stories || !Array.isArray(stories)) {
                    console.warn('No valid stories in localStorage, resetting.');
                    stories = [];
                }
                displayStories(stories);
                if (window.location.pathname.includes('admin.html')) {
                    displayAdminStories();
                }
            });
    } catch (error) {
        console.error('Error initializing stories:', error);
        displayErrorMessage();
    }
});

// Handle story form submission
const storyForm = document.getElementById('storyForm');
if (storyForm) {
    storyForm.addEventListener('submit', event => {
        event.preventDefault();

        const adminName = document.getElementById('adminName').value.trim();
        const titleInput = document.getElementById('storyTitle');
        const contentInput = document.getElementById('storyContent');
        const imageURLInput = document.getElementById('storyImageURL');
        const fileInput = document.getElementById('storyImageFile');
        const isLive = document.getElementById('isLive').checked;

        const title = titleInput.value.trim();
        const content = contentInput.value.trim();
        const imageURL = imageURLInput.value.trim();

        if (!title || !content || !adminName) {
            alert('Title, content, and admin name are required.');
            return;
        }

        if (fileInput.files.length > 0) {
            const file = fileInput.files[0];
            if (!file.type.startsWith('image/')) {
                alert('Please upload a valid image.');
                return;
            }
            const reader = new FileReader();
            reader.onload = () => saveStory(title, content, reader.result, isLive, adminName);
            reader.onerror = () => alert('Error reading image.');
            reader.readAsDataURL(file);
        } else if (imageURL) {
            const img = new Image();
            img.onload = () => saveStory(title, content, imageURL, isLive, adminName);
            img.onerror = () => alert('Invalid image URL.');
            img.src = imageURL;
        } else {
            alert('Provide an image file or URL.');
            return;
        }
    });
}

// Save story to GitHub
function saveStory(title, content, image, isLive, adminName) {
    try {
        // Fetch current stories from GitHub
        let stories = [];
        fetch('https://raw.githubusercontent.com/Rex407/reportradar-w06/main/data/stories.json')
            .then(response => response.json())
            .then(data => {
                stories = data || [];
                if (!Array.isArray(stories)) stories = [];
            }).catch(() => {
                console.warn('Failed to fetch stories, using empty array.');
            });

        const story = {
            id: Date.now(),
            title,
            content,
            image,
            timestamp: new Date().toISOString(),
            comments: [],
            isLive,
            adminName
        };
        stories.push(story);

        // Save to localStorage as a temporary cache
        localStorage.setItem('stories', JSON.stringify(stories));
        console.log('Story saved locally:', story);
        alert('Story posted successfully!');

        // Push to GitHub (requires PAT)
        const token = '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'; // Replace with your PAT
        const repo = 'https://github.com/Rex407/reportradar.git'; // Replace with your repo
        const path = 'data/stories.json';
        fetch(`https://api.github.com/repos/${repo}/contents/${path}`, {
            method: 'GET',
            headers: { Authorization: `token ${token}` }
        }).then(response => response.json()).then(data => {
            fetch(`https://api.github.com/repos/${repo}/contents/${path}`, {
                method: 'PUT',
                headers: {
                    Authorization: `token ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: `Add story ${story.id}`,
                    content: btoa(JSON.stringify(stories, null, 2)), // Base64 encode
                    sha: data.sha // Use the current SHA from GET
                })
            }).then(response => response.json()).then(() => {
                console.log('Story pushed to GitHub:', story);
            }).catch(error => console.error('GitHub push failed:', error));
        }).catch(error => console.error('Failed to get SHA:', error));

        if (typeof storyForm !== 'undefined' && storyForm) {
            storyForm.reset();
        }
        if (window.location.pathname.includes('admin.html')) {
            displayAdminStories();
        } else {
            displayStories(stories);
        }
    } catch (error) {
        console.error('Error saving story:', error);
        alert('Failed to save story. Check console for details.');
        if (error.name === 'QuotaExceededError') {
            console.warn('Local Storage quota exceeded, resetting.');
            localStorage.clear();
        }
    }
}
// Display stories on home page
function displayStories(stories) {
    const newsContainer = document.getElementById('newsContainer');
    if (!newsContainer) {
        console.error('newsContainer element not found.');
        return; // Exit function if element is not found
    }

    newsContainer.innerHTML = '';
    const liveStory = stories.find(s => s.isLive);
    const otherStories = stories.filter(s => !s.isLive);

    if (liveStory) {
        newsContainer.appendChild(createStoryElement(liveStory));
    } else if (stories.length > 0) {
        newsContainer.appendChild(createStoryElement(stories[0]));
    } else {
        newsContainer.innerHTML = '<p>No stories yet. Check back later!</p>';
        return;
    }

    const relatedStories = document.createElement('div');
    relatedStories.classList.add('related-stories');
    otherStories.forEach(story => relatedStories.appendChild(createStoryElement(story)));
    if (otherStories.length > 0) {
        newsContainer.appendChild(relatedStories);
    }
}

// Create story element for home page
function createStoryElement(story) {
    const isMain = story.isLive || (story === (JSON.parse(localStorage.getItem('stories')) || [])[0]);
    const div = document.createElement('div');
    div.classList.add(isMain ? 'main-story' : 'related-story');
    div.dataset.id = story.id;

    div.innerHTML = `
        <div class="${isMain ? 'main-story-text' : ''}">
            ${story.isLive ? '<span class="live-badge">LIVE</span>' : ''}
            <h${isMain ? '2' : '3'}>${story.title}</h${isMain ? '2' : '3'}>
            <div class="meta">By ${story.adminName} | Posted ${new Date(story.timestamp).toLocaleDateString()} | ${getDuration(story.timestamp)}</div>
            <p>${story.content.substring(0, isMain ? 100 : 50)}${story.content.split(' ').length > 20 ? '...' : ''}</p>
            <div class="story-actions">
                <button class="share-btn" aria-label="Share ${story.title}">Share</button>
            </div>
            <div class="comments">
                <textarea placeholder="Leave a comment..." class="commentInput" aria-label="Comment input"></textarea>
                <button class="commentBtn">Post Comment</button>
                <ul class="commentList" aria-label="Comments for ${story.title}"></ul>
            </div>
        </div>
        ${isMain ? '<div class="main-story-img">' : ''}
        <img src="${story.image}" alt="${story.title}" class="thumbnail" loading="lazy" onerror="this.src='images/placeholder.jpg';">
        ${isMain ? '</div>' : ''}
    `;

    const thumbnail = div.querySelector('.thumbnail');
    if (story.content.split(' ').length > 20) {
        thumbnail.addEventListener('click', () => openFullStoryModal(story));
    }
    div.querySelector('.share-btn').addEventListener('click', () => shareStory(story));
    div.querySelector('.commentBtn').addEventListener('click', () => addComment(div, story.id));
    loadComments(div, story.comments);
    return div;
}

// Display stories on admin page
function displayAdminStories() {
    const storyList = document.getElementById('storyList');
    if (!storyList) {
        console.error('storyList element not found.');
        return;
    }

    storyList.innerHTML = '';
    const stories = JSON.parse(localStorage.getItem('stories')) || [];
    if (stories.length === 0) {
        storyList.innerHTML = '<p>No stories to manage.</p>';
        return;
    }

    stories.forEach(story => {
        const div = document.createElement('div');
        div.classList.add('admin-story');
        div.dataset.id = story.id;

        div.innerHTML = `
            <img src="${story.image}" alt="${story.title}" loading="lazy" onerror="this.src='images/placeholder.jpg';">
            <h3>${story.title}</h3>
            <div class="meta">By ${story.adminName} | Posted ${new Date(story.timestamp).toLocaleDateString()} | ${getDuration(story.timestamp)}</div>
            <p>${(story.content || '').substring(0, 50)}${(story.content || '').length > 50 ? '...' : ''}</p>
            <button class="delete-btn" aria-label="Delete ${story.title}">Delete</button>
        `;

        div.querySelector('.delete-btn').addEventListener('click', () => deleteStory(story.id, div));
        storyList.appendChild(div);
    });
}

// Get duration since posting
function getDuration(timestamp) {
    const now = new Date();
    const posted = new Date(timestamp);
    const diffMs = now - posted;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    return diffDays === 0 ? 'Posted today' : `Posted ${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
}

// Share story
function shareStory(story) {
    const shareData = {
        title: `${story.title}`,
        text: `Check out this story on ReportRadar: ${story.title}`,
        url: `${window.location.origin}/index.html#story-${story.id}`
    };

    if (navigator.share && navigator.canShare(shareData)) {
        navigator.share(shareData).catch(err => {
            console.error('Share error:', err);
            fallbackShare(shareData);
        });
    } else {
        fallbackShare(shareData);
    }
}

// Fallback share
function fallbackShare(shareData) {
    const shareText = `${shareData.text} ${shareData.url}`;
    navigator.clipboard.writeText(shareText).then(() => {
        alert('Link copied to clipboard!');
    }).catch(() => {
        alert(`Failed to copy. Share this: ${shareText}`);
    });
}

// Delete story
function deleteStory(storyId, storyDiv) {
    if (localStorage.getItem('isAdmin') !== 'true') {
        alert('Only admins can delete stories.');
        return;
    }

    if (confirm(`Delete "${storyDiv.querySelector('h3').textContent}"?`)) {
        try {
            let stories = JSON.parse(localStorage.getItem('stories')) || [];
            const updatedStories = stories.filter(s => s.id !== storyId);
            localStorage.setItem('stories', JSON.stringify(updatedStories));
            storyDiv.remove();
            if (window.location.pathname.includes('index.html')) {
                displayStories(updatedStories);
            } else {
                displayAdminStories();
            }
            console.log('Story deleted:', storyId);
        } catch (error) {
            console.error('Error deleting story:', error);
            alert('Failed to delete story.');
        }
    }
}

// Open full story modal
function openFullStoryModal(story) {
    const modal = document.createElement('div');
    modal.classList.add('modal');
    modal.style.display = 'flex';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close" role="button" aria-label="Close modal">×</span>
            <h2>${story.title}</h2>
            <p>${story.content}</p>
        </div>
    `;
    document.body.appendChild(modal);

    modal.querySelector('.close').addEventListener('click', () => closeModal(modal));
    modal.addEventListener('click', e => {
        if (e.target === modal) closeModal(modal);
    });
}

// Close modal
function closeModal(modal) {
    if (modal) document.body.removeChild(modal);
}

// Add comment
function addComment(storyDiv, storyId) {
    const commentInput = storyDiv.querySelector('.commentInput');
    const commentList = storyDiv.querySelector('.commentList');
    const commentText = commentInput.value.trim();

    if (!commentText) {
        alert('Please enter a comment.');
        return;
    }

    commentList.innerHTML += `<li>${commentText}</li>`;

    try {
        let stories = JSON.parse(localStorage.getItem('stories')) || [];
        const story = stories.find(s => s.id === storyId);
        if (story) {
            story.comments.push(commentText);
            localStorage.setItem('stories', JSON.stringify(stories));
            console.log('Comment added:', commentText);
        }
    } catch (error) {
        console.error('Error adding comment:', error);
        alert('Failed to save comment.');
    }

    commentInput.value = '';
}

// Load existing comments
function loadComments(storyDiv, comments) {
    const commentList = storyDiv.querySelector('.commentList');
    comments.forEach(comment => {
        commentList.innerHTML += `<li>${comment}</li>`;
    });
}

// Display error message
function displayErrorMessage() {
    const newsContainer = document.getElementById('newsContainer');
    if (newsContainer) {
        newsContainer.innerHTML = '<p>Error loading stories. Please try again later or clear Local Storage.</p>';
    }
}