var nav = document.getElementsByClassName('meniu')[0];
var hrefCurent = window.location.href;
if (hrefCurent[hrefCurent.length - 1] == '/')
    nav.getElementsByTagName('a')[0].classList.add('pagina-curenta');
else
    for (let a of nav.getElementsByTagName('a'))
        if (hrefCurent == a.href)
            a.classList.add('pagina-curenta');