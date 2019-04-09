
const myTwilioNumber = '+1 201 800 6022';


var express = require('express');
var bodyParser = require('body-parser');


var app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.set(`view engine`, `ejs`);


var AccessToken = require('twilio').jwt.AccessToken;
const ClientCapability = require('twilio').jwt.ClientCapability;
const VoiceResponse = require('twilio').twiml.VoiceResponse;

const ChatGrant = AccessToken.ChatGrant;

// Used when generating any kind of tokens
const twilioAccountSid = 'ACa7ee7fcbbf51a01bbb1e362ee98dacd0';
const twilioApiKey = 'SK90205611d47708f8bd04a75fcc77d8d1';
const twilioApiSecret = 'wbsDfDo5M7YiGYrz2seKw6Hp1eK8sPhD';
const authToken = '3e411ddb2ef0ff3498f864815ac77cfc'

app.use(bodyParser.json())


////////////////Message //////////////////////

const client = require('twilio')(twilioAccountSid, authToken)

app.post('/message/token', (req, res) => {
    let messageId;
    const To = req.body.To
    const Body = req.body.Body

    client.messages.create({
        to: To,
        from: '+1 201 800 6022',
        body: Body
        // mediaUrl: 'http://i.imgur.com/1958hGJ.gif'
    }).then(msg => {
        messageId = msg.id;
        console.log(msg.id, 'msg id')
    })

    res.send(messageId)
})


/////////////voice calls //////////////

// put your Twilio Application Sid here


app.get('/voice/capability/token', (req, res) => {

    const appSid = 'APeac453365b1b77c4e235c1462e3f3957';

    const capability = new ClientCapability({
        accountSid: twilioAccountSid,
        authToken: authToken,
    });

    capability.addScope(new ClientCapability.OutgoingClientScope({ applicationSid: appSid }));

    capability.addScope(new ClientCapability.IncomingClientScope('+919671581175'));

    const voiceToken = capability.toJwt();


    res.set('Content-Type', 'application/jwt');
    console.log(' ----------------------Voice -token----------------------------', voiceToken)

    res.send(voiceToken);
})


app.post('/voice', (req, res) => {
    console.log(req.body, 'request')

    const CallerID = req.body.From
    const CalleeId = req.body.To

    // Create TwiML response
    const twiml = new VoiceResponse();

    twiml.say('Thanks for calling!');
    const Dial = twiml.dial({
        callerId: CallerID
    })
    Dial.number(CalleeId)

    res.set('Content-Type', 'text/xml');
    console.log("twiml.toString()   ", twiml.toString())
    res.send(twiml.toString());
});



const token = new AccessToken(twilioAccountSid, twilioApiKey, twilioApiSecret);
////////////////// VIDEO - CALl /////////

app.get('/video/capability/token', (req, res) => {

    var VideoGrant = AccessToken.VideoGrant;
    console.log(req.query.identity, ' req.query.identity')
    // Grant access to Video
    var grant = new VideoGrant();
    token.addGrant(grant);
    token.identity = req.query.identity;

    // Serialize the token as a JWT
    var jwt = token.toJwt();
    console.log(jwt, '/////////// - Video-token-////////////////');
    res.send(jwt)

})





// // Used specifically for creating IP Messaging tokens
// const serviceSid = 'IS386beb37c8a0409bb7aac8706fc8e75f';
// const identity = 'kamlesh.bhadanitech@gmail.com';

// Create a "grant" which enables a client to use IPM as a given user,
// on a given device

// Create an access token which we will sign and return to the client,
// containing the grant we just created
// const token = new AccessToken(twilioAccountSid, twilioApiKey, twilioApiSecret);

// app.get('/ChatAccessToken', (req, res) => {
//     console.log(req.query.identity)

//     token.addGrant(new ChatGrant({
//         serviceSid: "IS386beb37c8a0409bb7aac8706fc8e75f"
//     }));
//     token.identity = req.query.identity;

//     console.log('------------------chat-token------------------', token.toJwt(), '------------------chat-token------------------');
//     res.send(token.toJwt())

//     // Serialize the token to a JWT string
// });


//server running port 8081
var server = app.listen(8080, function () {
    var host = server.address().address
    var port = server.address().port

    console.log("Example app listening at http://%s:%s", host, port)
});

