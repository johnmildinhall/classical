var request = require('request');
var cheerio = require('cheerio');
var composers = require('./composer-data.js');

//Mongo
// Retrieve
var MongoClient = require('mongodb').MongoClient;




console.log(composers.data[0]);
// Connect to the db
MongoClient.connect("mongodb://localhost:27017/classical", function(err, db) {
	if(err) { return console.dir(err); }
	sbc(db);
});

function sbc(db){
	request('http://www.southbankcentre.co.uk/whatson/calendar?filter[artform]=1648', function (error, response, body) {
  if (!error && response.statusCode == 200) {
  	$ = cheerio.load(body);
  	var links=[];
  	var links = $('a.title-link').each(function(i, elem){
  		//console.log($(this).attr('href'));
  		links[i] = $(this).text();
  	});

  	var pages = [];
  	for(var i=0;i<links.length;i++){
  		pages[i] = links[i].attribs.href;
  	}
  	uniq_fast(pages);
  	//console.log(pages);
  	scrapeSouthbankCentre(pages,db);
  }
	})
}


function scrapeSouthbankCentre(pages, db){
	//console.log(pages);
	for(var i=0;i<pages.length;i++){
			console.log('http://www.southbankcentre.co.uk'+pages[i]);
			request('http://www.southbankcentre.co.uk'+pages[i], function (error, response, body) {
	  		if (!error && response.statusCode == 200) {
	  			$ = cheerio.load(body);
	        var piece = sbcGetPieces($('.type-content').html());
	        var date = $('.date').find('strong').text();    
	        for(var j=0;j<composers.data.length;j++){
	          if(composers.data[j].Composer.indexOf(piece[0])>-1){
	              console.log(piece[0]+" :: "+piece[1]+" :: "+date+'\n');
	              writeToDB(db, piece[0], piece[1], composers.data[j].ID,date);
	            }
	        }
	  		}
			});
	}
}

function writeToDB(db, composer, piece, ID,date){
	
	var line = [{"composer":composer, 
								"piece":piece, 
								"ID":ID,
								"date":date}];		
	db.collection("concerts").insert(line, function (err, inserted) {
  	if(err){console.log(err)};
  	// check err...
	});

}

function sbcGetDate(string){

}

function sbcGetPieces(string){
  var composer = $('.type-content').find('strong').first().text();
  var strongLocation = string.indexOf("</strong>")+9;
  var subset = string.substring(strongLocation);
  var endOfString = subset.indexOf("<");
  var piece = subset.substring(0,endOfString)
  var response =[composer,piece,subset];
  return response;
}

////function to de-duplicate
function uniq_fast(a) {
    var seen = {};
    var out = [];
    var len = a.length;
    var j = 0;
    for(var i = 0; i < len; i++) {
         var item = a[i];
         if(seen[item] !== 1) {
               seen[item] = 1;
               out[j++] = item;
         }
    }
    return out;
}