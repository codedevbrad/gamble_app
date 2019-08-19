
module.exports.errors = function( app ) {

  // error 500
  app.use( ( err , req , res , next ) => {

     const errorPrint = JSON.stringify( err ).substring(0, 50);


     console.log( 'unexpected error' , err );
     res.status( err.status || 500   );
     res.json( { msg : err.message } );
  });
}
