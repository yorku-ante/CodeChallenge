const request = require('request');
var https = require('https');
var exec = require('child_process').exec;

/**
 * Send bitcoin in testnet using BlockCypher
 * @param {number} amount - Bitcoin amount in BTC
 * @param {string} to - output Bitcoin wallet address
 * @param {string} from - input Bitcoin wallet address
 * @param {string} pubKey - sender public key
 * @param {string} priKey - sender private key
 */

var exports = module.exports = {};

exports.getBalance = function (address) {
    return new Promise(function (resolve, reject) {
        // Basic validation
        if (address) {

            var query = 'https://api.blockcypher.com/v1/btc/test3/addrs/' + address;
            console.log(query);
            // Query the blockcypher api
            https.get(query, (resp) => {

                console.log(query);
                var data = '';

                // cat the data as it comes in
                resp.on('data', (chunk) => {
                    data += chunk;
                });

                // handle the data
                resp.on('end', () => {
                    var jsonObj = JSON.parse(data);

                    if (jsonObj['error']) {
                        //console.log(jsonObj['error']);
                        reject(jsonObj);
                        
                        //res.render(error_page, jsonObj);
                    } else {
                        var balance = jsonObj['balance'];

                        balance = balance * 0.00000001;

                        console.log(jsonObj);
                        console.log(balance);
                        resolve(balance);
                        //res.render(balance_page, { balance: balance.toString() });
                        //res.end();
                    }

                });
            });
        } else {
            var error = { error: 'Field must not be blank' };
            //console.log(error['error']);
            reject(error);
            
            //res.render(error_page, error);
        }
    });
}

exports.sendBitcoin = function (amount, to, from, publicKey, privateKey) {
    
    return new Promise(function (resolve, reject) {
        // create tx skeleton
        request.post({
            url: 'https://api.blockcypher.com/v1/btc/test3/txs/new',
            body: JSON.stringify({
                inputs: [{ addresses: [from] }],
                outputs: [{ addresses: [to], value: amount * Math.pow(10, 8) }]
            }),
        },
            function (err, res, body) {
                if (err) {
                    reject(err);
                } else {
                    
                    let tmptx = JSON.parse(body); // TXSkeleton

                    // Check for a transaction error
                    // If one exists, just throw the first
                    var errors = tmptx['errors'];
                    if (errors) {
                        reject(errors[0]);
                    } else {

                        // This is an unsigned transaction, we need to sign it with the private key
                        var dataToSign = tmptx['tosign'].toString();

                        // Using the signer binary provided by BlockCypher
                        // Signer input: DataHex PrivateHex
                        var signerProcess = exec('signer ' + dataToSign + ' ' + privateKey);

                        // Wait for results
                        var result = '';
                        signerProcess.stdout.on('data', function (data) {
                            result += data;
                        });
                        signerProcess.on('close', function () {
                            console.log('Signature: ' + result);

                            // For some reason the signature ends up with a newline character, remove it
                            result = result.replace(/(\r\n|\n|\r)/gm, "");

                            // Add the public key and signature to the transaction
                            tmptx.signatures = [result];
                            tmptx.pubkeys = [publicKey];

                            // Send back the complete transaction to broadcast
                            console.log("Sending TX...");
                            console.log(tmptx);
                            request.post({
                                url: 'https://api.blockcypher.com/v1/btc/test3/txs/send',
                                body: JSON.stringify(tmptx),
                            },
                                function (err, res, body) {
                                    if (err) {
                                        reject(err);
                                    } else {

                                        console.log("Response: ");
                                        console.log(body);
                                        let finaltx = JSON.parse(body);

                                        if (finaltx.error) {
                                            reject(finaltx.error);

                                        } else {
                                            resolve(finaltx.tx.hash);
                                        }
                                    }
                                }
                            );
                        }); 
                    }
                }
            }
        );
    });
}