const express  = require('express');
const mongoose = require('mongoose');
const Channels = require('../models/channel');

exports.users_submitChoice = ( req , res , next ) => {

    const channel_Id  = req.query.channel;

    Channels.findOne( { channel_Id })
        .then( channel => {

              if ( !channel ) { throw new Error('couldnt find channel') }
              // update choice of
              if ( req.user.username == channel.gameHost ) {
                   console.log( 'host of game');
                   req.body.gameHost = true;
              }
              if ( req.user.username == channel.opponent ) {
                   console.log( 'opponent of game');
                   req.body.gameHost = false;
              }
              return next();
        })
        .catch( next );
}
