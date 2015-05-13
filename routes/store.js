exports.home = function(req, res){
  res.render('index.jade', { title: 'Classical Music Ponce' })
};

exports.search = function(req,res){
	var searchString = req.param("searchString");
	typeahead(searchString);


	function typeahead(searchString){

    
    search(searchString)
	}



	function search(searchString){
		var request = require('request');
		
		//URI
    searchString = encodeURIComponent(searchString);

    //Spotify Call
    request('https://api.spotify.com/v1/search?q=' + searchString+'&type=track&limit=50', function (error, response, data, ID) {
			if (!error && response.statusCode == 200) {
				data = JSON.parse(data);
				if(data.tracks.items.length!=0){
          var pieces = data.tracks.items;
          //console.log(pieces);
          var results = [];
          results = resultsArray(results,pieces);

          //re-organise results into composer boxes if appropriate
          var agg = aggregateComposers(results);


          res.send(agg);
        }
				
			}
		});
	}

	// function to turn raw spotify data into an array
  function resultsArray(results,inputArray){

	  for(var j=0;j<inputArray.length;j++){

	    var image = getImageURLs(inputArray[j].artists[0].id);

	    if(checkArtistIsClassical(inputArray[j].artists[0].id)==true){
	      results.push({
	      name: inputArray[j].name,
	      composer: inputArray[j].artists[0].name,
	      composerID: inputArray[j].artists[0].id,
	      ID: inputArray[j].id,
	      image: image,
	      popularity: inputArray[j].popularity
	    });
	    }

	  }
	  results.sort(sortResultsArray);
	  return results;
	}

	//function to return image URLs from composers
	function getImageURLs(ID){
    //console.log(ID);
    var composers = require('../composer-data.js');

    //Loop through composer list until we find an image, and if there is one return it.
    for(i=0;i<composers.length;i++){
      if(composers[i].ID==ID){
        return(composers[i].Image);
      }
    }
  }

  //function to check if an artist is classical
  function checkArtistIsClassical(ID){
  	var composers = require('../composer-data.js');

  	//Loop through list of composers to check if artist is classical
    for(i=0;i<composers.data.length;i++){
      if(composers.data[i].ID==ID){
        return(true);
      }else{
        
      }
    }
  }

  //function to sort results array
  function sortResultsArray(a,b){
    if (a.popularity > b.popularity)
       return -1;
    if (a.popularity < b.popularity)
      return 1;
    return 0;
  }

  //This function takes the raw list of results provided by the spotify API and aggregates them.
  function aggregateComposers(array) {
  	var aggArray = [];
  	for(i=0;i<array.length;i++){

  		//Loop through aggregate array. If there is an entry for the composer already, 
  		//add extra data to that entry. Else create a new one.
  		var alreadyInArray = false;


  		for(j=0;j<aggArray.length;j++){
  			//console.log(aggArray[j]);
  			if(array[i].composerID == aggArray[j].composerID){
					alreadyInArray = true;

					//Add the data for this piece
					var pieceData = {
	  				ID:array[i].ID,
	  				name:array[i].name,
	  				popularity:array[i].popularity
  				}	

  				//Add the piece to pieces for this composer
					aggArray[j].pieces.push(pieceData);

					//Add the popularity of this piece to the total composer popularity for this search query
					aggArray[j].composerPopularity+=array[i].popularity;
					break;
  			}
  		}
  		
  		console.log(alreadyInArray);


  		if(alreadyInArray==false){

  			//Add data for first individual piece
  			var pieceData = {
  				ID:array[i].ID,
  				name:array[i].name,
  				popularity:array[i].popularity
  			}
  			var pieces = [pieceData];
  			
  			//Add composer details, and first piece
  			var item = {
  				composerID:array[i].composerID,
  				composer:array[i].composer,
  				image:array[i].image,
  				composerPopularity:array[i].popularity,
  				pieces:pieces
  			}

  			
  			aggArray.push(item);

  		}




  	}

  	console.log('RESULTS');
  	for(j=0;j<aggArray.length;j++){
  		console.log(aggArray[j]);
  	}
  	return(aggArray);
  	//console.log(aggArray);
	}

}
