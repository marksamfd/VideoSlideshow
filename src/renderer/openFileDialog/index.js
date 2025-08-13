import "bootstrap";
import "./index.scss";
const selectFileBtn = document.querySelector("#selectFileBtn");
const openFileBtn = document.querySelector("#openFileBtn");
const presentFileBtn = document.querySelector("#presentFileBtn");
const fileDestField = document.querySelector("#fileDestContainer");
//input[name=mode]:checked
selectFileBtn.addEventListener("click", () => {
  file.open("o").then(([dist]) => {
    fileDestField.value = dist;
  });
});

openFileBtn.addEventListener("click", () => {
  if (fileDestField.value !== "") {
    let mode = document.querySelector("input[name=mode]:checked").value;
    let sepBy = document.querySelector(`#${mode}`).value;
    let filePath = fileDestField.value;
    let params = { sepBy, mode, filePath, present: false };
    file.fileOpened(params);
  }
});
presentFileBtn.addEventListener("click", () => {
  if (fileDestField.value !== "") {
    let mode = document.querySelector("input[name=mode]:checked").value;
    let sepBy = document.querySelector(`#${mode}`).value;
    let filePath = fileDestField.value;
    let params = { sepBy, mode, filePath, present: true };
    file.fileOpened(params);
  }
});
