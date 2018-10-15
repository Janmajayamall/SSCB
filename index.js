'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');

const server = express();

//Define Intent Requests

//Intents for Directions
const requestDirectionsIdConfirmed = 'Request Directions - ID Confirmed'; // reply enter again
const requestDirectionsIDNotConfirmedEnteredAgain = 'Request Directions - ID Not Confirmed - Entered Again';  // reply enter again
const requestDirectionsIdConfirmedNotFound = 'Request Directions - ID confirmed - Not Found'; // reply call helpline

//Intents for Contact-info
const requestContactInfo = 'Request Contact-info'

// Define Intent Requests end


server.use(bodyParser.urlencoded({
    extended:true
}));

server.use(bodyParser.json());

server.post('/get-info', (req, res)=>{

    const intent = req.body.queryResult &&  req.body.queryResult.intent && req.body.queryResult.intent.displayName ? 
                                                                            req.body.queryResult.intent.displayName : null;
    

    //Response according to intent
    if (intent === requestDirectionsIdConfirmed || intent === requestDirectionsIDNotConfirmedEnteredAgain || intent === requestDirectionsIdConfirmedNotFound){

            const bookingID = null;

            if (intent === requestDirectionsIdConfirmed){
                bookingID = req.body.queryResult &&  req.body.queryResult.outputContexts[0].lifespanCount === 2  ? 
                                                                        req.body.queryResult.outputContexts[1].parameters.bookingID : null;
            } else if (intent === requestDirectionsIDNotConfirmedEnteredAgain){
                bookingID = req.body.queryResult &&  req.body.queryResult.parameters && req.body.queryResult.parameters.bookingID ? 
                                                                                    req.body.queryResult.parameters.bookingID : null;
            } else if (intent === requestDirectionsIdConfirmedNotFound) {
                bookingID = req.body.queryResult &&  req.body.queryResult.outputContexts  ? 
                                                                        req.body.queryResult.outputContexts[0].parameters.bookingID : null;
            }

            const bookingID = req.body.queryResult &&  req.body.queryResult.parameters && req.body.queryResult.parameters.bookingID ? 
                                                                                            req.body.queryResult.parameters.bookingID : null;
            const reqURL = encodeURI(`http://internal.bukitvista.com/tools/api/integromatcancelation/${bookingID}`);

            http.get(reqURL, (responseFromAPI)=>{
                let completeResponse = '';
                        responseFromAPI.on('data', (chunk)=>{
                        completeResponse += chunk;
                    });

                responseFromAPI.on('end', ()=>{

                let customerDetails = '';

                // Try and catch block if the value is JSON; if JSON then pass on, other throw and error for cathc block
                try{
                JSON.parse(completeResponse);

                } catch(e){
                    return res.json({
                    fulfillmentText: 'Sorry we could not find you in our guest database, try again?',
                    source: 'get-directions'
                    });
                }
                // End of try catch;    The value recieved is JSON.

                customerDetails = JSON.parse(completeResponse);
                let sscbResponse = `Hi, ${customerDetails.booking_guest_name}. ${customerDetails.property_direction}.`;
                return res.json({
                    fulfillmentText: sscbResponse,
                    source: 'get-directions'});
                    })
                }, (error)=>{
                    return res.json({
                    fulfillmentText: 'Sorry we could not find you in our guest database, try again?',
                    source: 'get-directions'
                    });
                });
    }
    else if (intent === requestContactInfo){
            const bookingID = req.body.queryResult &&  req.body.queryResult.parameters && req.body.queryResult.parameters.bookingID ? 
                                                                                            req.body.queryResult.parameters.bookingID : null;
            const reqURL = encodeURI(`http://internal.bukitvista.com/tools/api/integromatcancelation/${bookingID}`);

            http.get(reqURL, (responseFromAPI)=>{
                let completeResponse = '';
                        responseFromAPI.on('data', (chunk)=>{
                        completeResponse += chunk;
                    });

                responseFromAPI.on('end', ()=>{

                let customerDetails = '';

                // Try and catch block if the value is JSON; if JSON then pass on, other throw and error for cathc block
                try{
                JSON.parse(completeResponse);

                } catch(e){
                    return res.json({
                    fulfillmentText: 'Sorry we could not find you in our guest database, try again?',
                    source: 'get-directions'
                    });
                }
                // End of try catch;    The value recieved is JSON.

                customerDetails = JSON.parse(completeResponse);
                let sscbResponse = `Hi, ${customerDetails.booking_guest_name}. Your booking reference is ${customerDetails.booking_guest_phone}.`;
                return res.json({
                    fulfillmentText: sscbResponse,
                    source: 'get-directions'});
                    })
                }, (error)=>{
                    return res.json({
                    fulfillmentText: 'Sorry we could not find you in our guest database, try again?',
                    source: 'get-directions'
                    });
                });
    }

  
      
    });



server.listen((process.env.PORT || 8000), ()=>{
    console.log("Server is up and running!");
});