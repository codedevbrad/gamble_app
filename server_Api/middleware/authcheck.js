
const express  = require('express');
const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const Users    = require('../models/user');

module.exports.auth = ( req, res, next ) => {
    // if user is auth & finished > return to route
    if   ( req.isAuthenticated() && req.user ) { return next();  }
    else { throw new Error('not authenticated') }
}

module.exports.googleAuth = async( req , res , next ) => {

  const { username , password , imgUrl } = req.body;

  console.log( 'hit route' , username );

  var saved = await Users.findOne( { username } )
             .then ( user => {

                 if ( !user ) {
                    console.log( 'no user ' );
                    const newUser = new Users( { username , password , imgUrl } );

                    bcrypt.genSalt( 10 , ( err , salt ) => {
                           bcrypt.hash( newUser.password, salt, ( err, hash ) => {

                               if( err ) { throw new Error('something went wrong') }

                               newUser.password = hash;
                               newUser.save()
                                  .then ( user => console.log( 'saved user'))
                                   .catch( next );
                           });
                    });
                 }
             })
             .catch( next );
   next();
}
