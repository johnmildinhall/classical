var request = require('request');
request('http://www.southbankcentre.co.uk/whatson/calendar?filter[artform]=1648', function (error, response, body) {
  if (!error && response.statusCode == 200) {
    console.log('hello'); // Show the HTML for the Google homepage. 
  }
})