const followBtn = document.querySelectorAll(".follow-btn")

followBtn.forEach(btn => {
    btn.addEventListener("click", () => {

        const postAuthor = btn.dataset.postAuthor

        fetch(`/user/follow/${postAuthor}/`, {
            method:'POST',
            headers:{
                'X-CSRFToken': getCookie("csrftoken"),
                'Content-Type':'application/json'
            }
        })
        .then(res => res.json())
        .then(data => {
            document.querySelectorAll(`[data-post-author="${postAuthor}"]`)
            .forEach(button => {
                const text = button.querySelector(".follow-text") 
                const isFollowing = data.is_following ?? data.following;
                const followerCount = document.getElementById("follower-count");
                if(isFollowing) {
                    text.textContent = 'Unfollow'
                    text.classList.add("text-red-500")
                } else {
                    text.textContent = 'Follow'
                    text.classList.remove("text-red-500")
                }
                followerCount.textContent = data.followers_count
            })
        })
    })
})


document.querySelectorAll(".comment-form").forEach((form) => {
  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const postId = this.dataset.postId;
    const input = form.querySelector('input[name="content"]');
    const formData = new FormData(form);

    fetch(`/post/${postId}/comment/`, {
      method: "POST",
      headers: {
        "X-CSRFToken": getCookie("csrftoken"),
      },
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data)
        if (data.success) {
          input.value = "";

          const commentsList = document.getElementById(
            `comments-list-${postId}`,
          );

          const newComment = document.createElement("div");
          newComment.className = "flex gap-3";

          newComment.innerHTML = `
        <img src="${data.user_avatar}" class="w-10 h-10 rounded-full">
        <div class="flex-1">
            <div class="bg-gray-50 rounded-2xl px-4 py-3">
                <div class="flex items-center justify-between mb-1">
                    <h4 class="font-semibold text-gray-800">${data.username}</h4>
                    <button class="text-gray-400 hover:text-gray-600">•••</button>
                </div>
                <p class="text-gray-700 text-sm">${data.content}</p>
            </div>
        </div>
    `;

          if (commentsList) {
            commentsList.prepend(newComment);
          } else {
            console.warn('commentsList not found for', postId)
          }

          const counters = document.querySelectorAll(
            `.comments-count[data-post-id="${postId}"]`,
          );

          counters.forEach((counter) => {
            if (counter) counter.textContent = data.comment_count;
          });
        }
      });
  });
});


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


const saveBtn = document.querySelectorAll(".save-btn");

saveBtn.forEach((btn) => {
  btn.addEventListener("click", () => {
    const postIdSave = btn.dataset.postIdSave;
    btn.disabled = true;
    fetch(`/save/${postIdSave}/`, {
      method: "POST",
      headers: {
        "X-CSRFToken": getCookie("csrftoken"),
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
        .then((data) => {
        const countSpan = btn.parentElement.querySelector(".save-count");
        if (countSpan) countSpan.textContent = data.saves_count;

        if (data.saved) {
          btn.classList.add("fill-purple-600");
        } else {
          btn.classList.remove("fill-purple-600");
        }
      })
      .finally(() => {
        btn.disabled = false;
      });
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









const postsTab = document.getElementById("posts-tab")
const likedTab = document.getElementById("liked-tab")
const savedTab = document.getElementById("saved-tab")

const postsSection = document.getElementById("posts-section")
const likedSection = document.getElementById("liked-section")
const savedSection = document.getElementById("saved-section")

function hideAll(){
  if (postsSection) postsSection.classList.add("hidden")
  if (likedSection) likedSection.classList.add("hidden")
  if (savedSection) savedSection.classList.add("hidden")
}

function setActiveTab(activeTab){
  [postsTab, likedTab, savedTab].forEach(t => {
    if(!t) return;
    t.classList.remove("border-b-2","border-violet-500")
    t.setAttribute('aria-selected','false')
  })
  if(activeTab){
    activeTab.classList.add("border-b-2","border-violet-500")
    activeTab.setAttribute('aria-selected','true')
  }
}

if (postsTab) {
  postsTab.addEventListener("click", () => {
    hideAll()
    if (postsSection) postsSection.classList.remove("hidden")
    setActiveTab(postsTab)
  })
}

if (likedTab) {
  likedTab.addEventListener("click", () => {
    hideAll()
    if (likedSection) likedSection.classList.remove("hidden")
    setActiveTab(likedTab)
  })
}

if (savedTab) {
  savedTab.addEventListener("click", () => {
    hideAll()
    if (savedSection) savedSection.classList.remove("hidden")
    setActiveTab(savedTab)
  })
}

// Initialize default active tab
if (!postsSection?.classList.contains('hidden')) {
  setActiveTab(postsTab)
} else if (!likedSection?.classList.contains('hidden')) {
  setActiveTab(likedTab)
} else if (!savedSection?.classList.contains('hidden')) {
  setActiveTab(savedTab)
}