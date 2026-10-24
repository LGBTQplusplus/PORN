const button = document.getElementById("uploadButton");
const fileOpener = document.getElementById("csvFileInput");
const taskSelect = document.getElementById("homework");
const discordLogin = document.getElementById("loginDiscord");
const fileConfirm = document.getElementById("fileConfirm");

let params = new URLSearchParams(window.location.search);

if (params.has("code")) {
    discordLogin.textContent = "Logged in with Discord :P";
    discordLogin.style.pointerEvents = "none";
    discordLogin.style.opacity = "0.5";
}

button.onclick = () => {
    fileOpener.click();
}

fileOpener.onchange = async () => {
    let file = await fileOpener.files[0];
    let task = taskSelect.value;

    console.log(task, file);

    sendFile(file, task, params.get("code"));
}

sendFile = async (file, task, discordCode) => {
    let text = await file.text();

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
            redirect_uri: window.location.origin + window.location.pathname
        })
    });

    let result = await response.json();

    console.log(result);
    if (result.success) {
        fileConfirm.textContent = "File uploaded successfully as " + result.filename + " for task " + result.task;
    } else {
        fileConfirm.textContent = "Error uploading file: " + result.error;
    }
}

analyseResults = (text) => {
    
}