var url = require('url');
var bodyParser = require('body-parser');
var express = require('express'); 
var blockcypher = require('./blockcypher.js');
var backend = require('./backend.js');

var app = express();
var port = process.env.PORT || 1337;

// HTML Pages
var balance_page = 'html/balance.html';
var error_page = 'html/error.html';
var index_page = 'html/index.html';

app.use(express.static(__dirname + '/'));
app.use(bodyParser.urlencoded({ extend: true }));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.set('views', __dirname);

app.get('/', function (req, res) {
    //Print out the index page
    res.render(index_page);

    // initialize the backend
    backend.connect()
        .then((res) => {
            console.log(res);
        })
        .catch((err) => {
            console.log(err);
        });
})

app.get('/query', function (req, res) {

    // Grab the user input
    var address = url.parse(req.url, true).query.address;

    blockcypher.getBalance(address)
        .then((result) => {
            res.render(balance_page, { balance: result.toString() });
            res.end();
        })
        .catch((err) => {
            console.log("ERROR IS: "+ err);
            res.render(error_page, err);
            res.end();
        });
})

app.post('/send', function (req, res) {

    // Grab user input
    var from = url.parse(req.url, true).query.sender;
    var to = url.parse(req.url, true).query.reciever;
    var amount = url.parse(req.url, true).query.amount;
    var publicKey = url.parse(req.url, true).query.publicKey;
    var privateKey = url.parse(req.url, true).query.privateKey;

    // Basic validation
    if (true) {

        //helper.sendBitcoin(amount, to, from, publicKey, privateKey);
        blockcypher.sendBitcoin(0.000001, 'mtXWDB6k5yC5v7TcwKZHB89SUp85yCKshy', 'mk4UNSVkZzLmDHpkKne6NqdNeWh1wEQTFk', '024b29ecd2fb40f0725d0bff6c811c785352e176e31d1c79a661fd14c0c0bee0a8', 'ece0a01195ad3289f6f4a90276d5e8e06e40a8e5f315c98794e24dc305301282')
            .then( (result) => {
                console.log(result);
                res.render(balance_page, { balance: result.toString() });
                res.end();
            })
            .catch((err) => {
                console.log(err);
                res.render(error_page, err);
                res.end();
            });
    } else {
        res.render(error_page, { error: 'Missing inputs' });
        res.end();
    }
})
  
app.listen(port, () => console.log('Listening on port ' + port));


//var testAddr = 'mtXWDB6k5yC5v7TcwKZHB89SUp85yCKshy';

/* Dummy info
 * "private": "ece0a01195ad3289f6f4a90276d5e8e06e40a8e5f315c98794e24dc305301282"
 * "public": "024b29ecd2fb40f0725d0bff6c811c785352e176e31d1c79a661fd14c0c0bee0a8"
 * "address": "mk4UNSVkZzLmDHpkKne6NqdNeWh1wEQTFk"
 * "wif": "cVXAFxQHYHiF2GgTjPymxas7Ypgyv3Y4LUz6gGUXA1QtCtbz5EeA"
 */

// 17xpHyQQSUHBF3sHnpJYXEcv41z3NuGLJu