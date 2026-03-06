const content = document.getElementById("post-content")
const expandEl = document.getElementById("expand")
const postMedia = document.getElementById("post-media")

expandEl.addEventListener("click", () => {
    content.classList.toggle("line-clamp-3")
}) 

postMedia.addEventListener("click", () => {
    postMedia.requestFullscreen()
})

