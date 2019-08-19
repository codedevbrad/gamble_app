const mongoose = require('mongoose');
const express  = require('express');
const passport = require('passport');
const Admin    = require('../models/user');

// get a list of available id's from admin database

exports.admin_authCheck = ( req , res , next ) => {
    // if user is auth & finished > return to route
    if   ( req.isAuthenticated() && req.user && req.user.isAdmin ) { return next();  }
    else { throw new Error('not admin and not authenticated') }
}

exports.admin_bypass = ( req , res , next ) => {
   Admin.findById( { _id: '12345' } )
     .select('-password')
      .then( user => {
        if ( !user ) {  throw new Error('no user found'); }
        res.json( user );
      })
      .catch( next );
}
