document.querySelectorAll(".expand-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        const content = btn.parentElement.querySelector(".post-content")
        const helperText = btn.querySelector(".helper-text")
        helperText.textContent = helperText.textContent === 'Collapse' ? 'Expand' : 'Collapse'
        content.classList.toggle("line-clamp-3")
       
    })
})


document.querySelectorAll(".post-media").forEach(img => {
    img.addEventListener("click", () => {
    img.requestFullscreen()
    })
})

// document.querySelectorAll(".expand-btn").forEach(btn => {
//     btn.addEventListener("click", () => {

//     })
// })


document.querySelectorAll(".post-content").forEach(content => {
    let text = content.textContent
    const hashContainer = document.querySelectorAll(".hash-container")
    text = text.split(' ')

    for(word of text) {
        if(word.startsWith("#")) {
            hashContainer.forEach(tag => {
                tag.innerHTML += `
                <p class="px-3 py-1 mb-2 bg-gray-100 text-gray-700 rounded-lg text-xs hover:bg-gray-200 cursor-pointer transition-colors">
                ${word}
                </p>
                `
            })
        }
    }

})



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
                if(isFollowing) {
                    text.textContent = 'Unfollow'
                    text.classList.add("text-red-500")
                } else {
                    text.textContent = 'Follow'
                    text.classList.remove("text-red-500")
                }
            })
        })
    })
})








const saveBtn = document.querySelectorAll(".save-btn")

saveBtn.forEach(btn => {

    btn.addEventListener("click", () => {
        const postIdSave = btn.dataset.postIdSave
        btn.disabled = true
        fetch(`/save/${postIdSave}/`, {
            method:'POST',
            headers: {
                'X-CSRFToken':getCookie("csrftoken"),
                'Content-Type':'application/json'
            }
        })
        .then(res => res.json())
        .then(data => {

            const countSpan = btn.parentElement.querySelector(".save-count")
            countSpan.textContent = data.saves_count

            if(data.saved) {
                btn.classList.add("fill-purple-600")

            }else{
                btn.classList.remove("fill-purple-600")
            }
        })
        .finally(() => {
            btn.disabled = false
        })
    })
})



 document.addEventListener("DOMContentLoaded", () => {

    const likeButtons = document.querySelectorAll(".like-btn")

    likeButtons.forEach(button => {

        button.addEventListener("click", function(){

            const postId = this.dataset.postId

            fetch(`/like/${postId}/`, {
                method: "POST",
                headers: {
                    "X-CSRFToken": getCookie("csrftoken"),
                    "Content-Type": "application/json"
                }
            })
            .then(response => response.json())
            .then(data => {

                const countSpan = this.parentElement.querySelector(".likes-count")

                countSpan.textContent = data.likes_count

                if (data.liked){
                    this.classList.add("fill-red-600")
                } else {
                    this.classList.remove("fill-red-600")
                }

            })

        })

    })

})


