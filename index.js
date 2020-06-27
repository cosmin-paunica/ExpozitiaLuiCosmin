var formidable = require('formidable');
var crypto = require('crypto');
var session = require('express-session');
var fs= require('fs');
var express = require('express');   //include modulul express memorand in variabila express obiectul asociat modulului (exportat de modul)
var path = require('path');
var app = express();                //aici avem serverul

app.set('view engine', 'ejs');  // pentru folosirea ejs-ului

console.log(__dirname);
app.use(express.static(path.join(__dirname, 'resurse')));
// de acum, caile catre fisiere statice vor fi scrise relativ la folderul resurse

app.use(session({
    secret: 'cheie_sesiune',
    resave: true,
    saveUninitialized: false
}));
// de acum, toate requesturile vor avea si proprietatea session (req.session) (acelasi obiect pentru toate requesturile)

// ----------TRATARE CERERI POST----------

app.post('/inregistrare', function(req, res) {
    var formular = new formidable.IncomingForm();
    formular.parse(req, function(err, fields, files) {
        // in fields, proprietatile sunt valorile atributelor name din inputurile din formular

        if (fields.parola != fields.rparola) {
            var errorMessage = 'Parolele nu coincid.';
            console.log(errorMessage);
            res.render("html/inregistrare", {error: errorMessage});
        }
        else {
            console.log('inregistrare username ' + fields.username);
            fisierUseri = fs.readFileSync('useri.json');
            var algoritmCriptare = crypto.createCipher('aes-128-cbc', 'parola_criptare');
            var parolaCriptata = algoritmCriptare.update(fields.parola, 'utf-8', 'hex');
            parolaCriptata += algoritmCriptare.final('hex');

            obUseri = JSON.parse(fisierUseri);
            var utiliz = obUseri.useri.find(function(u) {
                return u.username == fields.username;
            });
            if (utiliz) {
                var errorMessage = 'Username-ul ales este deja folosit.';
                console.log(errorMessage);
                res.render("html/inregistrare", {error: errorMessage});
            }
            else {
                var userNou = {
                    id: ++obUseri.lastId,
                    username: fields.username,
                    prenume: fields.prenume,
                    nume: fields.nume,
                    email: fields.email,
                    parola: parolaCriptata,
                    dataInregistrare: new Date(),
                    rol: 'user',
                    experienta: fields.experienta == 'on' ? true : false
                };
                obUseri.useri.push(userNou);
                var jsonNou = JSON.stringify(obUseri);
                fs.writeFileSync('useri.json', jsonNou);
                res.redirect('/');
            }
        }
    });
});

app.post('/login', function(req, res) {
	var formular= new formidable.IncomingForm();
	formular.parse(req, function(err, fields, files) {
		fisierUseri=fs.readFileSync("useri.json");
		var algoritmCriptare=crypto.createCipher('aes-128-cbc',"parola_criptare");
		var parolaCriptata=algoritmCriptare.update(fields.parola, "utf-8", "hex");
        parolaCriptata+=algoritmCriptare.final("hex");
        
		obUseri= JSON.parse(fisierUseri);
	    var utiliz = obUseri.useri.find(function(u) {
		    return u.username == fields.username && parolaCriptata == u.parola;
	    });
		
		if(utiliz) {
			req.session.utilizator=utiliz;
			console.log("login cu username-ul " + utiliz.username);
            res.render("html/index", {username: utiliz.username, prenume: utiliz.prenume, nume: utiliz.nume});
		}
		else {
            var errorMessage = "Username sau parolă greșită.";
			console.log(errorMessage);
            res.render("html/login", {error: errorMessage});
		}
	});
});

// ----------

// ----------TRATARE CERERI GET----------

app.get('/logout', function(req, res) {
    console.log('logout');
    req.session.destroy();
    res.redirect('/');
});

app.get('/', function(req, res) {
    var usernameUtiliz = req.session ? (req.session.utilizator ? req.session.utilizator.username : null) : null;
    var prenumeUtiliz = req.session ? (req.session.utilizator ? req.session.utilizator.prenume : null) : null;
    var numeUtiliz = req.session ? (req.session.utilizator ? req.session.utilizator.nume : null) : null;
    res.render('html/index', {username: usernameUtiliz, prenume: prenumeUtiliz, nume: numeUtiliz});
});

app.get("/*", function(req,res) {
    console.log(req.url);
	var usernameUtiliz = req.session? (req.session.utilizator? req.session.utilizator.username : null) : null;
    var prenumeUtiliz = req.session ? (req.session.utilizator ? req.session.utilizator.prenume : null) : null;
    var numeUtiliz = req.session ? (req.session.utilizator ? req.session.utilizator.nume : null) : null;
	res.render('html' + req.url, {username: usernameUtiliz, prenume: prenumeUtiliz, nume: numeUtiliz}, function(err, textRandare) {
		if (err) {
			if (err.message.includes("Failed to lookup view")) {
                var pagini = fs.readdirSync('views/html/');
                var paginiSimilare = [];
                for (let pagina of pagini) {
                    if (Math.abs(req.url.substring(1).length - pagina.length) <= 1 && editDistance(req.url.substring(1), pagina) <= 1)
                        paginiSimilare.push(pagina);
                }
                return res.status(404).render("html/404", {username: usernameUtiliz, prenume: prenumeUtiliz, nume: numeUtiliz, paginiSimilare: paginiSimilare});
            }
			else
				throw err;
		}
		res.send(textRandare);
	});
});

// ----------

function editDistance(c1, c2) {
    m = c1.length;
    n = c2.length;
    var T = [];
    for (let i = 0; i <= m; i++) {
        T[i] = [];
        for (let j = 0; j <= n; j++)
            T[i][j] = 0;
    }
    
    for (let j = 0; j <= n; j++)
        T[0][j] = j;
    for (let i = 0; i <= m; i++)
        T[i][0] = i;
    
    for (let i = 1; i <= m; i++)
        for (let j = 1; j <= n; j++)
            if (c1[i-1] == c2[j-1])
                T[i][j] = T[i-1][j-1];
            else
                T[i][j] = Math.min(T[i][j-1], T[i-1][j-1], T[i-1][j]) + 1;
    
    return T[m][n];
}

app.listen(8080);
console.log('Aplicatia se deschide pe portul 8080');
