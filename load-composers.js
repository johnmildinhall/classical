var MongoClient = require('mongodb').MongoClient;
var composers = require('./composer-data.js');
var request = require('request');
//console.log(composers);
getArtistImages(composers);

function loadComposerstoDB(composers){
	// Connect to the db
	MongoClient.connect("mongodb://localhost:27017/classical", function(err, db) {
		if(err) { return console.dir(err); }


		//drop collection to avoid duplicates
	  db.collection("composers").drop(function(err, reply) {
	  	if(err){console.log(err)};
	  })
		
		//loop through composers and add to the db
	  for(var j=0;j<composers.data.length;j++){
	  	console.log(j+"  "+composers.data[j].Composer)
	  	var line = [{"composer":composers.data[j].Composer, 
									"ID":composers.data[j].ID,
									"image":composers.data[j].Image}];		
			db.collection("composers").insert(line, function (err, inserted) {
	  		if(err){console.log(err)};
	  	});
	  }
	});
}


//function to load bigger spotify images
function getArtistImages(composers){
	  console.log('GET Images '+composers.data.length);

	  //get the data for an individual composer ID

	  var searchComposer = function (ID, callback) {
	  	
	  	request('https://api.spotify.com/v1/artists/'+ID, function (error, response, data, ID) {

	  		if (!error && response.statusCode == 200) {
	  			data = JSON.parse(data);

	  			if(data.images.length>0){
	        	//there are several sizes of image to choose from, go for medium size
	        	for(var j=0;j<data.images.length;j++){
	        		if(data.images[j].width>200&data.images[j].width<400){
	            	//console.log(data.name+" :: "+data.id+" :: "+data.images[j].url);
	            	console.log(data);
	            	var ID = data.id;
	            	var img = data.images[j].url
	            	MongoClient.connect("mongodb://localhost:27017/classical", function(err, db, img, ID) {
	            		console.log(ID);
	            		db.collection("composers").update({ID:ID}, {MediumImage:img}, function(err,inserted){
	            			if(err){console.log(err)};
	            		});
	            	});
	          	}
	        	}
	        }
	  		}
	  	});
  	}
 

	  for(i=0;i<composers.data.length;i++){
	    //console.log(composers[i]);
	    //console.log(composers[i].Composer);

	    searchComposer(composers.data[i].ID,function(data, db){        
	    });

	  }



}


