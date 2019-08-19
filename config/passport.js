

const LocalStrategy = require('passport-local').Strategy;
const config = process.env.DATABASE_ATLAS;
const bcrypt = require('bcryptjs')

var User = require('../server_Api/models/user')

module.exports = function(passport) {

  // local Strategy
  passport.use(new LocalStrategy(function(username, password, done) {

    var query = { username:username };

    User.findOne(query, function(err, user)   {
      if( err)  { throw err;  }
      if(!user) { return done(null, false );  }

      // match password
      bcrypt.compare(password, user.password, function(err, isMatch) {
        if( err)    { throw err;   }
        if(isMatch) { return done(null, user);   }
       else         { return done(null, false ); }

      });

    });
  }));

  passport.serializeUser(function(user, done) { done(null, user.id);  });

  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {  done(err, user);  });
  });

};
