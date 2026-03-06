const content = document.getElementById("post-content")
const expandEl = document.getElementById("expand")
const postMedia = document.getElementById("post-media")

expandEl.addEventListener("click", () => {
    content.classList.toggle("line-clamp-3")
}) 

postMedia.addEventListener("click", () => {
    postMedia.requestFullscreen()
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