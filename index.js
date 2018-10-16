'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');

const server = express();

//Define Intent Requests

//Intents for Directions
const requestDirectionsIDConfirmed = 'Request Directions - ID Confirmed'; // reply enter again
const requestDirectionsIDNotConfirmedEnteredAgain = 'Request Directions - ID Not Confirmed - Entered Again';  // reply enter again
const requestDirectionsIDConfirmedNotFoundLast = 'Request Directions - ID Confirmed - Not Found - Last'; // reply call helpline
const requestDirectionsIDNotConfirmedEnteredAgainNotFoundLast = 'Request Directions - ID Not Confirmed - Entered Again - Not Found - Last'; // reply call helpline

//Intents for Contact
const requestContactIDConfirmed = 'Request Contact - ID Confirmed'; // reply enter again
const requestContactIDNotConfirmedEnteredAgain = 'Request Contact - ID Not Confirmed - Entered Again';  // reply enter again
const requestContactIDConfirmedNotFoundLast = 'Request Contact - ID Confirmed - Not Found - Last'; // reply call helpline
const requestContactIDNotConfirmedEnteredAgainNotFoundLast = 'Request Contact - ID Not Confirmed - Entered Again - Not Found - Last'; // reply call helpline


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

    // Intent Request Directions
    if (intent === requestDirectionsIDConfirmed || intent === requestDirectionsIDNotConfirmedEnteredAgain || intent === requestDirectionsIDConfirmedNotFoundLast || intent === requestDirectionsIDNotConfirmedEnteredAgainNotFoundLast){

        let bookingID = null;

            if (intent === requestDirectionsIDConfirmed){
                
                bookingID = req.body.queryResult &&  req.body.queryResult.outputContexts[0].lifespanCount === 2  ? 
                                                                        req.body.queryResult.outputContexts[1].parameters.bookingID : null;
            } else if (intent === requestDirectionsIDNotConfirmedEnteredAgain){
                bookingID = req.body.queryResult &&  req.body.queryResult.parameters && req.body.queryResult.parameters.bookingID ? 
                                                                                    req.body.queryResult.parameters.bookingID : null;
            } else if (intent === requestDirectionsIDConfirmedNotFoundLast) {
                bookingID = req.body.queryResult &&  req.body.queryResult.outputContexts  ? 
                                                                        req.body.queryResult.outputContexts[0].parameters.bookingID : null;
            } else if (intent === requestDirectionsIDNotConfirmedEnteredAgainNotFoundLast){
                bookingID = req.body.queryResult &&  req.body.queryResult.parameters && req.body.queryResult.parameters.bookingID ? 
                                                                                    req.body.queryResult.parameters.bookingID : null;
            }

            

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

                    if(intent === requestDirectionsIDConfirmedNotFoundLast || intent == requestDirectionsIDNotConfirmedEnteredAgainNotFoundLast){
                        return res.json({
                            fulfillmentText: 'Please call helpline!',
                            source: 'get-directions'
                            });
                    }else {
                        return res.json({
                            fulfillmentText: 'Sorry we could not find you in our guest database, try again?',
                            source: 'get-directions'
                            });
                        }  
                }
                // End of try catch;    The value recieved is JSON.


                // Reading the returned json
                customerDetails = JSON.parse(completeResponse);
                let sscbResponse = `Hi, ${customerDetails.booking_guest_name}. ${customerDetails.property_direction}.`;
                return res.json({
                    fulfillmentText: sscbResponse,
                    source: 'get-directions'});
                    })
                }, (error)=>{
                    //Checking if it is not the ending intent -- Ending intent should present helpline number
                    if(intent === requestDirectionsIdConfirmedNotFoundLast || intent == requestDirectionsIDNotConfirmedEnteredAgainNotFoundLast){
                        return res.json({
                            fulfillmentText: 'Please call helpline!',
                            source: 'get-directions'
                            });
                    }else {
                        return res.json({
                            fulfillmentText: 'Sorry we could not find you in our guest database, try again?',
                            source: 'get-directions'
                            });
                        }  
                });
    }




    // Intent request contact info
    else if (intent === requestContactIDConfirmed || intent === requestContactIDNotConfirmedEnteredAgain || intent === requestContactIDConfirmedNotFoundLast || intent === requestContactIDNotConfirmedEnteredAgainNotFoundLast){

        let bookingID = null;
    
            if (intent === requestContactIDConfirmed){
                
                bookingID = req.body.queryResult &&  req.body.queryResult.outputContexts[0].lifespanCount === 2  ? 
                                                                        req.body.queryResult.outputContexts[1].parameters.bookingID : null;
            } else if (intent === requestContactIDNotConfirmedEnteredAgain){
                bookingID = req.body.queryResult &&  req.body.queryResult.parameters && req.body.queryResult.parameters.bookingID ? 
                                                                                    req.body.queryResult.parameters.bookingID : null;
            } else if (intent === requestContactIDConfirmedNotFoundLast) {
                bookingID = req.body.queryResult &&  req.body.queryResult.outputContexts  ? 
                                                                        req.body.queryResult.outputContexts[0].parameters.bookingID : null;
            }
    
            
    
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
    
                    if(intent === requestContactIDConfirmedNotFoundLast || intent == requestContactIDNotConfirmedEnteredAgainNotFoundLast){
                        return res.json({
                            fulfillmentText: 'Please call helpline!',
                            source: 'get-contact'
                            });
                    }else {
                        return res.json({
                            fulfillmentText: 'Sorry we could not find you in our guest database, try again?',
                            source: 'get-contact'
                            });
                        }  
                }
                // End of try catch;    The value recieved is JSON.
    
    
                // Reading the returned json
                customerDetails = JSON.parse(completeResponse);
                let sscbResponse = `Hi, ${customerDetails.booking_guest_name}. ${customerDetails.booking_guest_phone}.`;
                return res.json({
                    fulfillmentText: sscbResponse,
                    source: 'get-contact'});
                    })
                }, (error)=>{
                    //Checking if it is not the ending intent -- Ending intent should present helpline number
                    if(intent === requestDirectionsIdConfirmedNotFoundLast || intent == requestContactIDNotConfirmedEnteredAgainNotFoundLast){
                        return res.json({
                            fulfillmentText: 'Please call helpline!',
                            source: 'get-contact'
                            });
                    }else {
                        return res.json({
                            fulfillmentText: 'Sorry we could not find you in our guest database, try again?',
                            source: 'get-contact'
                            });
                        }  
                });
    }

  
      
    });



server.listen((process.env.PORT || 8000), ()=>{
    console.log("Server is up and running!");
});