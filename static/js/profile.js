
function initProfileInteractions(root = document){
  // Follow buttons
  root.querySelectorAll('.follow-btn').forEach(btn => {
    if(btn.dataset.init === '1') return;
    btn.dataset.init = '1';
    btn.addEventListener('click', () => {
      const postAuthor = btn.dataset.postAuthor;
      fetch(`/user/follow/${postAuthor}/`, {
        method:'POST',
        headers:{
          'X-CSRFToken': getCookie('csrftoken'),
          'Content-Type':'application/json'
        }
      }).then(res => res.json()).then(data => {
        root.querySelectorAll(`[data-post-author="${postAuthor}"]`).forEach(button => {
          const text = button.querySelector('.follow-text');
          const isFollowing = data.is_following ?? data.following;
          const followerCount = document.getElementById('follower-count');
          if(isFollowing){ text.textContent = 'Unfollow'; text.classList.add('text-red-500'); }
          else { text.textContent = 'Follow'; text.classList.remove('text-red-500'); }
          if(followerCount) followerCount.textContent = data.followers_count;
        });
      });
    });
  });

  // Comment forms
  root.querySelectorAll('.comment-form').forEach((form) => {
    if(form.dataset.init === '1') return;
    form.dataset.init = '1';
    form.addEventListener('submit', function(e){
      e.preventDefault();
      const postId = this.dataset.postId;
      const input = form.querySelector('input[name="content"]');
      const formData = new FormData(form);
      fetch(`/post/${postId}/comment/`, {
        method: 'POST',
        headers: { 'X-CSRFToken': getCookie('csrftoken') },
        body: formData
      }).then(res => res.json()).then(data => {
        if(data.success){
          input.value = '';
          const commentsList = document.getElementById(`comments-list-${postId}`);
          const newComment = document.createElement('div');
          newComment.className = 'flex gap-3';
          newComment.innerHTML = `\n            <img src="${data.user_avatar}" class="w-10 h-10 rounded-full">\n            <div class="flex-1">\n                <div class="bg-gray-50 rounded-2xl px-4 py-3">\n                    <div class="flex items-center justify-between mb-1">\n                        <h4 class="font-semibold text-gray-800">${data.username}</h4>\n                        <button class="text-gray-400 hover:text-gray-600">•••</button>\n                    </div>\n                    <p class="text-gray-700 text-sm">${data.content}</p>\n                </div>\n            </div>\n          `;
          if(commentsList) commentsList.prepend(newComment);
          const counters = document.querySelectorAll(`.comments-count[data-post-id="${postId}"]`);
          counters.forEach(c=> { if(c) c.textContent = data.comment_count; });
        }
      });
    });
  });

  // Picture & media fullscreen
  root.querySelectorAll('.picture').forEach(img => { if(img.dataset.init==='1') return; img.dataset.init='1'; img.addEventListener('click', ()=> img.requestFullscreen()); });
  root.querySelectorAll('.post-media').forEach(img => { if(img.dataset.init==='1') return; img.dataset.init='1'; img.addEventListener('click', ()=> img.requestFullscreen()); });

  // Save buttons
  root.querySelectorAll('.save-btn').forEach(btn => {
    if(btn.dataset.init === '1') return;
    btn.dataset.init = '1';
    btn.addEventListener('click', async (e) => {
      e.stopPropagation()
  if (btn.dataset.loading === "1") return;
  btn.dataset.loading = "1";

  const postIdSave = btn.dataset.postIdSave || btn.getAttribute('data-post-id-save');
  if(!postIdSave) return;

  try {
    const res = await fetch(`/save/${postIdSave}/`, {
      method: 'POST',
      headers: {
        'X-CSRFToken': getCookie('csrftoken'),
        'Content-Type': 'application/json'
      }
    });

    const data = await res.json();

    const countSpan = btn.parentElement.querySelector('.save-count');
    if(countSpan) countSpan.textContent = data.saves_count;

    if(data.saved){
      btn.classList.add('fill-purple-600');
    } else {
      btn.classList.remove('fill-purple-600');
    }

  } finally {
    btn.dataset.loading = "0";
  }

});
  });


  
  // Like buttons
  root.querySelectorAll('.like-btn').forEach(button => {
    if(button.dataset.init === '1') return;
    button.dataset.init = '1';
    button.addEventListener('click', function(){
      const postId = this.dataset.postId || this.getAttribute('data-post-id');
      if(!postId) return;
      fetch(`/like/${postId}/`, { method:'POST', headers: { 'X-CSRFToken': getCookie('csrftoken'), 'Content-Type':'application/json' } })
        .then(res => res.json())
        .then(data => {
          const countSpan = this.parentElement.querySelector('.likes-count');
          if(countSpan) countSpan.textContent = data.likes_count;
          if(data.liked) this.classList.add('fill-red-600'); else this.classList.remove('fill-red-600');
        });
    });
  });

  // Expand / Collapse post content
  root.querySelectorAll('.expand-btn').forEach(btn => {
    if (btn.dataset.init === '1') return;
    btn.dataset.init = '1';
    btn.addEventListener('click', () => {
      // find nearest ancestor that contains .post-content
      let ancestor = btn;
      let content = null;
      while (ancestor && ancestor !== document.body) {
        if (ancestor.querySelector && ancestor.querySelector('.post-content')) {
          content = ancestor.querySelector('.post-content');
          break;
        }
        ancestor = ancestor.parentElement;
      }

      const helperText = btn.querySelector('.helper-text');
      if (!content || !helperText) return;
      helperText.textContent = helperText.textContent === 'Collapse' ? 'Expand' : 'Collapse';
      content.classList.toggle('line-clamp-3');
    });
  });

}

// Initialize interactions on initial load
document.addEventListener('DOMContentLoaded', ()=> initProfileInteractions(document));


function toggleComments(postId) {
  const container = document.getElementById(`comments-container-${postId}`);
  const toggleText = document.getElementById(`toggle-text-${postId}`);
  container.classList.toggle("hidden");
  
}



document.addEventListener("click", function(e){

    const btn = e.target.closest(".options-btn");

    if(!btn) return;

    const existingMenu = btn.parentElement.querySelector(".options-menu");
    if(existingMenu){
        existingMenu.remove();
        return;
    }

    const container = document.createElement("div");
    container.className = "options-menu absolute bg-white shadow-lg rounded-md p-2";
    container.style.zIndex = 1000;

    const optionText = document.createElement("p");
    optionText.textContent = "Delete Comment";
    optionText.className = "cursor-pointer hover:text-red-600 font-bold";

    optionText.addEventListener("click", () => {

        const commentId = btn.dataset.commentId;

        fetch(`/comment/${commentId}/delete/`,{
            method:"POST",
            headers:{
                "X-CSRFToken": getCookie("csrftoken"),
                "Content-Type":"application/json"
            }
        })
        .then(res => res.json())
        .then(data => {

            if(data.success){

                const comment = document.getElementById(`comment-${commentId}`);

                comment.style.opacity = "0";
                comment.style.transform = "translateX(-20px)";

                setTimeout(()=>{
                    comment.remove();
                },300);

            }

        });

        container.remove();
    });

    container.appendChild(optionText);

    btn.parentElement.appendChild(container);

});

document.querySelectorAll(".picture").forEach(image => {
    image.addEventListener('click', () => {
        image.requestFullscreen()
    })
})

document.querySelectorAll(".post-media").forEach((img) => {
  img.addEventListener("click", () => {
    img.requestFullscreen();
  });
});




  const likeButtons = document.querySelectorAll(".like-btn");

  likeButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const postId = this.dataset.postId;

      fetch(`/like/${postId}/`, {
        method: "POST",
        headers: {
          "X-CSRFToken": getCookie("csrftoken"),
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then((data) => {
          const countSpan = this.parentElement.querySelector(".likes-count");
          if (countSpan) countSpan.textContent = data.likes_count;

          if (data.liked) {
            this.classList.add("fill-red-600");
          } else {
            this.classList.remove("fill-red-600");
          }
        });
    });
  });









const postsTab = document.getElementById('posts-tab')
const likedTab = document.getElementById('liked-tab')
const savedTab = document.getElementById('saved-tab')

const postsSection = document.getElementById('posts-section')
const likedSection = document.getElementById('liked-section')
const savedSection = document.getElementById('saved-section')

function hideAll(){ if(postsSection) postsSection.classList.add('hidden'); if(likedSection) likedSection.classList.add('hidden'); if(savedSection) savedSection.classList.add('hidden'); }

function setActiveTab(activeTab){ [postsTab, likedTab, savedTab].forEach(t => { if(!t) return; t.classList.remove('border-b-2','border-violet-500'); t.setAttribute('aria-selected','false'); }); if(activeTab){ activeTab.classList.add('border-b-2','border-violet-500'); activeTab.setAttribute('aria-selected','true'); } }

async function loadSection(sectionName){
  const containerMap = { posts: postsSection, liked: likedSection, saved: savedSection };
  const container = containerMap[sectionName];
  if(!container) return;
  const username = document.querySelector('[data-username]')?.dataset?.username;
  if(!username) return;
  // Fetch the full profile HTML and extract the requested section
  const res = await fetch(`/user/profile/${username}/`, { headers: { 'X-Requested-With':'XMLHttpRequest' } });
  const html = await res.text();
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const newSection = doc.getElementById(container.id);
  if(newSection){
    container.innerHTML = newSection.innerHTML;
    initProfileInteractions(container);
  }
}

if(postsTab){ postsTab.addEventListener('click', async () => { hideAll(); if(postsSection) postsSection.classList.remove('hidden'); setActiveTab(postsTab); await loadSection('posts'); }); }
if(likedTab){ likedTab.addEventListener('click', async () => { hideAll(); if(likedSection) likedSection.classList.remove('hidden'); setActiveTab(likedTab); await loadSection('liked'); }); }
if(savedTab){ savedTab.addEventListener('click', async () => { hideAll(); if(savedSection) savedSection.classList.remove('hidden'); setActiveTab(savedTab); await loadSection('saved'); }); }

// Initialize default active tab state
if (!postsSection?.classList.contains('hidden')) { setActiveTab(postsTab); } else if (!likedSection?.classList.contains('hidden')) { setActiveTab(likedTab); } else if (!savedSection?.classList.contains('hidden')) { setActiveTab(savedTab); }


document.addEventListener("submit", async function(e) {
  const form = e.target;
  if(!form.classList.contains("delete-post-form")) return;
  e.preventDefault()

  const postCard = form.closest(".post-card")

  const response = await fetch(form.action, {
    method:'POST',
    body:new FormData(form)
  });

  if (response.ok) {
    postCard.style.opacity = "0"
    postCard.style.transform = "scale(0.95)";

    setTimeout(() => {
      postCard.remove()
    }, 300)
  }
})