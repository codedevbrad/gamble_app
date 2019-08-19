
const express  = require('express');
const passport = require('passport');
const router   = express.Router();

// strategies
const googleStrategy = require('./middleware/authcheck').googleAuth;

const auth     = require('./middleware/authcheck').auth;
const gameAuth = require('./middleware/gameChecks');

const UserController  = require("./controllers/users" );
const GameController  = require("./controllers/game"  );
const GameStatistics  = require("./controllers/statistics");
const StripeControls  = require("./controllers/stripePayments");

const AdminController = require('./admin/AdminController' );
const TestController  = require('./test/testRoutes');

// test routes
router.post ('/test/' , TestController.firstCheck , TestController.secondCheck );

// user admin route
router.get ('/adminAuth'    , AdminController.admin_bypass );

// user auth route
router.post('/user/register', UserController.user_Register );
router.post('/user/auth'    , UserController.user_Login    );

router.post('/user/google'  , googleStrategy , UserController.user_Login );


router.get('/user/logout'          , auth , UserController.user_Logout );

router.get ('/user'                , auth , UserController.user_get );
router.get ('/user/retrievePoints' , auth , UserController.user_get_points );


// game statistics
router.get( '/statistics'        , auth , GameStatistics.statistics_all );
router.get( '/statistics_custom' , auth , GameStatistics.statistics_custom );

// pusher
router.post('/pusher_me/disconnect'      , GameController.pusher_disconnect );
router.post('/pusher_me/join'     , auth , GameController.pusher_online );
router.post('/pusher/auth'               , GameController.pusher_auth   );
// pusher game route


router.get ('/game/gamesCanPlay'  , auth , GameController.game_optionsToPlay );
router.post('/game/find_match'    , auth , GameController.game_start );

// opponent pings channel for host
router.get ('/game/emit_players'  , auth , GameController.pusher_pingChannel );
// start the round for users
router.get('/game/match_event_h' , auth , GameController.host_game_Round );

// users pick choice between rounds
router.post('/game/match_event_player_choice' , gameAuth.users_submitChoice , GameController.users_submitChoice);

// end of round for oppenent then host
router.post('/game/match_event_end_j' , auth , GameController.joiner_game_endRound );
router.post('/game/match_event_end_h' , auth , GameController.host_game_endRound   );


// pusher upgrades / stripe

router.get ( '/stripe/bitChoices'  , auth , StripeControls.getBits );
router.post( '/stripe/paymentMade' , auth , StripeControls.stripePayment );



module.exports = router;
