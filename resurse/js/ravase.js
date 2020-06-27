var ravase = [
    'O să iei 10 la Tehnici Web!',
    'O să vină multe ploi răcoroase!',
    'Anul acesta vei câștiga la loterie!',
    'România va câștiga Cupa Mondială în următoarele 2 milenii!'
]

window.onload = function() {
    var par = document.getElementById('random');
    par.innerHTML = ravase[nrRandom(ravase.length)];
}

function nrRandom(n) {
    return Math.floor(Math.random() * n);
}