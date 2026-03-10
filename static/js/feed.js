document.querySelectorAll(".expand-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const content = btn.parentElement.querySelector(".post-content");
    const helperText = btn.querySelector(".helper-text");
    helperText.textContent =
      helperText.textContent === "Collapse" ? "Expand" : "Collapse";
    content.classList.toggle("line-clamp-3");
  });
});

document.querySelectorAll(".post-media").forEach((img) => {
  img.addEventListener("click", () => {
    img.requestFullscreen();
  });
});


// Hashtag filter

document.querySelectorAll(".post-content").forEach((content) => {
  const postContent = content.dataset.postContent;
  const hashContainer = content.closest("div").querySelector(".hash-container"); // target the container in the same post
  const words = postContent.split(/\s+/); // split by any whitespace
  
  words.forEach((word) => {
    if (word.startsWith("#")) {
      const tagElement = document.createElement("p");
      tagElement.dataset.hashtag = word.slice(1);
      tagElement.className =
        "px-3 py-1 mb-2 bg-gray-100 text-gray-700 rounded-lg text-xs hover:bg-gray-200 cursor-pointer transition-colors";
      tagElement.textContent = word;
      hashContainer.appendChild(tagElement);
    }
  });
});




// follow

const followBtn = document.querySelectorAll(".follow-btn");

followBtn.forEach((btn) => {
  btn.addEventListener("click", () => {
    const postAuthor = btn.dataset.postAuthor;

    fetch(`/user/follow/${postAuthor}/`, {
      method: "POST",
      headers: {
        "X-CSRFToken": getCookie("csrftoken"),
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        document
          .querySelectorAll(`[data-post-author="${postAuthor}"]`)
          .forEach((button) => {
            const text = button.querySelector(".follow-text");
            const icon = button.querySelector(".follow-svg");
            const isFollowing = data.is_following ?? data.following;
            if (isFollowing) {
              text.textContent = "Unfollow";
              text.classList.remove("text-purple-700");
              text.classList.add("text-red-500");
              icon.classList.remove("stroke-purple-700");
              icon.classList.add("stroke-red-500");
            } else {
              text.textContent = "Follow";
              text.classList.remove("text-red-500");
              text.classList.add("text-purple-700");
              icon.classList.remove("stroke-red-500");
              icon.classList.add("stroke-purple-700");
            }
          });
      });
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
        countSpan.textContent = data.saves_count;

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

document.addEventListener("DOMContentLoaded", () => {
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

          countSpan.textContent = data.likes_count;

          if (data.liked) {
            this.classList.add("fill-red-600");
          } else {
            this.classList.remove("fill-red-600");
          }
        });
    });
  });
});

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

          commentsList.prepend(newComment);

          const counters = document.querySelectorAll(
            `.comments-count[data-post-id="${postId}"]`,
          );

          counters.forEach((counter) => {
            counter.textContent = data.comment_count;
          });
        }
      });
  });
});

function toggleComments(postId) {
  const container = document.getElementById(`comments-container-${postId}`);
  const toggleText = document.getElementById(`toggle-text-${postId}`);
  container.classList.toggle("hidden");
  toggleText.innerText = container.classList.contains("hidden")
    ? `View Comments`
    : `Hide Comments`;
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