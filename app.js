const button = document.getElementById("uploadButton");
const fileOpener = document.getElementById("csvFileInput");

button.onclick = () => {
    fileOpener.click();
}

fileOpener.onchange = async () => {
    let text = await fileOpener.files[0].text();

    console.log(text);

    analyseResults(text);
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