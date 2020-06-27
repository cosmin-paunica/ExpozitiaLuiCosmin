window.onload = function() {
    var cuprins = document.createElement('ul');
    cuprins.setAttribute('id', 'cuprins1');
    var main = document.getElementsByTagName('main')[0];
    var sectiuni = main.getElementsByClassName('sectiune-despre-mine-1');
    let i = 0;  // pentru a contoriza id-urile sectiunilor
    for (let sectiune of sectiuni) {
        var elementLista = document.createElement('li');
        var link = document.createElement('a');
        link.innerHTML = sectiune.getElementsByTagName('h2')[0].innerHTML;
        link.setAttribute('href', '#s' + ++i);
        elementLista.appendChild(link);
        if (sectiune.getElementsByTagName('section').length > 0) {
            var sublista = document.createElement('ul');
            sublista.setAttribute('class', 'cuprins2');
            var subsectiuni = sectiune.getElementsByClassName('sectiune-despre-mine-2');
            let j = 0;  // pentru a contoriza id-urile subsectiunilor
            for (let subsectiune of subsectiuni) {
                var elementSublista = document.createElement('li');
                var sublink = document.createElement('a');
                sublink.innerHTML = subsectiune.getElementsByTagName('h3')[0].innerHTML;
                sublink.setAttribute('href', '#s' + i + '.' + ++j);
                elementSublista.appendChild(sublink);
                sublista.appendChild(elementSublista);
            }
            elementLista.appendChild(sublista);
        }
        cuprins.appendChild(elementLista);
    }
    main.insertBefore(cuprins, main.firstChild.nextSibling);
};