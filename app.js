const button = document.getElementById("uploadButton");
const fileOpener = document.getElementById("csvFileInput");
const taskSelect = document.getElementById("homework");
const discordLogin = document.getElementById("loginDiscord");
const fileConfirm = document.getElementById("fileConfirm");
const loadingGif = document.getElementById("loadingGif");

let params = new URLSearchParams(window.location.search);

if (params.has("code") || localStorage.getItem("sessionId")) {
    discordLogin.textContent = "Logged in with Discord :P";
    discordLogin.style.pointerEvents = "none";
    discordLogin.style.opacity = "0.5";
}

button.onclick = () => {
    if (!params.has("code") && !localStorage.getItem("sessionId")) {
        fileConfirm.textContent = "Please log in with Discord first.";
        return;
    }

    fileOpener.click();
}

fileOpener.onchange = async () => {
    let file = await fileOpener.files[0];
    let task = taskSelect.value;

    console.log(task, file);
    let selectedTask = taskSelect.options[taskSelect.selectedIndex].text;

    let taskOptions = Array.from(taskSelect.options).map(option => option.text);

    console.log(selectedTask, file.name.split(".")[0], taskOptions.includes(file.name.split(".")[0]));

    if (file.name.split(".")[0] !== selectedTask && taskOptions.includes(file.name.split(".")[0])) {
        fileConfirm.textContent = "File name matches different task than selected. Please select the correct task from the dropdown.";
        return;
    }

    button.style.display = "none";
    loadingGif.style.display = "block";

    sendFile(file, task, params.get("code"));
}

sendFile = async (file, task, discordCode) => {
    let text = await file.text();

    try {
        let response = await fetch("https://secret-worker.nejc-gostisa.workers.dev/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                filename: file.name,
                content: text,
                task: task,
                discordCode: discordCode,
                sessionId: localStorage.getItem("sessionId"),
                redirect_uri: window.location.origin + window.location.pathname
            })
        });

        let result = await response.json();

        console.log(result);
        if (result.success) {
            fileConfirm.textContent = "File uploaded successfully as " + result.filename + " for task " + result.task;
            if (result.sessionId) {
                localStorage.setItem("sessionId", result.sessionId);
            }
        } else if (result.error && result.error.toLowerCase().includes("session")) {
            localStorage.removeItem("sessionId");
            fileConfirm.textContent = "Error uploading file: " + result.error + " (log in again and retry.)";
        } else {
            fileConfirm.textContent = "Error uploading file: " + (result.error || "unknown error");
        }
    } catch (err) {
        fileConfirm.textContent = "Error uploading file: " + err;
    }

    loadingGif.style.display = "none";
    button.style.display = "block";
}

analyseResults = (text) => {
    
}