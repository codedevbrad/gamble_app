
const mongoose = require('mongoose');
const express  = require('express');
const stripe   = require('stripe') ( process.env.stripe_secretKey );
const Users    = require('../models/user');

const bitsPurchases = require('../../game_controls/bitsPurchases');

module.exports.getBits = ( req , res , next ) => {
    res.status( 200 ).json( bitsPurchases );
}

module.exports.stripePayment = ( req , res , next ) => {
    // check bits make is correct / not fraudulent
    const { token , bitsChosen } = req.body;

    // get price of bit
    var bitsMatched = bitsPurchases.find( each => each.bits === bitsChosen );

    if (!bitsMatched || bitsMatched === 'undefined' ) {
        throw new Error('error purchasing bits');
    }

    const body = { amount: ( bitsMatched.price * 100 ) , currency: 'gbp',
                   description: `${ bitsMatched.bits} bits charge`, source: token.id,
    };

    stripe.charges.create( body , ( ( response ) => ( err , success ) => {
            if ( err ) { res.status(500).send({ error: err }); }

            if ( success ) {
                  Users.findByIdAndUpdate( req.user.id , { $inc: { points: bitsMatched.bits } } , { new: true })
                     .then( success => {
                        res.status(200).send({ success: true , purchased: bitsMatched.bits });
                     })
                     .catch( next );
            }
    }) () );
}
