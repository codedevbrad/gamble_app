import React, { Fragment , useState , useEffect } from 'react';
import Pusher  from 'pusher-js';
import axios   from 'axios';
import { useStore , useActions } from 'easy-peasy';

import StripeCheckout from 'react-stripe-checkout';

import GameAction from './game';

const PlayerGame  = ( props ) => {
        var pusher  = new Pusher( process.env.REACT_APP_PUSHER_CLIENTID , { cluster: 'eu' , forceTLS: true });

        const foundGame   = useStore  ( state   => state.gameFound );
        const changeStage = useActions( actions => actions.gameChange );

        const [ gameChoices , updateChoices ] = useState( [] );
        const [ chosenPoint , pointIsChosen ] = useState( false );
        const [ whichPoint  , changeChosen  ] = useState( false );

        const [ channelName , changeChannel ] = useState('');

        useEffect( () => {
          axios.get( '/game/gamesCanPlay')
             .then( res => {
                  updateChoices( res.data );
                  console.log( res.data );
              })
             .catch( err => console.log( err.response.data ));
              // eslint-disable-next-line
        }, []);

        const changePoint = ( value , place ) => {

            pointIsChosen( value );
            changeChosen ( place );
        }

        const findPlayerGame = ( value , element ) => {

            if ( chosenPoint ) {

              element.innerHTML = 'finding a match';

              axios.post('/game/find_match' , { chosen: value  } )
                    .then ( response => { return response.data } )
                    .then ( outcome  => {
                         // channel id is returned, show game component.
                         changeChannel( outcome.potentialGame );
                         changeStage( true );
                         console.log( outcome );
                    })
                    .catch( err => console.log( err.response.data.msg ) );
            }
        }

        function GameOptions ( props ) {
              const listItems = props.choices.map( ( item , place ) =>

                      <li key={ place } onClick={ e => item.canAccess ? changePoint( item.gamePoints , place ) : null }>

                        { !item.canAccess &&
                          <div className="noAccess"> <span> not enough points </span> </div>
                        }

                        { item.gamePoints } points
                        { whichPoint == place &&
                            <span id="game_point_selected"> selected </span>
                        }
                      </li>
              );
              return <ul className="game_points">
                           { listItems }
                           <li className="find_match_button" onClick={ e => findPlayerGame( chosenPoint , e.target )}> find a match </li>
                     </ul>;
        }

   return (

      <Fragment>
         { !foundGame &&
             <section className="stage_1 find_game">
                <h3> find a game of rock, paper, scissors, lizard, spock </h3>
                <GameOptions choices={ gameChoices }/>
             </section>
         }

         { /* --  matched: each game round  -- */ }
         { foundGame &&
           <GameAction channelName={ channelName }/>
         }
     </Fragment>
   )
}

const PlayerStatistcs = props => {

    const [ rankedPlayers , getRankedPlayers ] = useState( [] );
    const [ rankedPlayer  , updateRanked ]     = useState( { } );

    const refreshRankings = ( ) => {
      axios.get( '/statistics')
         .then( players => {
             getRankedPlayers( players.data.players );
             updateRanked( players.data.yourRanking );
         })
         .catch( err => console.log( err.response.data ));
    }

    useEffect( () => {
      axios.get( '/statistics')
         .then( players => {
              getRankedPlayers( players.data.players );
              updateRanked( players.data.yourRanking );
          })
         .catch( err => console.log( err.response.data ));
          // eslint-disable-next-line
    }, []);

    const winRatio = ( win , games ) => {
       if ( win == 0 && games == 0 ) { return 0 }
       return  Math.round(( win / games ) * 100 );
    }

    return (
      <div id="game_statistics">
          <section id="stats_allPlayers_rank">
              <h1> game rankings </h1>
              <div className="table_scroll">
                  <div className="table">
                      <div className="table_titles th">
                        <div className="td"> rank   </div>
                        <div className="td"> player </div>
                        <div className="td"> g / w  </div>
                        <div className="td"> win ratio  </div>
                        <div className="clear">      </div>
                      </div>

                      { rankedPlayers.map( ( player , key ) =>
                      <div className="tr" key={ key }>
                          <div className="td"> { key + 1 }         </div>
                          <div className="td"> { player.username } </div>
                          <div className="td"> { player.games } / { player.wins }          </div>
                          <div className="td"> { winRatio( player.wins , player.games )} % </div>
                          <div className="ratio"> </div>
                      </div>
                    ) }
                </div>
            </div>
            <h3 id="refresh_leaderboard" onClick={ e => refreshRankings() }> refresh leaderboard </h3>
          </section>
      </div>
    )
}

const PlayerUpgrades  = props => {

  const stripePublicKey = process.env.REACT_APP_STRIPE_PUBLIC_KEY;
  
  // bits a user can buy.
  const [ bitsToBuy  , setBitstoBuy ] = useState( [ ] );
  const updateUserBits = useActions( actions => actions.updatePoints );

    useEffect( () => {
        axios.get ( '/stripe/bitChoices' )
            .then( res  => { return res.data })
            .then( bits => { setBitstoBuy( bits ) })
            .catch( err => console.log( err.response.data ));
       // eslint-disable-next-line
    }, []);

    function Bits ( props ) {

        var bitsChosen = 0;

        var updateBitsSelected = bits => bitsChosen = bits;

        function onToken ( token ) {

            console.log( token , bitsChosen );

            // headers
            const config = { headers: { 'Content-Type': 'application/json' } };
            const toSend = { token , bitsChosen };
            const body   = JSON.stringify( toSend );

            axios.post( '/stripe/paymentMade' , body , config )
                .then( res => res.data )
                .then( recieved => {
                    console.log( 'payment recieved' , recieved );
                    // update bits in client
                    updateUserBits();
                })
                .catch( err => console.log( err.response.data ));
        }

        const bitsLoop = props.bits.map( ( each ) =>
              <div className="inner">
                   <div className="first face">
                        <h3> { each.bits } bits </h3>
                   </div>

                   <div className="second" data-id={ each.bits } onClick={ e => updateBitsSelected( each.bits ) } >
                      <StripeCheckout
                        amount={ each.price * 100 }
                        stripeKey={ stripePublicKey }
                        token={ onToken }
                        label={ "£" + each.price }
                        panelLabel={`purchase`}
                        currency="gbp" />
                   </div>
              </div>
        );
        return <section className="outer" data-id="testme">
                    { bitsLoop }
               </section>
    }

    return (
      <div id="player_upgrades">
          <h1> upgrade your game bits </h1>
          <Bits bits={ bitsToBuy } />
      </div>
    )
}

const ActivePlayers   = props => {

  const activePlayers = useStore  ( state => state.activePlayers );
  const updateActive  = useActions( actions => actions.updateActive );

  window.onbeforeunload = function(event) {
      event.returnValue = "Write something clever here..";
      axios.post('/pusher_me/disconnect' , {} )
            .catch( err => err.response.data.msg );
  };

  useEffect( () => {

        var pusher = new Pusher( process.env.REACT_APP_PUSHER_CLIENTID , {
            cluster: 'eu' , forceTLS: true , authEndpoint: '/pusher/auth'
        });

        var channel = pusher.subscribe('presence-online_players');

        setTimeout( ( ) => {
            axios.post('/pusher_me/join' , {} )
                 .catch( err => err.response.data.msg );
        }, 1000 );

        channel.bind('joined', ( data ) => {

             // socket user
             var logged = channel.members.me.info.username;

             // all users active..
             var members = [ ];

             var response = channel.members.each( ( member ) => {

                 const { username , imgUrl } = member.info;
                 members.push( { username , imgUrl } );
             });
             updateActive( members );
             console.log( 'you are' , logged , members );
        });

        channel.bind("disconnect" , ( data ) => {

              // disconnected user
              var user = data.pinged;
              // all users active..
              var members = [ ];

              var response = channel.members.each( ( member ) => {
                  if ( member.info.username != user ) {
                      const { username , imgUrl } = member.info;
                      members.push( { username , imgUrl } );
                  }
              });
              updateActive( members );
              console.log('player disconnected' , members );
        });

   // eslint-disable-next-line
  }, []);

  return (
       <Fragment>
          <h1> players active </h1>
          <ul className="active_players">
                { activePlayers.map(( player , key) =>
                    <li key={player.username } >
                        <div className="hero_img_circle">
                          <img className="hero_img" src={ player.imgUrl } />
                        </div>
                        <h3  className="active_username"> { player.username } </h3>
                    </li>
                )}
          </ul>
        </Fragment>
  )
}

const Dashboard = ( props ) => {

  const [ dashboardDisplay , setDisplay ] = useState(0);

  const changedash = ( el ) => {
    setDisplay( parseInt( el.getAttribute("data-el") ));
  }

  useEffect( () => {
     console.log( 'component did mount?');
     // eslint-disable-next-line
  }, []);


  return (
    <section className="dashboard">
            { /* --- dashboard navigation --- */ }
            <section className="dash_left_links">
              <section className="dash_section_inner">

                <nav>
                  <ul>
                     <li data-el="0" onClick={ e => changedash( e.target ) }> <span> </span> game statistics </li>
                     <li data-el="1" onClick={ e => changedash( e.target ) }> <span> </span> find a game     </li>
                     <li data-el="2" onClick={ e => changedash( e.target ) }> <span> </span> upgrade points  </li>
                  </ul>
                </nav>
              </section>
            </section>

            { /* --- dashboard game --- */ }
            <section className="dash_midd_section">
                <section className="dash_section_inner inner_fix_padding">
                       { /* --    statistcs   -- */ }
                       { dashboardDisplay === 0 && <PlayerStatistcs /> }

                       { /* ----    game    ---- */ }
                       { dashboardDisplay === 1 && <PlayerGame />      }

                       { /* -- points / boots -- */ }
                       { dashboardDisplay === 2 && <PlayerUpgrades  /> }
                </section>
            </section >

            { /* -- dashboard plyaers online  -- */ }
            <section className="dash_last_chat">
               <section className="dash_section_inner">
                 <ActivePlayers />
               </section>
            </section>

    </section>
  )
}

export default Dashboard;
