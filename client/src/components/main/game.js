import React, { Fragment , useState , useEffect } from 'react';
import Pusher  from 'pusher-js';
import axios   from 'axios';

import { gameFunctions } from '../gameControls/client_gameFunctions';

import { useStore , useActions } from 'easy-peasy';

const GameAction  = ( props ) => {

  var pusher = new Pusher( process.env.REACT_APP_PUSHER_CLIENTID, { cluster: 'eu' , forceTLS: true });

  // error
  const logError   = useActions( actions => actions.logError );

  // round
  var [ opponent    , foundOpponent ] = useState( false );
  var [ roundChoice , newChoice     ] = useState( '');
  var [ roundStats  , setRoundStat  ] = useState( 0 );

  // game over
  var [ gameResult_msg , updateGameResult ] = useState( { } );
  const updatePP    = useActions( actions => actions.updatePoints );

  const changeStage = useActions( actions => actions.gameChange);

  // game
  const channelName = props.channelName;
  const user        = useStore( state => state.user );

  // should probably do a get request for this.
  const userIsLead  = channelName.includes( user.username ) ? true : false;

  var game    = pusher.subscribe( props.channelName );

  const changeChoice = ( val ) => {
      console.log( roundStats );
      newChoice( val );
      axios.post('/game/match_event_player_choice?channel=' + channelName , { choice: val } )
          .then( choiceMade => {
              console.log( 'made a choice' );
          })
          .catch( err => { console.log( err.response.data.msg ) });
  }


  // opponent triggers on join. host needs to know when opponent joins.
  const emitToChannel = ( ) => {
      axios.get('/game/emit_players?channelName=' + channelName )
            .then ( res => { console.log('ping cleared server');  })
            .catch( err => { console.log( err.response.data.msg ) });
  }

  const exit_game = ( ) => {
       changeStage( false );
  }

  // component mounts on load ...
  useEffect( () => {
        console.log( 'game mounted' , channelName , userIsLead );
        // ping server to notify host of opponent joining
        if ( !userIsLead ) {
            console.log('opponent has hit the route');
            emitToChannel();
            // game joiner: get the username of the opponent ...
            const opponentName = /(\_-.*?\-_)/.exec( channelName );
            const opponentTrim = opponentName[0].replace( /_-|-_|&/g , "");
            foundOpponent( { username: opponentTrim });
        }

        // channel method for host. a host cannot ping joiner.
        game.bind('players_have_joined' , data => {
            console.log('player pinged' , data );
            if ( userIsLead ) {
               foundOpponent( { username: data.user } );
               setTimeout( () => {
                  console.log('host is pinging to start round');
                  // tell server to start the game since opponent has joined.
                  axios.get( '/game/match_event_h?channel='+ channelName )
                    .catch( err => { console.log( err.response.data.msg ) });
               }, 5000 );
            }
        });
        // 3 rounds at a 60 second interval.
        game.bind('match_round_start' , data => {
            // show game choices , start countdown for ui ..
            console.log ( 'game started:' , data.game_round_started );
            setRoundStat( data.game_round_started );

            var elem     = document.getElementById("myBar");
            var timeHtml = document.getElementById('countdown');
            gameFunctions.showGameProgress( timeHtml , elem );

        }); // eslint-disable-next-line

        // opponent send choice to server ..
        game.bind('match_round_end' , data => {

             if ( !userIsLead ) {
                   axios.post('/game/match_event_end_j?channel='+ channelName , { } )
                       .catch( err => console.log( err.response.data.msg));
             }
        });

        // host sends choice after opponent has
        game.bind('match_round_end_h_canSend' , data => {

            if ( userIsLead ) {
                  axios.post('/game/match_event_end_h?channel='+ channelName , { } )
                      .catch( err => {  console.log( err.response.data.msg ) });
            }
        });

        // end of each round results
        game.bind('match_round_turnover' , data => {
            // host restarts game
            if ( userIsLead ) {
                 axios.get( '/game/match_event_h?channel='+ channelName )
                      .catch( err => console.log( err.response.data.msg ));
            }
            // update game round progressBar
             var gameProgressBar = document.getElementById('gameProgress');

             var currentRound = data.round_number;

             if ( currentRound == 1 ) { gameProgressBar.style.width = 33  + '%'; }
             if ( currentRound == 2 ) { gameProgressBar.style.width = 66  + '%'; }
             if ( currentRound == 3 ) { gameProgressBar.style.width = 100 + '%'; }

             // winner for either client and host , opp choices
             var winner      = data.winner;
             var choiceHost  = data.choices[0];
             var choiceOpp   = data.choices[1];

             // get current round and show as win / loss
             var currentRoundBar = document.getElementById('game_result').querySelector('ul');
             var roundClientRes  = document.createElement('li');
             var clientRes_title = document.createElement('span');

             if ( winner == 2 ) { clientRes_title.classList.add( 'draw' );
                                  clientRes_title.innerHTML = 'draw';
                                }
             // if true , host wins / opp loses.
             // we cant just show true to both clients. we need to know what true is for each client.
             if ( winner != 2 ) {
                   // if host - show win else show loss ...
                   if (  userIsLead ) { clientRes_title.classList.add( winner.hostWon ? 'win' : 'loss' );
                                        winner.hostWon ? clientRes_title.innerHTML = 'win'
                                                       : clientRes_title.innerHTML = 'loss';
                   }
                   // if opp - show loss else show win ...
                   if ( !userIsLead ) { clientRes_title.classList.add( winner.oppWon ? 'win' : 'loss' );
                                        clientRes_title.innerHTML = 'loss';
                                        winner.oppWon ? clientRes_title.innerHTML = 'win'
                                                      : clientRes_title.innerHTML = 'loss';
                   }
             }
             roundClientRes.appendChild ( clientRes_title );
             currentRoundBar.appendChild( roundClientRes  );
             console.log('round' , data.round_number , 'winner is: ', data.winner , 'game_score: ', data.game_stats);
        });

        game.bind('match_has_ended' , data => {

              console.log( 'match has ended' , data );
              pusher.unsubscribe( channelName );

              if ( data ) { updatePP(); }

              var timeHtml = document.getElementById('countdown');
              timeHtml.innerHTML = 'match has ended';
              // show if win / loss / draw - data.result / data.didDraw
              var obj = { };

              if ( data.didDraw ) {
                 obj = { res: 'you tied' , msg: 'you have been awarded ' , points: 50 , classShow: 'tie' };
                 updateGameResult( obj );
              }
              else if ( !data.didDraw ) {
                 // messages
                 var msgs = [ [ 'congrats, you won the game' , 'you have been awarded ' ] ,
                              [ 'unlucky, you lost the game' , 'you have lost ' ] ];

                 var win  = { res: msgs[0][0] , msg: msgs[0][1] };
                 var loss = { res: msgs[1][0] , msg: msgs[1][1] };

                 // if true , host client is winner / opp loses
                 data.result ?
                     // show win for host client , loss for opp
                     userIsLead  ? obj = { messages: win  , classShow: 'winner' }
                                 : obj = { messages: loss , classShow: 'loss'   }
                 :
                    // show win for opp client , loss for host
                    !userIsLead ? obj = { messages: win  , classShow: 'winner' }
                                : obj = { messages: loss , classShow: 'loss'   }
                 obj.points = data.toAward;
                 console.log( gameResult_msg );
                 updateGameResult( obj );
              }
        });
  }, []);

  return (
    <Fragment>
        <section className="stage_2 game_matched">

            { !Object.keys( gameResult_msg ).length === false &&
              <section className="game_matchFinish_results">
                 <div id="result" className={ gameResult_msg.classShow }>
                    <h3> { gameResult_msg.messages.res } </h3>
                    <p>  { gameResult_msg.messages.msg }
                         <span> { gameResult_msg.points } </span>
                         points >
                    </p>
                    <div className="exit_game" onClick={ e => exit_game() }> <h3> return to main menu </h3> </div>
                 </div>
              </section>
            }

            <section className="game_matched_head">
                <div>
                    <h3> game of rock , paper , scissors , lizard , spock </h3>

                    <div id="myProgress" className="progress_bar_contain">
                        <div id="countdown"> game not found yet  </div>
                        <div id="myBar" className="progress_bar"></div>
                    </div>

                    <div id="gameCount" className="progress_bar_contain">
                        <li className="gameStage_stage_1"> </li>
                        <li className="gameStage_stage_2"> </li>

                        <div id="gameProgress" className="progress_bar"> </div>
                    </div>

                    <div id="game_result">
                        <ul>
                        </ul>
                    </div>
               </div>
            </section>

            <section className="game_matched_opponents">
                  <section id="gm_opponents_inner">
                        <div>
                            <div className="opponent"> { user.username } </div>
                        </div>
                        <div> vs </div>
                        <div>
                            <div className="opponent">
                             { opponent ? opponent.username : 'waiting for opponent' }
                             </div>
                        </div>
                  </section>
            </section>

          { !opponent ? (
            <section className="game_matched_stats seperated_sections">
               <div>
               </div>
            </section>
          ) : (
            <section className="game_match_choices seperated_sections">
               <div>
                  <div className="choices left" >
                        <ul>
                           <li className="top" onClick={ e => changeChoice('rock'    ) }> <div> <i class="far fa-hand-rock">    </i> </div> </li>
                           <li className="top" onClick={ e => changeChoice('paper'   ) }> <div> <i class="far fa-hand-paper">   </i> </div> </li>
                           <li onClick={ e => changeChoice('scissors') }>                 <div> <i class="far fa-hand-scissors"></i> </div> </li>
                           <li onClick={ e => changeChoice('lizard'  ) }>                 <div> <i class="far fa-hand-lizard">  </i> </div> </li>
                           <li className="last" onClick={ e => changeChoice('spock'   ) }><div> <i class="far fa-hand-spock">   </i> </div> </li>
                        </ul>
                  </div>
                  <div className="showGameChoices right" >
                        <h3> round:  { roundStats } / 3 </h3>
                        <h3> choice: { roundChoice }    </h3>
                   </div>
               </div>
            </section>
          )}

        </section>
     </Fragment>
  )
}

export default GameAction;
