var par1 = document.getElementById('s2.1').getElementsByTagName('p')[0];
var par2 = document.getElementById('s2.2').getElementsByTagName('p')[0];
var par3 = document.getElementById('s2.2').getElementsByTagName('p')[1];

var paragrafe = [par1, par2, par3];
aparitieTreptataCuvant(paragrafe);

function aparitieTreptataCuvant(paragrafe) {
    var texte = [];
    for (let i = 0; i < paragrafe.length; i++) {
        texte[i] = paragrafe[i].innerHTML;
        paragrafe[i].innerHTML = '';
    }
    aparitieTreptataCuvantAux(paragrafe, texte, 0);
}

function aparitieTreptataCuvantAux(paragrafe, texte, i) {
    if (i == paragrafe.length)
        return;

    var arrText = texte[i].split(' ');
    let j = 0;
    let interval = setInterval(function() {
        paragrafe[i].innerHTML += arrText[j++] + ' ';
        if (j == arrText.length) {
            clearInterval(interval);
            aparitieTreptataCuvantAux(paragrafe, texte, i + 1);
        }
    }, 333);
}