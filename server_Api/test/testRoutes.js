const express  = require('express');
const mongoose = require('mongoose');
const Users    = require('../models/user');

module.exports.firstCheck = async( req , res , next ) => {
      const user = req.body;
      const { username , password , imgUrl } = user;

      var saved = await Users.findOne( { username } )
                 .catch( next );

      console.log( 'does need saving' , saved || 'no user' );

      next();
}

module.exports.secondCheck = ( req , res , next ) => {
      console.log( 'looking for user' );
      res.status( 200 ).send( 'msg recieved' );
}


module.exports.googleAuth = async( req , res , next ) => {
    const user = req.body;
    const { username , password , imgUrl } = user;

    var saved = await Users.findOne( { username } )
                  .catch( next );

    console.log( saved );
    console.log( 'end of route');
    res.status( 200 ).send('msg ');
}


// does an async still use
    // .find
    // .catch
