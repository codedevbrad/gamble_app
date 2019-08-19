const mongoose = require('mongoose');
const Schema   = mongoose.Schema;

// user schema object
const UserSchema = new Schema ({
  username:   { type: String , required: true },
  password:   { type: String , required: true },
  points:     { type: Number , default:  1500 , minimum: 0 },
  imgUrl:     { type: String },

  wins:   { type: Number , default: 0 } ,
  games:  { type: Number , default: 0 }
});

module.exports = User = mongoose.model('users', UserSchema );
