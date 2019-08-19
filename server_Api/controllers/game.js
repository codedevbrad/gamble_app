
const mongoose = require('mongoose');
const Pusher   = require('pusher');
const crypto   = require('crypto');

const session  = require('express-session');
const Channels = require('../models/channel');
const Users    = require('../models/user');

const pusher   = require('../../config/settings.js').pusher();

// game controls
const hands  = require('../../game_controls/choices');
const game   = require('../../game_controls/server_gameFunctions').game;
const points = require('../../game_controls/points');

exports.pusher_auth = ( req , res , next ) => {
    console.log( 'hit pusher auth' );
    var socketId = req.body.socket_id;
    var channel  = req.body.channel_name;
    var presenceData = {
      user_id: req.user.id ,
      user_info: { username: req.user.username ,
                   imgUrl:   req.user.imgUrl
                 }
    }

    var auth = pusher.authenticate( socketId , channel , presenceData );
    res.send( auth );
}

exports.pusher_disconnect = ( req , res , next ) => {

    pusher.trigger('presence-online_players', 'disconnect', { "pinged": req.user.username } );
    res.status( 200 ).end();
}

exports.pusher_online = ( req , res , next ) => {
    console.log( 'connected to pusher online channel');
    var user = req.user.username;
    pusher.trigger('presence-online_players', 'joined', { "pinged": true } );

    res.status(200).json( { joined: true } );
}

exports.pusher_pingChannel = ( req , res , next ) => {
    console.log( 'emmiting message to match' , req.query.channelName );
    const username = req.user.username;
    // emit user to channel
    pusher.trigger( req.query.channelName , 'players_have_joined', { "user": username  } );
    res.status(200).end();
}

exports.game_optionsToPlay = ( req , res , next ) => {

    var updatedOptions = points.map( ( eachVal ) => {
				return { gamePoints: eachVal , canAccess: req.user.points > eachVal };
    });
    res.status( 200 ).send( updatedOptions );
}

exports.game_start = ( req , res , next ) => {
    const chosen = req.body.chosen;
    // if not within points , less than points , no points chosen.
    if ( !game.isValidPoint( chosen ) || !chosen || chosen > req.user.points ) {
         throw new Error('the points chosen were invalid');
    }
    // if points fall within range and user has enough points
    if ( game.isValidPoint( chosen ) && req.user ) {

          // points are valid.
          // search for active game channels with points category.
          pusher.get({ path: '/channels', params: {} }, ( error , request , response ) => {

                if ( error ) { throw new Error('pusher was unable to connect'); }
                if ( response.statusCode === 200 ) {
                      var result       = JSON.parse( response.body);
                      var channels     = result.channels;
                      var points_award = chosen.toString();

                      var channelsOpen = Object.keys( channels );
                      // find an open game channel & exclude joining channel of its username
                      var found = channelsOpen.filter( ( each ) => {
                          return each.includes( '@game_')
                             && !each.includes( req.user.username )
                              && each.includes( '@points_'+ points_award );
                      });

                      // creates a new game channel
                      if ( found.length == 0 ) {

                          var gameHost = req.user.username;

                          var channel_Id = '@game_' + '@points_'
                                           + points_award + '_-' + gameHost + '-_'
                                           + crypto.randomBytes(11).toString('hex');

                          const newChannel = new Channels( {
                                gameHost     ,
                                channel_Id   ,
                                points_award ,
                                game_score: [ 0 ,0 ]
                          });

                          newChannel.save()
                             .then( channel => {
                                res.status(200).json({ open: found , newGame: true , potentialGame: channel_Id });
                             })
                             .catch( next );
                      }
                      else {
                          const game = found[ Math.floor( Math.random() * found.length ) ];
                          const opponent = req.user.username;

                          Channels.findOneAndUpdate( { channel_Id: game } , { opponent }, { new: true } )
                              .then( channel => {
                                       if (!channel) { throw new Error('chouldnt find the channel. sorry') }
                                       res.status(200).json( { open: found , newGame: false , potentialGame: game } );
                              })
                              .catch( next );
                      }
                 }
          });
    }
}

const asyncMiddleware = fn => ( req , res , next ) => {
       Promise.resolve( fn( req , res , next ))
        .catch( next );
};

// each round start

exports.host_game_Round = ( req , res , next ) => {
    const channel_Id = req.query.channel;

    // start game for both users
    Channels.findOneAndUpdate( { channel_Id } , { $inc:   { game_count: 1 } }, { new: true } )
        .then ( asyncMiddleware( async( channel ) => {

               if ( !channel ) { throw new Error('couldnt find channel')}
               const count = channel.game_count;

               if ( count <= 3 ) {
                    pusher.trigger( channel.channel_Id , 'match_round_start',  { "game_round_started": count } );
                    // 60 second round
                    setTimeout( () => {
                        pusher.trigger( channel.channel_Id , 'match_round_end' , { "msg": "end of round" });
                        res.status(200).end();
                   }, 20000 );
              }
              else if ( channel.game_count == 4 ) {
                   // look at win / loss statistics and perform points for users
                   function decider ( host , opp ) {
                        if ( host > opp   ) { return true  }
                        if ( host < opp   ) { return false }
                        if ( host === opp ) { return null  }
                   }
                   var compareGame = decider( channel.game_score[0] , channel.game_score[1] );
                   var didDraw = false;
                   var result  = { };
                   var toAward = channel.points_award;

                   if ( compareGame == null ) { didDraw = true; console.log('did draw');
                                                 result = { a: channel.gameHost , b: channel.opponent };
                   }
                   if ( compareGame != null ) {  result = compareGame ? { a: channel.gameHost , b: channel.opponent }
                                                                      : { a: channel.opponent , b: channel.gameHost }
                   }
                   console.log( channel.game_score , didDraw , compareGame , result );

                   function flatPoints ( points ) {
                    		if ( req.user.points - points <= 0 ) { return 0; }
                        else { return req.user.points - points; }
                    }

                   // update winner and loser or draw for both users.
                   try {
                       var winner = await Users.findOneAndUpdate( { username: result.a } ,
                                    didDraw ? { $inc: { points: 50 , games: 1 }}
                                            : { $inc: { points: toAward , games: 1 , wins: 1 }} ,
                                              { new: true })
                                              .catch( next );

                       var aLoser = await Users.findOneAndUpdate( { username: result.b } ,
                                    didDraw ? { $inc: { points: 50 , games: 1 }}
                                            : { $inc: { games: 1 } , points: flatPoints( toAward ) } ,
                                              { new: true })
                                              .catch( next );

                       if ( !winner || !aLoser ) { throw new Error('couldnt find user'); }

                       pusher.trigger( channel_Id , 'match_has_ended', {
                         "didDraw" : didDraw     ,
                         "result"  : compareGame ,
                         "toAward" : toAward
                       });
                       res.status(200).end();
                   }
                   catch ( e ) {
                      next(e);
                   }
              }
        }))
        .catch( next );
};

// middle of round: users make choice
exports.users_submitChoice = ( req , res , next ) => {

    const channel_Id = req.query.channel;
    const userChoice = req.body.choice;
    const isHost     = req.body.gameHost;

    Channels.findOneAndUpdate( { channel_Id } , isHost ? { gameHost_choice: userChoice } : { opp_choice: userChoice }, { new: true } )
       .then( channel => {
         if ( !channel ) { throw new Error('couldnt find channel')}
         res.status( 200 ).end();
       })
       .catch( next );
}

// end of round: joiner shows their round is finished.
exports.joiner_game_endRound = ( req , res , next ) => {

    const channel_Id   = req.query.channel;
    pusher.trigger( channel_Id , 'match_round_end_h_canSend', { "msg": "joiner choice locked" } );
    res.status( 200 ).end();
}

// end of round: host confirms opponent finished and compares choices locked.
exports.host_game_endRound = ( req , res , next ) => {

     const channel_Id = req.query.channel;

     Channels.findOne( { channel_Id } )
          .then ( channel => {
               if ( !channel ) { throw new Error('couldnt find channel')};

               // gameHost and opponent choices
               const hostChoice = channel.gameHost_choice;
               const oppChoice  = channel.opp_choice;

               // winner of round: update game score
               const roundBuff = game.compareChoices( hostChoice , oppChoice );

               var roundWinner = false;
               var gameScore   = channel.game_score;

               // if roundDraw
               if ( roundBuff == 2 ) { roundWinner = 2; }

               // round won or lost
               if ( roundBuff != 2 ) {
                  roundBuff ? gameScore[ 0 ] += 1 : gameScore[ 1 ] += 1;
                  roundWinner = roundBuff ? { hostWon: true } : { oppWon: true };
               }

               // if error from wrong game decision , then throw error

               // save changes.
               Channels.findOneAndUpdate( { channel_Id } , { game_score: gameScore } , { new: true })
                   .then( saved => {
                         console.log( roundWinner );
                         // push winner and game score to clients.
                         pusher.trigger( channel_Id , 'match_round_turnover', {
                             "choices":      [ hostChoice , oppChoice ] ,
                             "winner":       roundWinner ,
                             "round_number": channel.game_count ,
                             "game_stats":   channel.game_score
                         });
                         res.status(200).end();
                   })
                   .catch( next );
          })
          .catch( next );
}
