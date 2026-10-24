const button = document.getElementById("uploadButton");
const fileOpener = document.getElementById("csvFileInput");
const taskSelect = document.getElementById("homework");

button.onclick = () => {
    fileOpener.click();
}

fileOpener.onchange = async () => {
    let file = await fileOpener.files[0];
    let task = taskSelect.value;

    console.log(task, file);

    sendFile(file, task);
}

sendFile = (file, task) => {
    // TODO: send cpp file via github api
}

analyseResults = (text) => {
    let lines = text.trim().split(/\r?\n/);

    let table = lines.slice(1).map(line => {
        let cols = line.split(',');
        return {
            name: cols[0],
            time: parseFloat(cols[1]),
            result: cols[2]
        };
    });
}