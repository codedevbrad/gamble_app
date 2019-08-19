
const express  = require('express');
const path     = require('path');
const mongoose = require('mongoose');
// initalise app
const app    = express();
const server = require('http').createServer(app);
const port   = 5000;

// initialise any middleware / front-end
var config = require('./config/settings.js');

config.middleware( app , __dirname );
config.auth( app , __dirname);

// connect to mblabs
mongoose
  .connect( process.env.DATABASE_ATLAS , { useNewUrlParser: true } )
  .then ( ()  => console.log('mongodb Connected'))
  .catch( err => console.log( err ));


// pass user to all routes ...
app.get('*', ( req , res , next ) => { next(); });

// api route ( main app)
app.use('/', require('./server_Api/api'));
// error middleware
catchError = require('./server_Api/middleware/errors').errors( app );

// start server ...
server.listen(process.env.PORT || port, ( req, res ) => { console.log('server started');
});
