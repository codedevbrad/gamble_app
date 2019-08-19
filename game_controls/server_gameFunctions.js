
const hands  = require('./choices');
const points = require('./points');

module.exports.game = {

    isValidPoint: ( given ) => {
        if ( !points.includes( given ) ) {
          return false
        };
        return true;
    },

    choiceOptions: ( given ) => {
        if ( !hands.includes( given ) ) {
           return false;
        }
        return true;
    },

    compareChoices: ( userA , userB ) => {
            var result  = [2, true , false];

            // rock  > scissors and lizard
            // paper > rock and spock
            // sciss > paper and lizard
            // lizz  > paper and spock
            // spock > scissors and rock

             var index1 = hands.indexOf( userA );
             var index2 = hands.indexOf( userB );

             var dif = index2 - index1;

             if   ( dif < 0 ) { dif += hands.length; }
             while( dif > 2 ) { dif -= 2; }
             return result[dif];
    }
}
