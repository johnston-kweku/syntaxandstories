const fileInput = document.getElementById("id_profile_picture")
const preview = document.getElementById("avatar-preview")

fileInput.addEventListener("change", function () {
    const file = this.files[0]

    if (file) {
        const reader = new FileReader()

        reader.addEventListener("load", function () {
            preview.src = reader.result
        })

        reader.readAsDataURL(file)
    }
})