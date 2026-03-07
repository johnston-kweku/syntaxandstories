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