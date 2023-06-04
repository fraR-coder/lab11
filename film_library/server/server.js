'use strict';

const express = require('express');
const morgan = require('morgan'); // logging middleware
const { check, validationResult } = require('express-validator'); // validation middleware
const dao = require('./dao'); // module for accessing the DB
const cors = require('cors');
const passport = require('passport'); // auth middleware
const LocalStrategy = require('passport-local').Strategy; // username and password for login
const session = require('express-session'); // enable sessions
const userDao = require('./user-dao'); // module for accessing the user info in the DB

/*** Set up Passport ***/
// set up the "username and password" login strategy
// by setting a function to verify username and password
passport.use(new LocalStrategy(
  function(username, password, done) {
    userDao.getUser(username, password).then((user) => {
      if (!user)
        return done(null, false, { message: 'Incorrect username and/or password.' });
        
      return done(null, user);
    })
  }
));

// serialize and de-serialize the user (user object <-> session)
// we serialize the user id and we store it in the session: the session is very small in this way
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// starting from the data in the session, we extract the current (logged-in) user
passport.deserializeUser((id, done) => {
  userDao.getUserById(id)
    .then(user => {
      done(null, user); // this will be available in req.user
    }).catch(err => {
      done(err, null);
    });
});


// init express
const app = express();
const port = 3001;

// set-up the middlewares
app.use(morgan('dev'));
app.use(express.json());
const corsOptions = {
  origin: 'http://localhost:5173',
  credentials: true,
};
app.use(cors(corsOptions)); // NB: Usare solo per sviluppo e per l'esame! Altrimenti indicare dominio e porta corretti

const answerDelay = 300;

// custom middleware: check if a given request is coming from an authenticated user
const isLoggedIn = (req, res, next) => {
  if(req.isAuthenticated())
    return next();
  
  return res.status(401).json({ error: 'Not authenticated'});
}

// set up the session
app.use(session({
  // by default, Passport uses a MemoryStore to keep track of the sessions
  secret: 'wge8d239bwd93rkskb',   //personalize this random string, should be a secret value
  resave: false,
  saveUninitialized: false 
}));

// then, init passport
app.use(passport.initialize());
app.use(passport.session());

/*** APIs ***/
// GET /api/films/<id>
app.get('/api/films/:id', async (req, res) => {
  try {
    const result = await dao.getFilm(req.params.id);
    if (result.error)
      res.status(404).json(result);
    else
      res.json(result);
  } catch (err) {
    res.status(500).end();
  }
});


//api get films also with filter
app.get('/api/films',isLoggedIn ,(req, res) => {
  if (!req.user || !req.user.id) {
    res.status(400).json({ error: req.user });
    return;
  }

  dao.listFilms(req.query.filter,req.user.id)
    .then(films => res.json(films))
    .catch(() => res.status(500).end());
});



//POST /api/films
app.post('/api/films',[check('rating').isInt({ min: 0, max: 5 }),
check('title').isLength({ min: 1 })  // as an example
],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }


    const film = {
      filmId: req.body.filmId,
      title: req.body.title,
      favorite: req.body.favorite,
      watchDate: req.body.watchDate,
      rating: req.body.rating,
      userId: req.user.id,
      
    }
    

    dao.addFilm(film)
      .then(id => res.json({ filmId: id }))
      .catch(() => res.status(500).end());


  });




// PUT /api/films/<id>
app.put('/api/films/:id', [check('rating').isInt({ min: 0, max: 5 }),
check('title').isLength({ min: 1 })
 // as an example
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  const film = {
    filmId: req.params.id,
    title: req.body.title,
    favorite: req.body.favorite,
    watchDate: req.body.watchDate,
    rating: req.body.rating,
    userId: req.body.userId,
    
  }
  film.id = req.params.id;

  try {
    const result = await dao.getFilm(film.id);
    if (result.error)
      res.status(404).json(result);
    const numRowChanges = await dao.updateFilm(film);
    res.json(numRowChanges);
  } catch (err) {
    res.status(503).json({ error: `Database error during the update of film ${req.params.id}.` });
  }


});


// PUT /api/films/<id>/rating for updating rating
app.put('/api/films/:id/rating', [check('rating').isInt({ min: 0, max: 5 })]// as an example
  , async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    const rating = req.body.rating;
    // you can also check here if the id passed in the URL matches with the id in req.body,
    // and decide which one must prevail, or return an error
    const id = req.params.id;

    try {
      const result = await dao.getFilm(id);
      if (result.error)
        res.status(404).json(result);
      const numRowChanges = await dao.updateRating(id, rating);
      
      res.json(numRowChanges);
    } catch (err) {
      res.status(503).json({ error: `Database error during the update of film ${req.params.id}.` });
    }


  });


// PUT /api/films/<id>/favorite 
app.put('/api/films/:id/favorite', [check('favorite').isBoolean()]// as an example
  , (req, res) => {
    const favorite = req.body.favorite ? 1 : 0;

    dao.markFavorite(req.params.id, favorite)
      .then(c => res.json(c))
      .catch(() => res.status(500).end());
  });


// DELETE /api/films/<id> 
app.delete('/api/films/:id', [check('id').isInt()]// as an example
  , (req, res) => {
    const id = req.params.id;

    dao.getFilm(id)
      .then(result => {
        if (result.error)
          res.status(404).json(result);
        else {
          dao.deleteFilm(id)
            .then(result => res.json(result))
            .catch(() => res.status(503).json({ error: `Database error during the delete of film ${req.params.id}.` }));
        }
      })
      .catch((err) => res.status(404).json(err));
  });

  /*** Users APIs ***/

// POST /sessions 
// login
app.post('/api/sessions', function(req, res, next) {
  passport.authenticate('local', (err, user, info) => {
    if (err)
      return next(err);
      if (!user) {
        // display wrong login messages
        return res.status(401).json(info);
      }
      // success, perform the login
      req.login(user, (err) => {
        if (err)
          return next(err);
        
        // req.user contains the authenticated user, we send all the user info back
        // this is coming from userDao.getUser()
        return res.json(req.user);
      });
  })(req, res, next);
});

// ALTERNATIVE: if we are not interested in sending error messages...
/*
app.post('/api/sessions', passport.authenticate('local'), (req,res) => {
  // If this function gets called, authentication was successful.
  // `req.user` contains the authenticated user.
  res.json(req.user);
});
*/

// DELETE /sessions/current 
// logout
app.delete('/api/sessions/current', (req, res) => {
  req.logout( ()=> { res.end(); } );
});

// GET /sessions/current
// check whether the user is logged in or not
app.get('/api/sessions/current', (req, res) => {  if(req.isAuthenticated()) {
    res.status(200).json(req.user);}
  else
    res.status(401).json({error: 'Unauthenticated user!'});;
});

// Activate the server
app.listen(port, () => {
  console.log(`react-fl-server listening at http://localhost:${port}`);
});