import "bootstrap"
import "./index.scss"

const selectFileBtn = document.querySelector("#selectFileBtn")
const openFileBtn = document.querySelector("#openFileBtn")
const fileDestField = document.querySelector("#fileDestContainer")
const projectNameField = document.querySelector("#projectName")
//input[name=mode]:checked
selectFileBtn.addEventListener("click", () => {
    window.file.openDialog("s").then((dist) => {
        fileDestField.value = dist
    })
})

openFileBtn.addEventListener("click", () => {
    let mode = document.querySelector("input[name=mode]:checked").value
    let sepBy = document.querySelector(`#${mode}`).value
    let filePath = fileDestField.value
    let projectName = projectNameField.value
    let params = {sepBy, mode, filePath, projectName}
    window.file.fileOpened(params)
})