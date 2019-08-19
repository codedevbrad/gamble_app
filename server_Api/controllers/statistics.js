

const mongoose = require('mongoose');
const Users    = require('../models/user');

exports.statistics_all = ( req , res , next ) => {
     Users.find( )
          .sort ({ wins: - 1 })
          .limit( 10 )
          .then( users => {
              if ( !users ) { throw new Error('rankings error') };

              function strippedPlayers () {
                  return users.map(function( { username , games , wins } ) {
                      return { username ,  games , wins } ;
                  });
              }
              const yourRanking = { username: req.user.username , games: req.user.games , wins: req.user.wins };
              // strip player to username , game , wins
              res.status( 200 ).json( { yourRanking , players: strippedPlayers() } );
          })
          .catch( next );
}

exports.statistics_custom = ( req , res , next ) => {

}
