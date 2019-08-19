
import { action , thunk } from 'easy-peasy';
import Pusher from 'pusher-js';
import axios  from 'axios';

export default {

  getkeys: action( ( state , keys ) => {

  }),

  pusherKey: { }  ,
  googleKey: { }  ,
  got_Keys: false ,
  
  isLoading:  true ,

  // user auth
  authError: { },
  isUserAuth: false ,
  user:      { } ,

  // errors
  error:     { } ,

  // matches against player.
  gameFound: false ,


  activePlayers: [ ] ,

  // active Players
  updateActive: action(( state , array ) => {
     state.activePlayers = array;
  }),


  // actions ( game reducer )

  gameChange:  action(( state , boolean ) => {
     state.gameFound = boolean;
  }),


  // actions ( bits reducer )

  updatePoints: thunk(( action ) => {

      axios.get( '/user/retrievePoints')
         .then ( points => {
            action.changePoints( points.data );
         })
         .catch( err => console.log(err.response.data));
  }),


  changePoints: action(( state , points ) => {
      state.user.points = points;
  }),

  // actions ( statistics )

  updateRankings: action(( state , value ) => {

  }),

  // actions ( upgrade points )


  // actions ( user reducer )

  loginUser: thunk(( actions , user )     => {
    // headers
    const config = { headers: { 'Content-Type': 'application/json' } };
    const body   = JSON.stringify( user );

    axios.post('/user/auth', body , config )
      .then ( res => { return res.data })
      .then ( obj => {
         console.log( obj );
         actions.authenticate( obj );
      })
      .catch( err => {
        actions.logAuthError( err.response.data);
        console.log( err.response.data );
      });
  }),

  registerUser: thunk(( actions , user ) => {
    // headers
    const config = { headers: { 'Content-Type': 'application/json' } };
    const body   = JSON.stringify( user );

    axios.post('/user/register', body , config)
      .then ( res => { return res.data })
      .then ( obj => {
         console.log( obj );
         actions.authenticate( obj );
      })
      .catch( err => {
        actions.logAuthError( err.response.data);
        console.log( err.response.data );
      });
  }),

  logoutUser: thunk( actions => {

      axios.get('user/logout')
         .then( succsess => {
            actions.removeUser();
         })
         .catch( err => console.log( err.response.data ) );
  }),

  getUser: thunk( actions => {
    axios.get('/user')
      .then ( res  => res.data )
      .then ( obj  => {
          console.log( obj );
          actions.authenticate( obj );
      })
      .catch( err  => {
          console.log(err.response.data.msg);
          actions.logError( { err: err.response.data.msg });
      });
  }),


  // actions ( error reducer )

  // error for login / register
  logAuthError: action(( state , error ) => {
    state.authError = error;
  }),

  logError: action(( state , error ) => {
    state.error = error;
  }),

  clearError: action(( state ) => {
    state.error = {};
  }),

  clearAllErrors: action(( state ) => {
    state.error = {};
    state.authError = {};
  }),


  // actions ( user reducer )

  authenticate: action(( state , user ) => {
      state.isUserAuth = true;
      state.user = user;
  }),

  removeUser: action(( state ) => {
      state.isUserAuth = false;
      state.user = { };
  })
};
