//intput
const pageMinInput = document.getElementById('min-page');
const pageMaxInput = document.getElementById('max-page');
const resultsPerPageInput = document.getElementById('results-per-page');

//content
const loadingWrapper = document.getElementById('loading-gif-wrapper');
const submit = document.getElementById('submit-btn');
const passengersDivWrapper = document.getElementById('passengers-wrapper');


class DefaultDict {
    constructor(defaultInit) {
        return new Proxy({}, {
            get: (target, name) => name in target ?
        target[name] :
        (target[name] = typeof defaultInit === 'function' ?
          new defaultInit().valueOf() :
          defaultInit)
        });
    }
}

const stall = async (stallTime = 3000) => {
    await new Promise(resolve => setTimeout(resolve, stallTime));
}

const removeAllChildNodes = (parent) => {
    while (parent.firstChild) {
        parent.removeChild(parent.firstChild);
    }
}

const url = "https://api.instantwebtools.net/v1/passenger?";
//https://api.instantwebtools.net/v1/passenger?page=0&size=10
const getData = async (page, size) => {
    const urlToFetch = `${url}page=${page}&size=${size}`;
    try {
        const response = await fetch(urlToFetch);
        await stall(1000);
        if (response.ok) {
            const jsonResponse = await (response.json());
            return jsonResponse.data;
        }
        throw new Error('Something went wrong with API call...');
    } catch(error) {
        console.log(error);
    }
}

const processPage = async (page, size) => {
    const data = getData(page, size);
    const currPassengers = {};
    (await data).forEach((passenger) => {
        if (passenger._id)
            currPassengers[passenger._id] = {
                name: passenger.name,
                trips: passenger.trips
            }
    })
    return currPassengers;
}

const processPages = () => {
    const pageMin = parseInt(pageMinInput.value);
    const pageMax = parseInt(pageMaxInput.value);
    const resultsPerPage = parseInt(resultsPerPageInput.value);
    const promisesArray = []
    for (let page = pageMin; page < pageMax+1; page++) {
        promisesArray.push(processPage(page, resultsPerPage));
    }
    return promisesArray;
}

const renderTable = (dictionary) => {
    let table = document.createElement('table');
    table.style.width = '400px';
    table.style.border = '1px solid black';

    let tbody = document.createElement('tbody');
    let thead = document.createElement('thead');
    
    let headerTitles = ['id', 'name', 'trips'];
    table.appendChild(thead);
    for(var i=0;i<headerTitles.length;i++){
        thead.appendChild(document.createElement("th")).
        appendChild(document.createTextNode(headerTitles[i]));
    }
    
    for (const [key, {name, trips}] of Object.entries(dictionary)) {
        let row = document.createElement('tr');
        const rowArr = [key, name, trips];
        for (let el of rowArr) {
            let cell = document.createElement('td');
            cell.textContent = el;
            row.appendChild(cell);
        }
        tbody.appendChild(row);
    }
    table.appendChild(tbody);

    let passengersDiv = document.createElement('div');
    passengersDiv.setAttribute('id', 'passengers');
    passengersDiv.appendChild(table);
    //refresh passengersDiv
    removeAllChildNodes(passengersDivWrapper);
    passengersDivWrapper.appendChild(passengersDiv);
}

const renderGif = () => {
    let loadingGif = document.createElement('div');
    loadingGif.setAttribute("id", "loading-gif");
    let img = document.createElement('img');
    img.src = './XOsX.gif';
    img.alt = 'loading';
    img.width = '50';
    loadingGif.appendChild(img);
    loadingWrapper.appendChild(loadingGif);
}

const showData = async (e) => {
    let passengers = {};
    e.preventDefault();
    renderGif();
    const promisesArray = processPages();
    //console.log(promisesArray);
    passengersArray = await Promise.all(promisesArray);
    //console.log(passengersArray)
    passengersArray.forEach((pageRes) => {
        passengers = {...passengers, ...pageRes};
    })
    //console.log(passengers);
    removeAllChildNodes(loadingWrapper);
    renderTable(passengers);
}

submit.addEventListener("click", showData);