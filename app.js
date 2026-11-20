//const { use } = require("react");

const button = document.getElementById("uploadButton");
const fileOpener = document.getElementById("csvFileInput");
const taskSelect = document.getElementById("homework");
const discordLogin = document.getElementById("loginDiscord");
const fileConfirm = document.getElementById("fileConfirm");
const loadingGif = document.getElementById("loadingGif");

const resultsDiv = document.getElementById("resultsSide");

const upArrow = document.getElementById("upArrow");
const downArrow = document.getElementById("downArrow");
const upperResults = document.getElementById("upperResults");
const lowerResults = document.getElementById("lowerResults");
const taskName = document.getElementById("taskName");
const noSubmissionsYet =document.getElementById("noSubmissionsYetDiv");
const resultsText = document.getElementById("results");
const resultsPlacementColumn = document.getElementById("resultsPlacementColumn");
const resultsNameColumn = document.getElementById("resultsNameColumn");
const resultsTimeColumn = document.getElementById("resultsTimeColumn");

let params = new URLSearchParams(window.location.search);

let allTasks = ["zlivanje", "neboticniki", "mediane", "autocomplete", "vreca", "vzorec", "ni še naslednje naloge", "ni še naslednje naloge", "še zmeri ni naslednje naloge"];
let curTask = 0;
let placementColours = ["#ffe469", "#c9dde5", "#d46751", "#ffffff", "#705159"];

let results = {};
let username = "";

async function fetchResults() {
    results = await fetch("https://secret-worker.nejc-gostisa.workers.dev/", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Reason": "results"
        }
    });
    
    results = await results.json();
    
    console.log(results);

    updateResults(curTask);
}

fetchResults();

async function updateResults(index) {
    if (!localStorage.getItem("taskUsername") && localStorage.getItem("sessionId")) {
        let nameRequest = await fetch("https://secret-worker.nejc-gostisa.workers.dev/", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Reason": "username",
                "sessionId": localStorage.getItem("sessionId")
            }
        });

        username = nameRequest.text();
        localStorage.setItem("taskUsername", username);
    }

    formatResults(index);
}

function formatResults(index) {
    if (index < 0 || index >= allTasks.length) return "";

    const task = allTasks[index];
    taskName.textContent = task;

    const data = results[task] || [];

    if (data.length === 0) {
        console.log("no submissions for " + task);
        noSubmissionsYet.style.display = "flex";

        resultsPlacementColumn.innerHTML = "";
        resultsNameColumn.innerHTML = "";
        resultsTimeColumn.innerHTML = "";
        return;
    }

    noSubmissionsYet.style.display = "none";

    data.sort((a, b) => {
        if (!a["time"]) return 1;
        if (!b["time"]) return -1;
        return a["time"] - b["time"];
    });

    let resultsColumn = "";
    let nameColumn = "";
    let timeColumn = "";

    for (let i = 0; i < data.length; i++) {

        if (data[i]["time"]) {
            resultsColumn += `<div class="rank-blob" style="--his-color: ${placementColours[Math.min(i, 3)]}">${i+1}.</div>`;
            nameColumn += "<div class=\"sized\">" + data[i]["username"] + "</div>";
            timeColumn += "<div class=\"sized\">" + data[i]["time"] + "ms" + "</div>";
        } else {
            resultsColumn += `<div class="rank-blob" style="--his-color: ${placementColours[4]}"> DNF </div>`;
            nameColumn += "<div class=\"sized\">" + data[i]["username"] + "</div>";
            timeColumn += "<div class=\"sized\">" + "X" + "</div>";
        }
    }

    resultsPlacementColumn.innerHTML = resultsColumn;
    resultsNameColumn.innerHTML = nameColumn;
    resultsTimeColumn.innerHTML = timeColumn;

    //return formatted;
}

resultsDiv.onmouseenter = () => {
    upArrow.style.display = "block";
    downArrow.style.display = "block";
}

upArrow.onclick = () => {
    if (curTask > 0) {
        curTask--;
        updateResults(curTask);
    }
}

downArrow.onclick = () => {
    if (curTask < allTasks.length - 1) {
        curTask++;
        updateResults(curTask);
    }
}

// the oauth code is single use
let loginCode = params.get("code");
const discordMarkup = discordLogin.innerHTML;

const hasAuth = () => Boolean(loginCode || localStorage.getItem("sessionId"));

const setLoginLocked = (locked) => {
    if (locked) {
        discordLogin.textContent = "Logged in with Discord :P";
        discordLogin.style.pointerEvents = "none";
        discordLogin.style.opacity = "0.5";
    } else {
        discordLogin.innerHTML = discordMarkup;
        discordLogin.style.pointerEvents = "";
        discordLogin.style.opacity = "";
    }
};

if (hasAuth()) setLoginLocked(true);

button.onclick = () => {
    if (!hasAuth()) {
        fileConfirm.textContent = "Please log in with Discord first.";
        return;
    }

    fileOpener.value = ""; // fires onchange
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

    sendFile(file, task, loginCode);
}

async function sendFile(file, task, discordCode) {
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
                redirect_uri: window.location.origin
            })
        });

        let result = await response.json();

        console.log(result);

        // the worker hands back a session even when the github write failed
        if (result.sessionId) {
            localStorage.setItem("sessionId", result.sessionId);
            loginCode = null;
            if (params.has("code")) {
                params.delete("code");
                history.replaceState(null, "", window.location.pathname);
            }
            setLoginLocked(true);
        }

        if (result.success) {
            fileConfirm.textContent = "File uploaded successfully as " + result.filename + " for task " + result.task;
        } else if (result.error && /session|expired|log ?in|code/i.test(result.error)) {
            localStorage.removeItem("sessionId");
            loginCode = null;
            setLoginLocked(false);
            fileConfirm.textContent = "Error uploading file: " + result.error + " (log in again and retry.)";
        } else {
            fileConfirm.textContent = "Error uploading file: " + (result.error || "unknown error");
        }
    } catch (err) {
        fileConfirm.textContent = "Error uploading file: " + err;
    }

    loadingGif.style.display = "none";
    button.style.display = "block";
    fileOpener.value = "";
}

function analyseResults(text) {
    
}