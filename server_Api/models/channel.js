const mongoose = require('mongoose');
const Schema   = mongoose.Schema;

// user schema object
const ChannelSchema = new Schema ({
    channel_Id:    { type: String , required: true },

    gameHost:        { type: String },
    gameHost_choice: { type: String , default: 'false' },

    opponent:      { type: String },
    opp_choice:    { type: String , default: 'false' },

    game_count:    { type: Number , default:  0    },
    game_score:    [ ],

    points_award:  { type: Number , required: true },

});

module.exports = Channels = mongoose.model('channels', ChannelSchema );
