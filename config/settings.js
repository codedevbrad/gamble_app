const express  = require('express');
const path     = require('path');
const session  = require('express-session');
const cors     = require('cors');
const passport = require('passport');
const bodyParser = require('body-parser');

const Pusher   = require('pusher');

// passport strategys
require('./passport') ( passport );

module.exports = {

    middleware: function ( app ) {
      // body parser middleware
      app.use(express.urlencoded({ extended: true }))
      // parse application/json
      app.use(express.json());
      app.use(cors());
    },

    auth: function( app ) {
      app.use(session ({
        secret: 'keyboard cat',
        cookie: { maxAge: 960000,  _expires : 500000 },
        resave: true, saveUninitialized: true, rolling: true
      }));
      app.use( passport.initialize());
      app.use( passport.session());
    },

    pusher: (  ) => {
      // var pusher = new Pusher ;
      // return pusher; 
      return new Pusher({
        appId:  process.env.pusherAppId  ,
        key:    process.env.pusherClient ,
        secret: process.env.pusherSecret  ,
        cluster: 'eu',
        encrypted: true
      });
    }
}
