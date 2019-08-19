
const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');
const passport = require('passport');
const Image    = require('../models/images');
const Users    = require('../models/user');


exports.user_google = ( req , res , next ) => {

   const { username , password , } = req.body;
   
   // simple validation
   if ( !username || !password ) {
         throw new Error( 'missing username or password' );
   }
   passport.authenticate('local', ( err , user , info ) => {
         if ( err || !user ) { return res.status(500).send({ msg: 'username or password is incorrect' }) }

         req.logIn( user,  ( err ) => {
           if (err) { return res.status(500).send({ msg: 'username or password is incorrect' })  }
           res.status(200).json( user);
         });
       }) ( req , res , next );
}

exports.user_Register = ( req , res , next ) => {
   // @route  : POST user/register
   // @dec    : register new Users
   // @access : public to all.
   const { username , password } = req.body;


   if ( !username || !password  ) {
           throw new Error('missing username or password');
   }
   Users.findOne( { username } )
      .then ( user => {
           if (user ) {
             throw new Error('username is already taken');
           }
           else {
             const imgUrl  = Image.randomImg();
             const newUser = new Users({ username , password , imgUrl });

             // encypt the plaintext password
             bcrypt.genSalt( 10 , ( err , salt ) => {
                    bcrypt.hash(newUser.password, salt, ( err, hash ) => {

                        if( err ) { throw new Error('something went wrong') }

                        newUser.password = hash;
                        newUser.save()
                            .then( user => {
                              passport.authenticate('local', ( err , user , info ) => {
                                    if ( err || !user ) { return res.status(500).send({ msg: 'authentication error' }) }

                                    req.logIn( user,  ( err ) => {
                                      if (err) { return res.status(500).send('authentication error'); }
                                      res.status(200).json( user);
                                    });
                                  }) ( req , res , next );
                            })
                            .catch( next );
                    });
             });
           }
       })
       .catch( next );
}

exports.user_Login = ( req , res , next ) => {
    // @route  : POST user/auth
    // @dec    : authenticate user login
    // @access : public to all.
    const { username , password } = req.body;
    // simple validation
    if ( !username || !password ) {
          throw new Error( 'missing username or password' );
    }
    passport.authenticate('local', ( err , user , info ) => {
          if ( err || !user ) { return res.status(500).send({ msg: 'username or password is incorrect' }) }

          req.logIn( user,  ( err ) => {
            if (err) { return res.status(500).send({ msg: 'username or password is incorrect' })  }
            res.status(200).json( user);
          });
        }) ( req , res , next );
}


exports.user_Logout = ( req , res , next ) => {
    req.logout();

    if ( req.user ) {  throw new Error('something went wrong with logging out');  }
    res.status(200).json( { logout: true} );
}

exports.user_get = ( req, res, next ) => {
    console.log( req.user.username );
    Users.findById( { _id: req.user._id } )
      .select('-password')
       .then( user => {
         if ( !user ) { throw new Error('no user found'); }
         res.status( 200 ).json( user );
       })
       .catch( next );
}

exports.user_get_points = ( req , res , next ) => {
    Users.findById( { _id: req.user._id } )
       .select('-password')
          .then( user => {
            if ( !user ) { throw new Error('points couldnt be retrieved'); }
            res.status( 200 ).json( user.points );
          })
          .catch( next );
}
