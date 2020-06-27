window.onload = function() {
    var ajaxRequest = new XMLHttpRequest();

    ajaxRequest.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var obJson = JSON.parse(this.responseText);
            afiseazaJsonTemplate(obJson);
        }
    };

    ajaxRequest.open('GET', '/json/poze.json', true);
    ajaxRequest.send();

    function afiseazaJsonTemplate(obJson) {
        var container = document.getElementById('poze');
        var apl = document.getElementById('apl');
        var locatii = [];
        var frecventaLocatii = new Object();
        var frecventaAni = new Object();

        if (!localStorage.bife)
            localStorage.bife = '[]';
        if (!localStorage.nrBifeApasate)
            localStorage.nrBifeApasate = '0';

        // -----afisarea pozelor din fisierul json + alte prelucrari-----
        for (let i = 0; i < obJson.poze.length; i++) {
            if (Number(localStorage.nrBifeApasate) == 0 || localStorage.bife.includes(obJson.poze[i].locatie)) {
                container.innerHTML += ejs.render(
                    '<figure>\
                        <img class="poza" src="imagini/poze/<%= poza.nume %>" />\
                        <ul class="info-poze">\
                            <li><%= poza.descriere %></li>\
                            <li>Locația: <%= poza.locatie %></li>\
                            <li>Data: <%= poza.data %></li>\
                        </ul>\
                    </figure>', {poza: obJson.poze[i]}
                );
            }
            if (!locatii.find(function(u) { return obJson.poze[i].locatie == u }))
                locatii.push(obJson.poze[i].locatie);

            if (frecventaLocatii[obJson.poze[i].locatie])
                frecventaLocatii[obJson.poze[i].locatie] += 1;
            else
                frecventaLocatii[obJson.poze[i].locatie] = 1;
            
            if (frecventaAni[Number(obJson.poze[i].data.substring(6))])
                frecventaAni[obJson.poze[i].locatie] += 1;
            else
                frecventaAni[Number(obJson.poze[i].data.substring(6))] = 1;
        }
        // ----------

        // -----calcularea celei mai frecvente locatii si celui mai frecvent an-----
        var maxLocatie;
        var nrMaxLocatie;
        for (let x of Object.keys(frecventaLocatii))
            if (!maxLocatie || nrMaxLocatie < frecventaLocatii[x]) {
                maxLocatie = x;
                nrMaxLocatie = frecventaLocatii[x];
            }
        document.getElementById('max-locatie').innerHTML += maxLocatie + '.';

        var maxAn;
        var nrMaxAn;
        for (let x of Object.keys(frecventaAni))
            if (!maxAn || nrMaxAn < frecventaAni[x]) {
                maxAn = x;
                nrMaxAn = frecventaAni[x];
            }
        document.getElementById('max-an').innerHTML += maxAn + '.';
        // -----

        // -----afisarea negativului pozelor la alt+click-----
        for (let img of container.getElementsByClassName('poza'))
            img.onclick = function(e) {
                if (e.altKey)
                    if (!this.style.filter)
                        this.style.filter = 'invert(1)';
                    else
                        this.style.filter = '';
            }
        // ----------

        // -----crearea de checkbox-uri pentru filtrare dupa locatie-----
        if (!localStorage.bife)
            localStorage.bife = '[]';
        if (!localStorage.nrBifeApasate)
            localStorage.nrBifeApasate = '0';
        let k = 0;
        for (let l of locatii) {
            let cbox = document.createElement('input');
            cbox.setAttribute('type', 'checkbox');
            cbox.setAttribute('id', 'cbox' + ++k);
            cbox.style.marginRight = '5px';
            let label = document.createElement('label');
            label.setAttribute('for', 'cbox' + k);
            label.innerHTML = l;

            if (localStorage.bife.includes(l)) {
                cbox.checked = true;
                label.style.backgroundColor = 'green';
                label.style.color = 'white';
            }

            cbox.onclick = function() {
                if (this.checked) {
                    localStorage.nrBifeApasate = Number(localStorage.nrBifeApasate) + 1;
                    let arrBife = JSON.parse(localStorage.bife);
                    arrBife.push(l);
                    localStorage.bife = JSON.stringify(arrBife);

                    label.style.backgroundColor = 'green';
                    label.style.color = 'white';
                }
                else {
                    localStorage.nrBifeApasate = Number(localStorage.nrBifeApasate) - 1;
                    let arrBife = JSON.parse(localStorage.bife);
                    removeByValue(arrBife, l);
                    localStorage.bife = JSON.stringify(arrBife);

                    label.style.backgroundColor = 'red';
                    setTimeout(function() {
                        if (!cbox.checked) {
                            label.style.backgroundColor = '';
                            label.style.color = '';
                        }
                    }, 1500);
                }

                container.innerHTML = '';
                for (let poza of obJson.poze)
                    if (localStorage.nrBifeApasate == 0 || localStorage.bife.includes(poza.locatie)) {
                        let newPoza = creazaPoza(poza);
                        container.appendChild(newPoza);
                    }
            }

            apl.insertBefore(document.createElement('br'), document.getElementById('par-filtrare-locatie').nextSibling);
            apl.insertBefore(label, document.getElementById('par-filtrare-locatie').nextSibling);
            apl.insertBefore(cbox, document.getElementById('par-filtrare-locatie').nextSibling);
        }
        // ----------

        // -----sortare-----
        document.getElementById('sort-locatie').onclick = function() {
            container.innerHTML = '';
            obJson.poze.sort(function(poza1, poza2) {
                return poza1.locatie.localeCompare(poza2.locatie);
            })

            for (let poza of obJson.poze)
                if (localStorage.nrBifeApasate == 0 || localStorage.bife.includes(poza.locatie)) {
                    let newPoza = creazaPoza(poza);
                    container.appendChild(newPoza);
                }
        }

        document.getElementById('sort-data').onclick = function() {
            container.innerHTML = '';
            obJson.poze.sort(function(poza1, poza2) {
                if (Number(poza1.data.substring(6)) < Number(poza2.data.substring(6)))
                    return -1;
                else if (Number(poza1.data.substring(6)) > Number(poza2.data.substring(6)))
                    return 1;
                else if (Number(poza1.data.substring(3, 5)) < Number(poza2.data.substring(3, 5)))
                    return -1;
                else if (Number(poza1.data.substring(3, 5)) > Number(poza2.data.substring(3, 5)))
                    return 1;
                else if (Number(poza1.data.substring(0, 2)) < Number(poza2.data.substring(0, 2)))
                    return -1;
                else if (Number(poza1.data.substring(0, 2)) > Number(poza2.data.substring(0, 2)))
                    return 1;
                return 0;
            })

            for (let poza of obJson.poze)
                if (localStorage.nrBifeApasate == 0 || localStorage.bife.includes(poza.locatie)) {
                    let newPoza = creazaPoza(poza);
                    container.appendChild(newPoza);
                }
        }
        // ----------
    }

    // -----paragraf cu noutati-----
    var arrNoutati = [
        "Tura foto Delta Explorer 8 va avea loc între 22-25 august 2019.",
        "Salonul Fotografului Român, ediția a VI-a, are loc la TNB. Data este deocamdată neanunțată.",
        "Noul cod aerian al României a fost aprobat."
    ];
    var culori = [['green', 'white'], ['blue', 'white'], ['yellow', 'black'], ['purple', 'white'], ['orange', 'black']];
    var parNoutati = document.getElementById('noutate');
    parNoutati.innerHTML = arrNoutati[0];
    let nr = nrRandom(culori.length);
    parNoutati.style.backgroundColor = culori[nr][0];
    parNoutati.style.color = culori[nr][1];

    var j = 0;
    setInterval(function() {
        j = (j + 1) % arrNoutati.length;
        parNoutati.innerHTML = arrNoutati[j];

        let newNr = nrRandom(culori.length);
        while (newNr == nr)
            newNr = nrRandom(culori.length);
        parNoutati.style.backgroundColor = culori[newNr][0];
        parNoutati.style.color = culori[newNr][1];
        nr = newNr;
    }, 5000);
    // ----------
}

function removeByValue(arr, val) {
    for (let i = 0; i < arr.length; i++)
        if (arr[i] == val)
            arr.splice(i, 1);
}

function creazaPoza(obPoza) {
    var figure = document.createElement('figure');

    var img = document.createElement('img');
    img.setAttribute('class', 'poza');
    img.setAttribute('src', 'imagini/poze/' + obPoza.nume);
    figure.appendChild(img);

    var ul = document.createElement('ul');
    ul.setAttribute('class', 'info-poze');
    var li1 = document.createElement('li');
    li1.innerHTML = obPoza.descriere;
    var li2 = document.createElement('li');
    li2.innerHTML = 'Locația: ' + obPoza.locatie;
    var li3 = document.createElement('li');
    li3.innerHTML = 'Data: ' + obPoza.data;
    ul.appendChild(li1);
    ul.appendChild(li2);
    ul.appendChild(li3);

    figure.appendChild(ul);

    return figure;
}

function nrRandom(max) {
    return Math.floor(Math.random() * max);
}