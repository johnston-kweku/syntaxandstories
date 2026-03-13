const toggleMedia = document.getElementById("toggle-media")
const media = document.getElementById("id_media")

let currentObjectURL = null

toggleMedia.addEventListener("click", () => {
    media.click()
})

media.addEventListener("change", () => {

    const file = media.files[0]
    if (!file) return

    // revoke old preview URL
    if (currentObjectURL) {
        URL.revokeObjectURL(currentObjectURL)
    }

    currentObjectURL = URL.createObjectURL(file)

    // file size check (10MB example)
    if (file.size > 10 * 1024 * 1024) {
        alert("File too large (max 10MB)")
        media.value = ""
        return
    }

    if (!file.type.startsWith("image/") && (!file.type.startsWith('video/'))) {
        alert("Only images and videos are allowed");
        media.value = "";
        return;
    }
    toggleMedia.innerHTML = ""

    if(file.type.startsWith("image/")) {
        const img = document.createElement("img")
        img.src = currentObjectURL;
        img.className = "w-full h-full object-cover rounded-2xl";
        toggleMedia.appendChild(img)
        // re-attach remove button so it's available after innerHTML replacement

    }else if(file.type.startsWith("video/")){
        const video = document.createElement("video");
        video.src = currentObjectURL;
        video.className = "w-full h-full object-cover rounded-2xl";
        video.controls = true;
        video.muted = true;
        video.autoplay = true;
        video.playsInline = true;

        video.addEventListener("loadedmetadata", () => {
            const playPromise = video.play();
            if(playPromise !== undefined) {
                playPromise.catch(() => {

                })
            }
        })
        toggleMedia.appendChild(video)
    }

})




const removeBtn = document.getElementById("remove-btn")
if (removeBtn) {
    removeBtn.type = 'button'


    removeBtn.addEventListener("click", () => {
        // reset preview and clear file input
        toggleMedia.innerHTML = "<p class=\"p-6\">Click to add a media file.</p>";
        media.value = "";
        if (currentObjectURL) URL.revokeObjectURL(currentObjectURL);
        currentObjectURL = null;
    });
}

// Live character counter for the post content textarea
document.addEventListener('DOMContentLoaded', () => {
    const txt = document.getElementById('id_content');
    const counter = document.getElementById('content-count');
    const maxSpan = document.getElementById('content-max');
    if (!txt || !counter || !maxSpan) return;

    const max = parseInt(txt.getAttribute('maxlength') || '6000', 10);
    maxSpan.textContent = max;

    function updateCount() {
        const len = txt.value.length;
        counter.textContent = len;
        counter.classList.toggle('text-yellow-500', len > Math.floor(max * 0.9) && len <= max);
        counter.classList.toggle('text-red-500', len > max);
    }

    txt.addEventListener('input', updateCount);
    updateCount();
    // Render Django messages as toasts if present
    const msgsRoot = document.getElementById('django-messages');
    if (msgsRoot) {
        const toastContainer = document.getElementById('toast-container') || (() => {
            const c = document.createElement('div');
            c.id = 'toast-container';
            c.className = 'fixed top-4 right-4 z-50';
            document.body.appendChild(c);
            return c;
        })();

        function showToast(text, type = 'info') {
            const toast = document.createElement('div');
            toast.className = 'mb-3 max-w-sm w-full text-white rounded-lg shadow-lg overflow-hidden animate-slide-in';
            let bg = 'bg-gray-800';
            if (type.indexOf('success') !== -1) bg = 'bg-green-500';
            if (type.indexOf('error') !== -1) bg = 'bg-red-500';
            if (type.indexOf('warning') !== -1) bg = 'bg-yellow-500 text-black';

            toast.className += ' ' + bg + ' p-3 flex items-start justify-between';

            const content = document.createElement('div');
            content.innerText = text;

            const close = document.createElement('button');
            close.innerText = '✕';
            close.className = 'ml-3 font-bold';
            close.addEventListener('click', () => {
                toast.remove();
            });

            toast.appendChild(content);
            toast.appendChild(close);
            toastContainer.appendChild(toast);

            // Auto dismiss
            setTimeout(() => {
                if (toast.parentNode) toast.remove();
            }, 4000);
        }

        const children = Array.from(msgsRoot.children);
        children.forEach(ch => {
            const tags = ch.dataset.tags || '';
            const text = ch.textContent.trim();
            if (text) showToast(text, tags);
        });
        // If a redirect URL is present, wait 3 seconds then navigate
        const redirectEl = document.getElementById('post-redirect');
        if (redirectEl) {
            const url = redirectEl.dataset.url;
            if (url) {
                setTimeout(() => {
                    window.location.href = url;
                }, 3000);
            }
        }
    }
});



const buttons = document.querySelectorAll(".category-btn")
const categoryInput = document.getElementById("category-input")

buttons.forEach(btn => {

    btn.addEventListener("click", () => {

        const category = btn.dataset.category

        // set value for form submission
        categoryInput.value = category

        // reset all buttons
        buttons.forEach(b => {
            b.classList.remove(
                "bg-violet-100","border-violet-600",
                "bg-fuchsia-100","border-fuchsia-600",
                "bg-green-100","border-green-600",
                "bg-yellow-100","border-yellow-600"
            )
            b.classList.add("bg-gray-50","border-transparent")

            const icon = b.querySelector(".icon-box")
            if(icon){
                icon.classList.remove(
                    "bg-violet-600",
                    "bg-fuchsia-600",
                    "bg-green-500",
                    "bg-yellow-500"
                )

                icon.classList.add("bg-gray-300")
            }
        })

        // activate selected button
        if(category === "TECH"){
            btn.classList.add("bg-violet-100","border-violet-600")
            btn.classList.remove("bg-gray-50")

            btn.querySelector(".icon-box").classList.add("bg-violet-600")
        }

        if(category === "STORY"){
            btn.classList.add("bg-fuchsia-100","border-fuchsia-600")
            btn.classList.remove("bg-gray-50")

            btn.querySelector(".icon-box").classList.add("bg-fuchsia-600")
        }

        if(category === "LIFESTYLE") {
            btn.classList.add("bg-green-100", "border-green-600")
            btn.classList.remove("bg-gray-50")

            btn.querySelector(".icon-box").classList.add("bg-green-500")
        }

        if(category === "OTHER") {
            btn.classList.add("bg-yellow-100", "border-yellow-600")
            btn.classList.remove("bg-gray-50")

            btn.querySelector(".icon-box").classList.add("bg-yellow-600")
        }
    })

})