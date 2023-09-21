// index.js

/*  EXPRESS */

const express = require('express');
const app = express();
const session = require('express-session');
var fs = require('fs');


app.use(session({
  resave: false,
  saveUninitialized: true,
  secret: 'SECRET' 
}));

app.use(express.static(__dirname + '/pages')); // Supponendo che i file HTML siano nella directory 'public'

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/views/pages/auth.html');
});

const port = process.env.PORT || 3000;
app.listen(port , () => console.log('App listening on port ' + port));

app.get('/dati.json', (req, res) => {
  // Leggi il file dati.json e invialo come risposta
  fs.readFile(__dirname + '/dati.json', 'utf8', (err, data) => {
    if (err) {
      // Gestisci eventuali errori di lettura del file
      console.error(err);
      res.status(500).send('Errore nel recupero dei dati');
    } else {
      // Invia il contenuto del file JSON come risposta
      res.json(JSON.parse(data));
    }
  });
});



/*  PASSPORT SETUP  */

const passport = require('passport');
var userProfile;

app.use(passport.initialize());
app.use(passport.session());


app.get('/success', (req, res) => res.sendFile(__dirname + '/pages/success.html'));

app.get('/error', (req, res) => res.send("error logging in"));

passport.serializeUser(function(user, cb) {
  cb(null, user);
});

passport.deserializeUser(function(obj, cb) {
  cb(null, obj);
});

/*  Google AUTH  */
 
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const GOOGLE_CLIENT_ID = "983233638133-joaqnb4ebi00ium1tt5eoa3hpe8p50bh.apps.googleusercontent.com";
const GOOGLE_CLIENT_SECRET = "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";
passport.use(new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/callback"
  },
  function(accessToken, refreshToken, profile, done) {
      userProfile=profile;
      return done(null, userProfile);
  }
));
 
app.get('/auth/google', 
  passport.authenticate('google', { scope : ['profile', 'email'] }));
 
app.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/error' }),
  function(req, res) {
    // Successful authentication, redirect success.

    var dictstring = JSON.stringify(userProfile,null,2);
    fs.writeFileSync("dati.json", dictstring);
    res.sendFile(__dirname + '/views/pages/success.html');


  });