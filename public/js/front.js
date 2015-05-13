 var composers = loadComposers(); 


    $(document).ready(function() {
      
      //Get intro going

      var introguide = introJs();

      introguide.setOptions({ 'showStepNumbers': 'false','doneLabel':'OK, got it!'});
      introguide.oncomplete(function() {
        $('#searchInput').focus();
      });
      introguide.start()



      //Start listening for typing
           
      inputListen();

      //console.log(composers[342]);
      //getSpotifyIDs(composers);
      //getArtistImages(composers);
    })


    function inputListen(){
      $('#searchInput').on('input', function() {
        
        
        //Get rid of any results
        clearResults();
        
        //Typeahead
        if($('#searchInput').val().length>3){typeahead($('#searchInput').val())};
        
        
        //Search Spotify API
        //if($('#searchInput').val().length>3){search($('#searchInput').val())};
      
      });
    }

    function clearResults(){
      $('.piece').not('#proto').remove();
    }

    function typeahead(searchString){
      
      //search through whitelist to get composers
      var composerIDs = [];
      var count=0;
      for(i=0;i<composers.length;i++){
        //console.log(composers[i].composer);
        if(composers[i].Composer.indexOf(searchString)>-1){
          composerIDs[count] = composers[i].ID;
          console.log(composers[i].Composer);
          count++;
        }
      }

      //console.log(composerIDs.length);

      //If there are no composers, do a general search
      if(composerIDs.length==0){search(searchString)}else{whitelist(searchString,composerIDs)};

      //Get top tracks for whitelisted composers

    }

    function whitelist(searchString,composerIDs){
      
      //call matching composers top tracks
      var promise = [];
      for(var j=0;j<composerIDs.length;j++){
        promise[j] = $.ajax("https://api.spotify.com/v1/artists/"+composerIDs[j]+"/top-tracks?country=GB");
      }

      $.when.apply($, promise).then(function() {
          var objects=arguments;
          console.log(objects);
          var results = [];
          if(objects[1]=="success"){ //for a single result
            results = resultsArray(results,objects[0].tracks);
          }else{ //for multiple results
            for(var i=0;i<objects.length;i++){
              results = resultsArray(results,objects[i][0].tracks);
            }
          }

          //display results
          displayResults(results);
          
          
      }, function(e) {
           console.log("My ajax failed");
      });



    }

    function resultsArray(results,inputArray){

      for(var j=0;j<inputArray.length;j++){
        //console.log(inputArray);
        var image = getImageURLs(inputArray[j].artists[0].id);
        //console.log(image);

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

    function sortResultsArray(a,b){
      if (a.popularity < b.popularity)
         return -1;
      if (a.popularity > b.popularity)
        return 1;
      return 0;
    }

    function displayResults(results){
      for(var i =0;i<results.length;i++){
            var newPiece = $('.piece#proto').clone(true).attr('id',results[i].ID);
            $('.composer',newPiece).html(results[i].composer);
            $('.title',newPiece).html(results[i].name);
            $('.composerImage',newPiece).attr('style','background:url('+results[i].image+') no-repeat center;');
            $('.piece#proto').after(newPiece);
      }
    }

    function getImageURLs(ID){
      //console.log(ID);
      for(i=0;i<composers.length;i++){
        if(composers[i].ID==ID){
          return(composers[i].Image);
        }
      }
    }


    function checkArtistIsClassical(ID){
      console.log(ID);
      for(i=0;i<composers.length;i++){
        if(composers[i].ID==ID){
          console.log(ID);
          console.log('true');
          return(true);
        }else{
          
        }
      }
    }


    function search(searchString){


      //URI
      searchString = encodeURIComponent(searchString);

      //find tracks
      var searchTracks = function (searchString, callback) {
      $.ajax({
            url: 'https://api.spotify.com/v1/search?q=' + searchString+'&type=track',
            success: function (response) {
                callback(response);
            }
        });
      };

      searchTracks(searchString, function(data){
        console.log(data);
        if(data.tracks.items.length!=0){
          
          var pieces = data.tracks.items;
          console.log(pieces);
          var results = [];
          results = resultsArray(results,pieces);
          displayResults(results);

        }
        
      })
        

    };







/////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////
  

    function getSpotifyIDs(composers){
      console.log('GET SPOTIFYIDS');
      var searchComposer = function (searchString, callback) {
        $.ajax({
          url: 'https://api.spotify.com/v1/search?q=' + searchString+'&type=artist',
          success: function (response) {
            callback(response);
          }
        });
      };

      for(i=461;i<780;i++){
        //console.log(composers[i]);
        //console.log(composers[i].Composer);

        searchComposer(composers[i].Composer,function(data){        
          if(data.artists.items.length!=0){
            console.log(data.artists.items[0].name+","+data.artists.items[0].id);
            var newPiece = $('.output#proto').clone(true).html(data.artists.items[0].name+','+data.artists.items[0].id+'<br>').attr('id',data.artists.items[0].id);
            $('.output#proto').after(newPiece);
          } 
        });

      }

    }

    function getArtistImages(composers){
      console.log('GET Images');
      var searchComposer = function (ID, callback) {
        $.ajax({
          url: 'https://api.spotify.com/v1/artists/'+ID,
          success: function (response) {
            callback(response);
          }
        });
      };

      for(i=461;i<688;i++){
        //console.log(composers[i]);
        //console.log(composers[i].Composer);

        searchComposer(composers[i].ID,function(data){        

          console.log(data.images.length);
          if(data.images.length>0){
            console.log(data.images);
            for(var j=0;j<data.images.length;j++){
              if(data.images[j].width<100){

                console.log(data.name+" :: "+data.id+" :: "+data.images[j].url);
                var newPiece = $('.output#proto').clone(true).html(data.name+','+data.id+','+data.images[j].url+'<br>').attr('id',data.id);
                $('.output#proto').after(newPiece);
              }
            }
          }else{
            var newPiece = $('.output#proto').clone(true).html(data.name+','+data.id+'<br>').attr('id',data.id);
            $('.output#proto').after(newPiece);
          }

            
            
            //$('.piece#proto').after(newPiece);

        });

      }


    }

    //artistPromise[j] = $.ajax("https://api.spotify.com/v1/artists/"+composerIDs[j]);
      
//          if(data.artists.items.length!=0){
//            console.log(data.artists.items[0].name+","+data.artists.items[0].id);
//          } 



      



    function loadComposers(){
      var composers = [
    {
        "Composer": "Joseph Weigl",
        "ID": "03L2YDxSfml7yZyx6H1sWD",
        "Image": ""
    },
    {
        "Composer": "Jakub Jan Ryba",
        "ID": "792y8UiF77Bqb4CY19CYAJ",
        "Image": "https://i.scdn.co/image/428b9a0c386b758f6ccf2cbc0897904755d4eaa3"
    },
    {
        "Composer": "Franz Xaver Süssmayr",
        "ID": "1uSs0yxNE5jiHTt6GqEXYn",
        "Image": ""
    },
    {
        "Composer": "Andreas Jakob Romberg",
        "ID": "1Ud1fZmpCjW2IqF3746YZY",
        "Image": "https://i.scdn.co/image/61118e83c03c4b001db200608e4c6a08eb51ff37"
    },
    {
        "Composer": "Hélène de Montgeroult",
        "ID": "4LX5OoDdhDME4A7NbhA19B",
        "Image": ""
    },
    {
        "Composer": "Giacomo Gotifredo Ferrari",
        "ID": "4oMoC7SawoXmIddWJMGLNd",
        "Image": ""
    },
    {
        "Composer": "Étienne Nicolas Méhul",
        "ID": "5olrAShGhqvdHX8hOe4id3",
        "Image": "https://i.scdn.co/image/067cb760d5b50b9c5c31d77bb65c3591090f7851"
    },
    {
        "Composer": "Matthew Camidge",
        "ID": "4c74VJmdwElxDa64YfV7zi",
        "Image": ""
    },
    {
        "Composer": "Niccolò Moretti",
        "ID": "63doieHrNs5kts3PoTCbLg",
        "Image": ""
    },
    {
        "Composer": "Thomas Attwood",
        "ID": "69IciBo7cN5BywP6AlqPfY",
        "Image": ""
    },
    {
        "Composer": "Daniel Gottlied Steibelt",
        "ID": "0uCLiTULo2oODChBxygieQ",
        "Image": ""
    },
    {
        "Composer": "Joseph Leopold Eybler",
        "ID": "7pz5E4Z6fT1YlvQ3rQkPpd",
        "Image": ""
    },
    {
        "Composer": "Johann Georg Lickl",
        "ID": "2zFNHV1qdCx0EQfktLijvB",
        "Image": ""
    },
    {
        "Composer": "Friedrich Heinrich Himmel",
        "ID": "2HLCrjydak37kRNJD2xkZS",
        "Image": ""
    },
    {
        "Composer": "Anton Eberl",
        "ID": "0N0n5uA23IHPDt8FnUl05u",
        "Image": "https://i.scdn.co/image/03f1795bd22fb0d8a69f6aa8d776bed514dda355"
    },
    {
        "Composer": "Rodolphe Kreutzer",
        "ID": "7kuUCYoVimzj3EQnPAyD4l",
        "Image": ""
    },
    {
        "Composer": "José Maurício Nunes Garcia",
        "ID": "1cXDibzdR0jcIjv5Vuqqt8",
        "Image": "https://i.scdn.co/image/3667410f853a985dfc8abc850bf4682d0f5bb899"
    },
    {
        "Composer": "August Eberhard Muller",
        "ID": "0aMRKR2p9WcPtPXRPGbLPW",
        "Image": ""
    },
    {
        "Composer": "Wenzel Müller",
        "ID": "7mHYsfHBu9srj95RS367BJ",
        "Image": ""
    },
    {
        "Composer": "Johann Georg Heinrich Backofen",
        "ID": "6K2cjyRU8eRjG8ItZMiitK",
        "Image": ""
    },
    {
        "Composer": "Carlos Baguer",
        "ID": "6ivKX0llwuugkk8JAwbVpk",
        "Image": "https://i.scdn.co/image/59f58e8f14bbabbd6dc3c26f265b2100786e311a"
    },
    {
        "Composer": "Artemy Vedel",
        "ID": "0aZuM2e584mOmkvVtsXxvt",
        "Image": ""
    },
    {
        "Composer": "Samuel Wesley",
        "ID": "29DzyTX6tCsVZhHZLS76Em",
        "Image": "https://i.scdn.co/image/423738dda0a658214bb8bd666a060c8e3c83de04"
    },
    {
        "Composer": "Bernhard Romberg",
        "ID": "6wUfsWe8RkZFXRLJciB5sZ",
        "Image": ""
    },
    {
        "Composer": "Jan August Vitásek",
        "ID": "4XndC3ZUdLMcbu43ZI8PTJ",
        "Image": ""
    },
    {
        "Composer": "Johann Wilhelm Wilms",
        "ID": "0XAhTuBzcn9CXQKMX6S22h",
        "Image": ""
    },
    {
        "Composer": "Francesco Gnecco",
        "ID": "3TBWUv3cO8RVQESz36VNae",
        "Image": ""
    },
    {
        "Composer": "Ludwig van Beethoven",
        "ID": "2wOqMjp9TyABvtHdOSOTUS",
        "Image": "https://i.scdn.co/image/31cd9afb8ab895bcd0f39219e66d6971b109873b"
    },
    {
        "Composer": "Filippo Gragnani",
        "ID": "3c1z9ziHyBNFD6VuDVvitj",
        "Image": "https://i.scdn.co/image/d93e788dc36b42727b07d9551c2c91e2d214661b"
    },
    {
        "Composer": "Antoine Reicha",
        "ID": "6xcLRTK4l1U7cO925ybm2L",
        "Image": "https://i.scdn.co/image/237942e68b41e8a67e132d0c506d97e2c2cd44f9"
    },
    {
        "Composer": "Margarethe Danzi",
        "ID": "0hbkaWnBmITMmHsVaQ3fQN",
        "Image": ""
    },
    {
        "Composer": "Johann Baptist Cramer",
        "ID": "7BwSrKTOemmB5WmGVVqInm",
        "Image": ""
    },
    {
        "Composer": "Edouard Du Puy",
        "ID": "4YSCbLTg7qXHjtIeW8YhV4",
        "Image": "https://i.scdn.co/image/26181e4e8dec4e98798356b2c0a54347f9d125fc"
    },
    {
        "Composer": "Friedrich Witt",
        "ID": "34LxinR4hpnSBbpdRntAvB",
        "Image": ""
    },
    {
        "Composer": "James Hewitt",
        "ID": "4ebNMMVaPBya0wrop9nXoi",
        "Image": "https://i.scdn.co/image/582c299619647d6166bc4c47736d98e2cb4a3c29"
    },
    {
        "Composer": "Antonio Casimir Cartellieri",
        "ID": "5vKdLzGImIRZGwXxQ80fNq",
        "Image": ""
    },
    {
        "Composer": "Pietro Generali",
        "ID": "1swQ8pAUjvhY4UXIEV4not",
        "Image": ""
    },
    {
        "Composer": "Adam Valentin Volckmar",
        "ID": "6Cod9sj4RRh1K2HhamJ528",
        "Image": ""
    },
    {
        "Composer": "Benjamin Carr",
        "ID": "6e0wBCj3cpmaEO3XhvtM3Y",
        "Image": "https://i.scdn.co/image/d2b603b4613500d9f46ce4f14818e38c1902cc5a"
    },
    {
        "Composer": "Ferdinando Paer",
        "ID": "5dytbQ67Pbopa2N7yveGsg",
        "Image": "https://i.scdn.co/image/45b8c08b7cc72a8dfcc4706d037570b5b65f187b"
    },
    {
        "Composer": "François-Adrien Boieldieu",
        "ID": "41HbT7AuncIzGpJdpp9ymL",
        "Image": "https://i.scdn.co/image/51480323c54f460c07638549c6ac8d5a622982a3"
    },
    {
        "Composer": "Louis Ferdinand (Prince of Prussia)",
        "ID": "1knO9axaLjWBw00eGomLXY",
        "Image": ""
    },
    {
        "Composer": "Ferdinando Carulli",
        "ID": "7MZ0jenDMeC9wPbL61mITT",
        "Image": "https://i.scdn.co/image/98e234368df3052cac829bdb649728dac42b6a4b"
    },
    {
        "Composer": "Joseph WÌ¦lfl",
        "ID": "19W37BfT6FDSoTzVFvotIg",
        "Image": ""
    },
    {
        "Composer": "François-Louis Perne",
        "ID": "2HMhfFfxoq4XIi7whXKHJR",
        "Image": ""
    },
    {
        "Composer": "Bartolomeo Bortolazzi",
        "ID": "5jnBcz47m3F71sniwgaQEa",
        "Image": ""
    },
    {
        "Composer": "Hyacinthe Jadin",
        "ID": "0JkOkTz9IA0hEaxOi33Xuq",
        "Image": ""
    },
    {
        "Composer": "Jozef Elsner",
        "ID": "1BgNIGdsTj6pz7kTtOZxAm",
        "Image": ""
    },
    {
        "Composer": "Pierre Rode",
        "ID": "7HOmZaILvkqmWIcw9kWQJm",
        "Image": ""
    },
    {
        "Composer": "Ferdinand Ries",
        "ID": "0K5dXu1HDEpKlS9VqrK1FY",
        "Image": "https://i.scdn.co/image/dc1da3727345c6608e03683d2a3da839ae722de2"
    },
    {
        "Composer": "Christoph Ernst Friedrich Weyse",
        "ID": "3xoBujDX2nT7UkO85fmzSb",
        "Image": "https://i.scdn.co/image/df88de4035e4b0a8ee5dd15eeba63b7a9ddaea7c"
    },
    {
        "Composer": "Ernst Theodor Amadeus Hoffmann",
        "ID": "0RO6COslAWRZZBGgqbG615",
        "Image": "https://i.scdn.co/image/1f37134f2c825b43e2f87cbf8fe2ef9892fc744c"
    },
    {
        "Composer": "João Domingos Bomtempo",
        "ID": "2bhL4RP4BMjpGW8YSs5eJy",
        "Image": "https://i.scdn.co/image/913f52c31a9398020b877d34b0177c3bf1a50117"
    },
    {
        "Composer": "Gaspare Spontini",
        "ID": "7yxeJll1absl3LxWoIrBj5",
        "Image": "https://i.scdn.co/image/f61978f1b56bc156c1e2e5eb60d86935b1d59f06"
    },
    {
        "Composer": "Maria Hester Park",
        "ID": "4Dj9PciUMMVgQEJC5hXBGa",
        "Image": ""
    },
    {
        "Composer": "Christian Heinrich Rinck",
        "ID": "0rYJTQxYR3jMt8Jp2AOLfe",
        "Image": ""
    },
    {
        "Composer": "Bernhard Henrik Crusell",
        "ID": "6RZnn5duxDdSsDoaoRaibD",
        "Image": "https://i.scdn.co/image/e444318bbde5294636ce1b699ba390d99c9b4438"
    },
    {
        "Composer": "Francois de Fossa",
        "ID": "6dwvOAIz6aIgPyDEZpv2oh",
        "Image": "https://i.scdn.co/image/e8f00d05f752c7b433d2269fa5509c7317001c35"
    },
    {
        "Composer": "Philipp Jakob Riotte",
        "ID": "0nbaVwqDEjDmefywgEApAe",
        "Image": ""
    },
    {
        "Composer": "Ludwig Berger",
        "ID": "2oijvvU4yGU3G9iaODn7ta",
        "Image": ""
    },
    {
        "Composer": "Pauline Duchambge",
        "ID": "2hmSYq62p65VXwaNp2rde9",
        "Image": ""
    },
    {
        "Composer": "Sigismund Neukomm",
        "ID": "5TXW5XtsyFmVahbqyemBse",
        "Image": ""
    },
    {
        "Composer": "Nicolas Isouard",
        "ID": "10xddF0RFo8wiwy942qF8Y",
        "Image": ""
    },
    {
        "Composer": "Conradin Kreutzer",
        "ID": "2uANX5maiDPxEGHzRhn6Wk",
        "Image": ""
    },
    {
        "Composer": "Johann Nepomuk Hummel",
        "ID": "0WiK9IsQEQEuIQ1iDxvuPg",
        "Image": "https://i.scdn.co/image/e1a6a260fe96c8e9e4386e325933d4dadd2d832c"
    },
    {
        "Composer": "Louis-François Dauprat",
        "ID": "6hUn4pSMbozR7bOZGgmRrA",
        "Image": ""
    },
    {
        "Composer": "Mauro Giuliani",
        "ID": "4qXtGiJP51BsAIi4bJNeir",
        "Image": "https://i.scdn.co/image/deae11e1583d1971af70f4da3b0e5cb9ead9f75b"
    },
    {
        "Composer": "Niccolò Paganini",
        "ID": "39FC9x5PaTNYHp5hwlaY4q",
        "Image": "https://i.scdn.co/image/9c5807a6962c37ea28c9977f5e577ac172d583e5"
    },
    {
        "Composer": "Daniel Auber",
        "ID": "1vZ1dRN06p7GswsiwNtS0b",
        "Image": "https://i.scdn.co/image/fea0726cc2390842a266382e91e8c575ffce55d3"
    },
    {
        "Composer": "John Field",
        "ID": "7vDYlejWEU6Yuw4MxTiv56",
        "Image": "https://i.scdn.co/image/3e2f20777f15cb9a756e932e76c30996fdef5253"
    },
    {
        "Composer": "Carlo Coccia",
        "ID": "3zIQqWGABrMPs9iFj6Wyd5",
        "Image": ""
    },
    {
        "Composer": "François Joseph Naderman",
        "ID": "1EhQ5F6ioQIKeibpHcnwsy",
        "Image": ""
    },
    {
        "Composer": "Francesco Morlacchi",
        "ID": "6cKlfrrehYcI7Gpskd0DqN",
        "Image": ""
    },
    {
        "Composer": "Fernando Sor",
        "ID": "4KAvqco7JE80QdRlEjvyrd",
        "Image": "https://i.scdn.co/image/10a56f736d2cce854b61e1c59ecfa1613ab78953"
    },
    {
        "Composer": "Friedrich Dotzauer",
        "ID": "7ln6jy3RSzyjRLdDuc7hH9",
        "Image": ""
    },
    {
        "Composer": "Simon Sechter",
        "ID": "6gPuW3YD5qDhbDwHRGeER8",
        "Image": ""
    },
    {
        "Composer": "Alexandre Pierre François BoÌÇly",
        "ID": "712qGFecAptplIkITwkfVq",
        "Image": ""
    },
    {
        "Composer": "George Onslow",
        "ID": "7c7cOSRPylS7Uk7NkohngW",
        "Image": ""
    },
    {
        "Composer": "Bettina Brentano",
        "ID": "4kwW8o6pKmCUllQetd2o5G",
        "Image": ""
    },
    {
        "Composer": "Anton Diabelli",
        "ID": "5S07yOKHJQw62NK0u0r00D",
        "Image": "https://i.scdn.co/image/19d374c573f9c73ab9fe30c31813474763b397b9"
    },
    {
        "Composer": "Michele Carafa",
        "ID": "2dLFh3Vyvi6gQMvjH85sCa",
        "Image": ""
    },
    {
        "Composer": "Johann Peter Pixis",
        "ID": "5NuyFBpTD0earLKkbBjkEU",
        "Image": ""
    },
    {
        "Composer": "Joseph Küffner",
        "ID": "1vjOTzGKbZLOmo3rkaE1vJ",
        "Image": ""
    },
    {
        "Composer": "Isabella Colbran",
        "ID": "3N0suas2XLIY0zTctAyvrs",
        "Image": "https://i.scdn.co/image/84169fe22796f2234b255bbb9b4a645a66a130e9"
    },
    {
        "Composer": "Louis Spohr",
        "ID": "7MzxeLpsMxTk4HDBG6C7rq",
        "Image": "https://i.scdn.co/image/7410f24ccf1d6be5edc4e467b79572208f261ba1"
    },
    {
        "Composer": "Marie Bigot",
        "ID": "6gaibOEI7HeV6P9YP0vK2n",
        "Image": ""
    },
    {
        "Composer": "Carl Czerny",
        "ID": "3gOIm6ckbGpE2x2Cl0XnsW",
        "Image": "https://i.scdn.co/image/568a14926c969572ba64047be463e63b7f7ae1da"
    },
    {
        "Composer": "George Frederick Pinto",
        "ID": "69CCKvpcVFXSOYBb8SDrp6",
        "Image": ""
    },
    {
        "Composer": "Sir Henry Rowley Bishop",
        "ID": "6XFR4sCl5amPDW9lthLtY1",
        "Image": ""
    },
    {
        "Composer": "Friedrich Kuhlau",
        "ID": "4yZL2ra98L6CezM2WkVbCE",
        "Image": "https://i.scdn.co/image/c50d73bd1fef748d5351715f51b6e6a0b32c09ce"
    },
    {
        "Composer": "Alexander Alyabyev",
        "ID": "0YVUvbmFDA7BN81dDht4xQ",
        "Image": "https://i.scdn.co/image/8cd78c39b3a00855607f107c00375e88ab55919b"
    },
    {
        "Composer": "Pietro Raimondi",
        "ID": "74KO6JmdyWKmOnoSryC7Sk",
        "Image": ""
    },
    {
        "Composer": "Carl Maria von Weber",
        "ID": "1p6wR69pnH9LBWZvwliuz2",
        "Image": "https://i.scdn.co/image/87c7257434f81d7a59bea34e504c2c8f0fb86363"
    },
    {
        "Composer": "Franz Xaver Wolfgang Mozart",
        "ID": "2Tl3cwiI6QX8wHUJI32rD6",
        "Image": ""
    },
    {
        "Composer": "Carlo Evasio Soliva",
        "ID": "2oyZEW13hjJIyyXMK0pWy5",
        "Image": ""
    },
    {
        "Composer": "Ferdinand Herold",
        "ID": "67Ah6SrUvcNVhXrUxebYUx",
        "Image": "https://i.scdn.co/image/cceb0633eea8d8c9e6aea790b794a053d52ff7de"
    },
    {
        "Composer": "Nicolas-Charles Bochsa",
        "ID": "2Ma4p83lvJ8z29BfiIi6Fb",
        "Image": ""
    },
    {
        "Composer": "Fromental Halevy",
        "ID": "44lMIc4WPA5SLDxhLjWno2",
        "Image": "https://i.scdn.co/image/74552f60b26a433f34d524afe52aea661ff02b6e"
    },
    {
        "Composer": "Giacomo Meyerbeer",
        "ID": "6aItH4tJHWc4wKwlDXkJrc",
        "Image": "https://i.scdn.co/image/14fb9bfc3b2510aeee8b796629c10674ab25b796"
    },
    {
        "Composer": "Georg Caspar Schürmann",
        "ID": "2G4e3wKQOnuJeze6s2fDeM",
        "Image": ""
    },
    {
        "Composer": "Gioachino Rossini",
        "ID": "0roWUeP7Ac4yK4VN6L2gF4",
        "Image": "https://i.scdn.co/image/d19b46724bca9c4a48e7ef8e6245ccb6e9eca3c2"
    },
    {
        "Composer": "Saverio Mercadante",
        "ID": "4Yi0sefu5ff6Y0NnuR4f2N",
        "Image": "https://i.scdn.co/image/c67b11821449d71f50da26862a5e07eb835c6d1a"
    },
    {
        "Composer": "Giuseppe Maria Orlandini",
        "ID": "0pje29PBovFePp7PYyjGZT",
        "Image": ""
    },
    {
        "Composer": "Giovanni Porta",
        "ID": "1nUP8U04altonFlBFY27ay",
        "Image": ""
    },
    {
        "Composer": "Hélène Liebmann",
        "ID": "58QTCYpu1Seko7EV3wmxdl",
        "Image": ""
    },
    {
        "Composer": "Ignaz Moscheles",
        "ID": "16jXfuqWJEnpQ6wPVzGFXs",
        "Image": "https://i.scdn.co/image/a6b43b85d5e4cdbf2449d0200451850e59a7173b"
    },
    {
        "Composer": "Giovanni Pacini",
        "ID": "2ZBALBM8gWWdryeBIXfTkP",
        "Image": "https://i.scdn.co/image/6a47b622cfb3eeb14894950c8ce98e187316e293"
    },
    {
        "Composer": "Franz Berwald",
        "ID": "6ky9trvRb2Iv69Qg3aK9fH",
        "Image": "https://i.scdn.co/image/be08ebf7a1f2ed84f267514065c2d9ab86d49c73"
    },
    {
        "Composer": "Franz Schubert",
        "ID": "2p0UyoPfYfI76PCStuXfOP",
        "Image": "https://i.scdn.co/image/a96f2804d87fc221f77d59d007defc9c8b635392"
    },
    {
        "Composer": "Gaetano Donizetti",
        "ID": "2jCGEMSZXMSOImpD8sqo56",
        "Image": "https://i.scdn.co/image/fa613afcb7db2285a4a875b3ddb71dc3c29988ed"
    },
    {
        "Composer": "Carl Loewe",
        "ID": "5UNH9SPuo9kO24Jz7yhBx7",
        "Image": "https://i.scdn.co/image/d147612e5658ba6ffd99b34a0858f59dd640e537"
    },
    {
        "Composer": "Leopold Kozeluch",
        "ID": "7C5oAOwd8u6WbaKEn7NJEl",
        "Image": "https://i.scdn.co/image/21371751592cd7168b0e6c459ae777ef2542aacd"
    },
    {
        "Composer": "Oscar I (King of Sweden)",
        "ID": "4umRnIkWRqXYQ50VJLydtf",
        "Image": ""
    },
    {
        "Composer": "Giuseppe Antonio Avitrano",
        "ID": "4DD6lIGeIZlSRh84xIIIFK",
        "Image": ""
    },
    {
        "Composer": "Giacomo Antonio Perti",
        "ID": "6sZSlSuz1VT79Pk3zb5IeZ",
        "Image": "https://i.scdn.co/image/f3b6c8e35df493cb02c6487da24e93310c188851"
    },
    {
        "Composer": "Richard Leveridge",
        "ID": "0hZdHuGa0j4ebePkBXepgY",
        "Image": ""
    },
    {
        "Composer": "Johann Nicolaus Bach",
        "ID": "7eaTS2USBOnvmcY27ZpVeV",
        "Image": ""
    },
    {
        "Composer": "Louis de Caix d'Hervelois",
        "ID": "0bYAP9IMUiSydvsqJR9PkN",
        "Image": ""
    },
    {
        "Composer": "Tomaso Albinoni",
        "ID": "17OArJzEhRR3OmhtGcnfBq",
        "Image": "https://i.scdn.co/image/d13868304b903ced2371bc14d5e05240a43cf1c2"
    },
    {
        "Composer": "Johann Christoph Pepusch",
        "ID": "0cUXke8xUirN51fCJ0Bxv1",
        "Image": "https://i.scdn.co/image/6726f3f1b7f9e60423b3ac31386db3919d4e0236"
    },
    {
        "Composer": "Pierre DuMage",
        "ID": "5l2OLnBE2oJ1dDIAksX50q",
        "Image": ""
    },
    {
        "Composer": "Michele Mascitti",
        "ID": "542EqPxL9KeRUx2LVuZSaD",
        "Image": "https://i.scdn.co/image/9d4cf8dbbda01ebd3e6e7fa7f36f7fc151ccfffa"
    },
    {
        "Composer": "Wolff Jakob Lauffensteiner",
        "ID": "3PHgL0ZcW65DynLtKiz21z",
        "Image": ""
    },
    {
        "Composer": "Giacomo Facco",
        "ID": "21ubccvurcAtA6XtKDiljP",
        "Image": "https://i.scdn.co/image/bd4902f99b3d3e18e9958b111920fbca45f74c25"
    },
    {
        "Composer": "Johann Adolf Hasse",
        "ID": "6w8vbl8dEQWsrWokjeM4sn",
        "Image": "https://i.scdn.co/image/0359dcaea097f4931e70edcc5aa3b6531abd2618"
    },
    {
        "Composer": "Ferdinando Antonio Lazzari",
        "ID": "0CjaddwnCBNQlQK1AKwoZf",
        "Image": ""
    },
    {
        "Composer": "Johann Mattheson",
        "ID": "0YuQmKNAObna6VBbIpp1VY",
        "Image": ""
    },
    {
        "Composer": "Giuseppe Valentini",
        "ID": "5YRv2s8GfqxjZKN0yKIp2u",
        "Image": "https://i.scdn.co/image/9b1daca502445051683e4a8de87f3cf5f5979f98"
    },
    {
        "Composer": "Christoph Graupner",
        "ID": "3EwOCXE7NAGZe9UGfundQs",
        "Image": "https://i.scdn.co/image/72d35d08af5acacb05b85b0d0b62bd6762ec7508"
    },
    {
        "Composer": "Paolo Benedetto Bellinzani",
        "ID": "5pwIwPofLhVH0vX7TIoulM",
        "Image": ""
    },
    {
        "Composer": "Georg Philipp Telemann",
        "ID": "2fg5h5pzleqI4RjFopWroj",
        "Image": "https://i.scdn.co/image/a21fda8b685b8331382985b9725f5bcdf8dfd9b5"
    },
    {
        "Composer": "Francesco Durante",
        "ID": "2ANNu3tydgHpquAJAMhW9l",
        "Image": ""
    },
    {
        "Composer": "Francois D'Agincourt",
        "ID": "0CdcCSbY1N3StUGnpidoL6",
        "Image": ""
    },
    {
        "Composer": "Giacobbe Basevi Cervetto",
        "ID": "7CjmbKMZ2vnrLJogjKOZPm",
        "Image": ""
    },
    {
        "Composer": "Francesco Onofrio Manfredini",
        "ID": "2xw6RSRcOMfng7dvPOUS2e",
        "Image": "https://i.scdn.co/image/7bb11f0a79a9a20728598575fc6e42ae9a2d87d5"
    },
    {
        "Composer": "Giuseppe Matteo Alberti",
        "ID": "22svob4gEahBZkW5s52G4C",
        "Image": ""
    },
    {
        "Composer": "Wilhelm Hieronymus Pachelbel",
        "ID": "5dDuS7uLqDrIdkFGNFzP5u",
        "Image": ""
    },
    {
        "Composer": "Manuel de Zumaya",
        "ID": "3M3fqTnh2ScpwiARvQFVV4",
        "Image": ""
    },
    {
        "Composer": "Domenico Scarlatti",
        "ID": "0mFblCBw0GcoY7zY1P8tzE",
        "Image": "https://i.scdn.co/image/2fd11703675d583223e7423db4c5cc0a7bf7d2a5"
    },
    {
        "Composer": "Johann Theodor Roemhildt",
        "ID": "3Ad25taWVZpC5NpBsAamRn",
        "Image": "https://i.scdn.co/image/23180026c8e4eec9241e37e5bd7bd4d9cbf40c61"
    },
    {
        "Composer": "Nicola Porpora",
        "ID": "7lc5ghE4vXqyAsVs3GZAq3",
        "Image": "https://i.scdn.co/image/e9d5b73f57e6135e2624ee4b2f92fa9449ff261a"
    },
    {
        "Composer": "Willem de Fesch",
        "ID": "3A7UTdFke7GIcaxEnTpGDX",
        "Image": ""
    },
    {
        "Composer": "Johann Georg Pisendel",
        "ID": "2A1dlEsuOOFYaqRRyGu1Sb",
        "Image": ""
    },
    {
        "Composer": "Francesco Geminiani",
        "ID": "4Vn6axeFKEaPRH1sI7JVKj",
        "Image": "https://i.scdn.co/image/f993a84a47954adf27a1acd1042c336d3c110743"
    },
    {
        "Composer": "Johann Friedrich Fasch",
        "ID": "6VICssnd5TFFusdpL5f2K9",
        "Image": "https://i.scdn.co/image/f42634689c034c10685df9312f515efdb88d4779"
    },
    {
        "Composer": "Joseph Bodin de Boismortier",
        "ID": "725cpZyftwsHTeKR2fvf0q",
        "Image": "https://i.scdn.co/image/5d76426c0538137d9c0015aa1dab8b9118e3685f"
    },
    {
        "Composer": "Giovanni Battista Somis",
        "ID": "5Md6MOPG2IFpoh8agp0F8c",
        "Image": ""
    },
    {
        "Composer": "Giuseppe Antonio Brescianello",
        "ID": "0umkbxC104PWkhWjw1lvoE",
        "Image": ""
    },
    {
        "Composer": "François Colin de Blamont",
        "ID": "25upqKJso2UxlSePtuKJIj",
        "Image": ""
    },
    {
        "Composer": "Francesco Barsanti",
        "ID": "7e5HLBWIBzIyoZeV8bWwD8",
        "Image": ""
    },
    {
        "Composer": "Johann Tobias Krebs",
        "ID": "1B481DdPyWCeAVD4AHv6Fo",
        "Image": ""
    },
    {
        "Composer": "Don Pietro Gnocchi",
        "ID": "4sLBGuzLXavfkiewa2n1n6",
        "Image": ""
    },
    {
        "Composer": "Francesco Maria Veracini",
        "ID": "7f7Fq3LZJbshWixqxVsofz",
        "Image": "https://i.scdn.co/image/e9629166064c10b998959762e22f0bab5d258a78"
    },
    {
        "Composer": "Conrad Friedrich Hurlebusch",
        "ID": "11GfEitrU7kbCKvzh1PxQg",
        "Image": ""
    },
    {
        "Composer": "Giovanni Alberto Ristori",
        "ID": "0ztocRr3WFjTkWABwqB8KM",
        "Image": ""
    },
    {
        "Composer": "Antonio Palella",
        "ID": "5CliRkkfrrWwK3Q8AsyJBr",
        "Image": ""
    },
    {
        "Composer": "Gregor Joseph Werner",
        "ID": "3FLxEaYTCJpxc52GijfWVD",
        "Image": ""
    },
    {
        "Composer": "Pietro Locatelli",
        "ID": "2zcA2rLi9jv1i97HmFWFv4",
        "Image": "https://i.scdn.co/image/57122eab8ebb7d8044353c8a69f922ee492c2824"
    },
    {
        "Composer": "Johann Samuel Endler",
        "ID": "2GasJeYgS7cn1viDffssQx",
        "Image": ""
    },
    {
        "Composer": "Giuseppe Tartini",
        "ID": "46x75iFAkipaG5IEAFN4L4",
        "Image": "https://i.scdn.co/image/deba671f27de5b82bafc01fa2e7185effcdbfc8e"
    },
    {
        "Composer": "Unico Wilhelm van Wassenaer",
        "ID": "1Zlb4fNLrc1c9MTkgYlFyh",
        "Image": "https://i.scdn.co/image/0f6109488a61ca588cfa61200f8f23c37b045c8d"
    },
    {
        "Composer": "Johann Lorenz Bach",
        "ID": "5KzUgdUM2mnpeLnFRsLLQn",
        "Image": ""
    },
    {
        "Composer": "Johan Helmich Roman",
        "ID": "7fmuw46A73YYDDI1AV6KZd",
        "Image": "https://i.scdn.co/image/e3ed1d9214d9516823998451872469a4299d9f99"
    },
    {
        "Composer": "Ernst Gottlieb Baron",
        "ID": "5CbKvx9oWL5hl13ULmr2dQ",
        "Image": ""
    },
    {
        "Composer": "Johann Melchior Molter",
        "ID": "0yeVLYOjmMKlKDGDhYPeRa",
        "Image": ""
    },
    {
        "Composer": "Gottlieb Muffat",
        "ID": "5PNekxMQNKhSnng50Ft9On",
        "Image": "https://i.scdn.co/image/f774fd4779925ab632bbc3fcf9be404c7cbc1ca8"
    },
    {
        "Composer": "Jacques Aubert",
        "ID": "4UDIyicairXy4hzTNf4iw1",
        "Image": ""
    },
    {
        "Composer": "Pierre Fevrier",
        "ID": "3ZB2owEFix0CiP0w6r6k7U",
        "Image": ""
    },
    {
        "Composer": "Thomas Roseingrave",
        "ID": "3wJPat1j68xByeq5z1QXfe",
        "Image": ""
    },
    {
        "Composer": "Francesco Feo",
        "ID": "6LBbHjJ9wgxrp5Uf6gyJlw",
        "Image": "https://i.scdn.co/image/fe8b164dcbcd17789e0bc0bb9f6e6f18e9c112bc"
    },
    {
        "Composer": "Sebastian Bodinus",
        "ID": "3zFK509IeODrN8EtCzyQZi",
        "Image": ""
    },
    {
        "Composer": "Andrea Zani",
        "ID": "4R6q9VBUSwtK6evKgOR5rn",
        "Image": ""
    },
    {
        "Composer": "Joseph Gibbs",
        "ID": "47Q632e4oprW3s66jALpTc",
        "Image": ""
    },
    {
        "Composer": "Jan Zach",
        "ID": "2oY4QN0Tx1cd4Rwtky2GdI",
        "Image": ""
    },
    {
        "Composer": "Josse Boutmy",
        "ID": "3S7qFZY2jsOpoXsdvBmpcH",
        "Image": ""
    },
    {
        "Composer": "Giuseppe de Majo",
        "ID": "1DGLF4ptdov8hhijMIf6PR",
        "Image": ""
    },
    {
        "Composer": "Maurice Greene",
        "ID": "54tDLNmoKQre57OOvCJpZK",
        "Image": "https://i.scdn.co/image/4ae54b84f3d38d58c875334bca54d2a221509a48"
    },
    {
        "Composer": "Johann Christian Hertel",
        "ID": "0Oh54uW3111LzjN1t4MisF",
        "Image": ""
    },
    {
        "Composer": "Adam Falckenhagen",
        "ID": "3isAWD95xBZQpM85Shxl1g",
        "Image": ""
    },
    {
        "Composer": "Johann Pfeiffer",
        "ID": "7KrQ6xbpHTFBLR47yst7U9",
        "Image": ""
    },
    {
        "Composer": "Giovanni Benedetto Platti",
        "ID": "0RFpVAGFCugeIDlW97oCFq",
        "Image": "https://i.scdn.co/image/9c5d630938cf4b7ace894a1bf15e55b5ea834a85"
    },
    {
        "Composer": "Nicolas Chedeville",
        "ID": "4t68RA6LrQhCg9x9orWPIA",
        "Image": ""
    },
    {
        "Composer": "Johann Joachim Quantz",
        "ID": "6OGzv7Vb39sOEIJ6o26yNV",
        "Image": "https://i.scdn.co/image/8b761fe3919021d1f357fab9a57ca5590f66d7f1"
    },
    {
        "Composer": "François Francoeur",
        "ID": "2KDkEWrvxN31Fibt4QXOsp",
        "Image": "https://i.scdn.co/image/09370f55defe4332047d30530bfb71981931210f"
    },
    {
        "Composer": "Riccardo Broschi",
        "ID": "5bR4JwcCpHYXCJZV9b8FXs",
        "Image": ""
    },
    {
        "Composer": "Nicola Bonifacio Logroscino",
        "ID": "2xo6WFMLxfo2pdOVhQZ58G",
        "Image": ""
    },
    {
        "Composer": "Gaetano Maria Schiassi",
        "ID": "0f4qFCCdsIb4IhCQUHAU1M",
        "Image": ""
    },
    {
        "Composer": "Juan Francés De Iribarren",
        "ID": "3EjiWFbNynhV4zzY32YCtQ",
        "Image": ""
    },
    {
        "Composer": "Charles Dollé",
        "ID": "6K6Y5UIBXsuA5xK7Ov4ix9",
        "Image": ""
    },
    {
        "Composer": "Giovanni Giorgi",
        "ID": "0HMMlbLJlddhkzfkmyipfb",
        "Image": "https://i.scdn.co/image/0983e4b62b08c0ba5981669b976c5ef5216ed43b"
    },
    {
        "Composer": "Michel Blavet",
        "ID": "6L1kCjxAKIWpEaJjYbOsDX",
        "Image": "https://i.scdn.co/image/3f2606239ac54d47ae4bccca70d2368998faa13d"
    },
    {
        "Composer": "Domenico dall'Oglio",
        "ID": "6p2przxpWEnnZWthnFc4Du",
        "Image": ""
    },
    {
        "Composer": "Joao Rodrigues Esteves",
        "ID": "6xRZOwKETmlWAXA6JedFq8",
        "Image": ""
    },
    {
        "Composer": "Francisco Antünio de Almeida",
        "ID": "3AtmOk1lJXMpUth0djfUsx",
        "Image": ""
    },
    {
        "Composer": "François Rebel",
        "ID": "2cAmPDsVsXqwEaBSTdS0JA",
        "Image": ""
    },
    {
        "Composer": "Nicola Fiorenza",
        "ID": "3LHew9notb28wfFEY0sSGB",
        "Image": ""
    },
    {
        "Composer": "Johann Gottlieb Graun",
        "ID": "7DPB6X6nVzsFVNfrs6lg8l",
        "Image": "https://i.scdn.co/image/867366f94d05af982b8e3f67fc446dc0c3107525"
    },
    {
        "Composer": "Johan Joachim Agrell",
        "ID": "2nHvZYEGYyRXBqsXbwsZ0R",
        "Image": ""
    },
    {
        "Composer": "Giovanni Battista Sammartini",
        "ID": "3q4lkJBQDPwgWC1rkfxXLv",
        "Image": "https://i.scdn.co/image/928f05950050c0e9f95a2829532192e89509eef6"
    },
    {
        "Composer": "Alessandro Besozzi",
        "ID": "2H6QWE0PzZBvg9rf7INPvW",
        "Image": ""
    },
    {
        "Composer": "Johann Ernst Eberlin",
        "ID": "7v5GeBwFVFvkDqDmhdVvMB",
        "Image": ""
    },
    {
        "Composer": "José de Nebra",
        "ID": "4UDs6QCUbK7WKsWBtJWDhR",
        "Image": ""
    },
    {
        "Composer": "Joseph-Nicolas-Pancrace Royer",
        "ID": "0QNLor0kMA26HcpvzwEuvT",
        "Image": "https://i.scdn.co/image/7ed9b2f8d78ccdab13dec6e627f8bf4667411e35"
    },
    {
        "Composer": "John Frederick Lampe",
        "ID": "6JQhcUhcnvyKIsK2XSqjnK",
        "Image": ""
    },
    {
        "Composer": "Johann Peter Kellner",
        "ID": "4ZHBeTNiUlGp08DeQv5HpF",
        "Image": ""
    },
    {
        "Composer": "William Hayes",
        "ID": "6Nhi4xpGoFpgGAZERufpY8",
        "Image": "https://i.scdn.co/image/808f1273ee103539e6e94398e65ced0cd8189eb7"
    },
    {
        "Composer": "Carl Heinrich Graun",
        "ID": "4RCCipjKTeizg2kHWlIHvG",
        "Image": "https://i.scdn.co/image/13d205612629764536d97426b222b65e47dc5649"
    },
    {
        "Composer": "Pietro Domenico Paradisi",
        "ID": "5ZVgiDtUsBkgcWLZ2Vr8pW",
        "Image": "https://i.scdn.co/image/0d9b7187df5a1516439da348ccac1ef78947aa6c"
    },
    {
        "Composer": "Carlo Cecere",
        "ID": "7rEbdbChShX7nqq6WfDJD2",
        "Image": ""
    },
    {
        "Composer": "Giovanni Battista Pescetti",
        "ID": "66pGYhfbMSXLOkL1TU64Y5",
        "Image": ""
    },
    {
        "Composer": "Johann Adolph Scheibe",
        "ID": "0XS90jAk3KUWkQIWwWrt16",
        "Image": ""
    },
    {
        "Composer": "Giovanni Battista Martini",
        "ID": "4oWPDBXFnnKfEcLsGhasaK",
        "Image": ""
    },
    {
        "Composer": "Thomas Chilcot",
        "ID": "6XoHkU9ZN4GkIBMEHkgSBN",
        "Image": ""
    },
    {
        "Composer": "Baldassare Galuppi",
        "ID": "65fAk5vQnO9gmOCk2wPkuT",
        "Image": "https://i.scdn.co/image/124485abc86e3af138f5a4cd20fe5120118c2b8d"
    },
    {
        "Composer": "Egidio Duni",
        "ID": "29Ta9exosy7zqmfJz6oO0O",
        "Image": ""
    },
    {
        "Composer": "Johann Baptist Georg Neruda",
        "ID": "5eA4h0JmH9u9ti23QTegD6",
        "Image": "https://i.scdn.co/image/96d46891a6b750dafc6dac64265b1ff2963a1d4d"
    },
    {
        "Composer": "Thomas Arne",
        "ID": "2xlqXgu9HqjVPWYoX8uido",
        "Image": ""
    },
    {
        "Composer": "Johann Gottlieb Janitsch",
        "ID": "5sgUFW1SRUZ77UA98IISU4",
        "Image": ""
    },
    {
        "Composer": "Wilhelm Friedemann Bach",
        "ID": "5fz5lcOIakwBiRF7vzfm0u",
        "Image": "https://i.scdn.co/image/4130515a11dbcfa80958f51cb4e595c14e3116f3"
    },
    {
        "Composer": "William Boyce",
        "ID": "7ACr1vVXFFwfQVyJm9J54z",
        "Image": "https://i.scdn.co/image/7df6ad0f7ec4b98d125a191812e54d96a29d0777"
    },
    {
        "Composer": "Charles Avison",
        "ID": "4Px5evZEvbbIPRG2h1TCyD",
        "Image": "https://i.scdn.co/image/e2431746f07629850a66bc89dcff82120ba5244d"
    },
    {
        "Composer": "Franz Xaver Richter",
        "ID": "3QyU1fkxw1jcYIy3V8Rn2e",
        "Image": "https://i.scdn.co/image/c236ba32ca6b93fead604d0cd07e45c2143ebb6c"
    },
    {
        "Composer": "Carlo Graziani",
        "ID": "0gVaYxZlLoLghUCC2R1rVi",
        "Image": "https://i.scdn.co/image/eedf945e1d4a9028b0fdf434f8414dc67ef0a5eb"
    },
    {
        "Composer": "Gaetano Latilla",
        "ID": "7sFopz1ZqUjtiT6DEnC0og",
        "Image": ""
    },
    {
        "Composer": "Christoph Schaffrath",
        "ID": "57h8zbFbb78CqY6I5VWwPk",
        "Image": ""
    },
    {
        "Composer": "James Oswald",
        "ID": "5QvJH0jWjwMxXv6WitTmtw",
        "Image": ""
    },
    {
        "Composer": "Franz Benda",
        "ID": "26ZyKPKcpyFEN0lZTpSqrn",
        "Image": "https://i.scdn.co/image/1123904f86067bc8ee997c4ae380ff25d230cfda"
    },
    {
        "Composer": "Ignaz Holzbauer",
        "ID": "6A18tc7ASx6onN5LfPcEso",
        "Image": ""
    },
    {
        "Composer": "Davide Perez",
        "ID": "1RpNGyDqWZxBELUVapwSQZ",
        "Image": ""
    },
    {
        "Composer": "Domènec Terradellas",
        "ID": "1b575gMwGNlfj53BQQvfy4",
        "Image": ""
    },
    {
        "Composer": "Frederick the Great",
        "ID": "1N2S1tQEsMdR4eu1GqVjPc",
        "Image": "https://i.scdn.co/image/003781a355d3b54ef498d7e162878d63dfb0e938"
    },
    {
        "Composer": "Christopher John Smith",
        "ID": "6mfWuW5ulTsRhMQ4gjavJt",
        "Image": ""
    },
    {
        "Composer": "Antoine Dauvergne",
        "ID": "6MNqzEKFHgC1xzfyb2CVCM",
        "Image": ""
    },
    {
        "Composer": "Johan Daniel Berlin",
        "ID": "1dhf1IsCCk2huf9MfNu5HQ",
        "Image": "https://i.scdn.co/image/6140d81df52acf54d6233e0aaa749dda5cabef9e"
    },
    {
        "Composer": "Johann Ludwig Krebs",
        "ID": "5GnYnFuiUNc9n1O9qAE97L",
        "Image": "https://i.scdn.co/image/61f1c79aefb63bb4db9dca3037c18743cb7f0187"
    },
    {
        "Composer": "Gottfried August Homilius",
        "ID": "2jThKTZICl4g9LLzuvEV7r",
        "Image": "https://i.scdn.co/image/ac62e46e2cd559669422311e8ff7581edb92db51"
    },
    {
        "Composer": "Niccolò Jommelli",
        "ID": "5kdTUTQWRRbRIfAMjHsRrm",
        "Image": ""
    },
    {
        "Composer": "Pasquale Cafaro",
        "ID": "3j0vtVTR79TYoTJpVEmQd9",
        "Image": ""
    },
    {
        "Composer": "Girolamo Abos",
        "ID": "3rIPArg6qABX80e3MsRSwr",
        "Image": ""
    },
    {
        "Composer": "John Stanley",
        "ID": "7C8ggceBzsH1ZcYHHEAAGk",
        "Image": "https://i.scdn.co/image/87d355ab76e43368c9a2d966a752057a44159c8a"
    },
    {
        "Composer": "Johann Friedrich Doles",
        "ID": "7EuEkZEnDVaZRLSTSsXzYd",
        "Image": ""
    },
    {
        "Composer": "Per Brant",
        "ID": "0KWDex5ROl2xf6ly4DZOXT",
        "Image": ""
    },
    {
        "Composer": "Christoph Willibald Gluck",
        "ID": "7vfydQ0nVBVgJ0ajs8EtRM",
        "Image": "https://i.scdn.co/image/ccf504aaea0388d64976b3dab0ab2e9f4f97b98d"
    },
    {
        "Composer": "Georg Christoph Wagenseil",
        "ID": "3yOtqy9v0Tw0BIxnbBgKht",
        "Image": "https://i.scdn.co/image/27dc83189c7ccd5d2a374e15a1cdf339f8479c48"
    },
    {
        "Composer": "Josef Seger",
        "ID": "51IfAsDTMMnS89uBAf7ftQ",
        "Image": ""
    },
    {
        "Composer": "Matthias Georg Monn",
        "ID": "4hDJQRSI84oHJZmMmEUyqr",
        "Image": ""
    },
    {
        "Composer": "Carl Philipp Emanuel Bach",
        "ID": "3meioy7GWDwpwmjv2LPyAb",
        "Image": "https://i.scdn.co/image/d43a6e1d4419102b4d55ec8ce106d8ce1eb412f4"
    },
    {
        "Composer": "John Alcock",
        "ID": "1fo7htOyEuBbA0aLF1nzE3",
        "Image": ""
    },
    {
        "Composer": "James Nares",
        "ID": "4UyusrtELTaSC6WvxpIZMF",
        "Image": ""
    },
    {
        "Composer": "Johann Stamitz",
        "ID": "3xo4qynwgOgEdxJvrGfW22",
        "Image": "https://i.scdn.co/image/d05961dea1503b00355a677fd81543ad50f17840"
    },
    {
        "Composer": "Francesco Zappa",
        "ID": "7fhoIEuFHdYugWC0lO7J8a",
        "Image": ""
    },
    {
        "Composer": "Jacques Duphly",
        "ID": "4xNWxGw10GFm8PuzKbzCxb",
        "Image": ""
    },
    {
        "Composer": "Antonio Maria Mazzoni",
        "ID": "0DFdAxOKqQBK8LQLPCqFWh",
        "Image": ""
    },
    {
        "Composer": "Nicola Conforto",
        "ID": "0cbBhy6SXFVgn2dwmUb2AV",
        "Image": ""
    },
    {
        "Composer": "Johann Christoph Altnickol",
        "ID": "09VnZqL6zORVfu5sWpfh1o",
        "Image": ""
    },
    {
        "Composer": "Giuseppe Scarlatti",
        "ID": "3p2eaehLUj1f5L3heoV159",
        "Image": ""
    },
    {
        "Composer": "Leopold Mozart",
        "ID": "5s4B01oaRxqTvONFg7Ymv1",
        "Image": "https://i.scdn.co/image/3373a72aab5bcba8cb5c2d5f18f4b15f4db56692"
    },
    {
        "Composer": "William Walond",
        "ID": "1xRUO0JhWbVAyWtbPF7pOW",
        "Image": "https://i.scdn.co/image/0cc27707468832e20f882d811db11a6db6516be4"
    },
    {
        "Composer": "Gioacchino Cocchi",
        "ID": "1qi3W2eb0uqFz8UVHSwjkX",
        "Image": ""
    },
    {
        "Composer": "Johann Friedrich Agricola",
        "ID": "1Ip7BTamdS6FuyFYdQqvOm",
        "Image": ""
    },
    {
        "Composer": "Pietro Denis",
        "ID": "0fZU9I81MU8prbqeJ41DgU",
        "Image": ""
    },
    {
        "Composer": "Bernhard Joachim Hagen",
        "ID": "4C5ayULfDjchGDFpclI1bx",
        "Image": "https://i.scdn.co/image/f0e7bbfcca1e2879bea9f140d53d58d6f8877dfa"
    },
    {
        "Composer": "Quirino Gasparini",
        "ID": "6o6OeHzC8bEwcCxbxrmTjT",
        "Image": ""
    },
    {
        "Composer": "Pietro Nardini",
        "ID": "1Q1t0pwZLsseirmN15wsD2",
        "Image": "https://i.scdn.co/image/98d95c7b42590af13911434db2e2931a446e87be"
    },
    {
        "Composer": "Pieter Hellendaal",
        "ID": "650vXTuKCzqSxHZRQDLYgR",
        "Image": "https://i.scdn.co/image/a53e068ae65de53ef1e9525ed34b3890a3db3a8d"
    },
    {
        "Composer": "Johann Philipp Kirnberger",
        "ID": "6fnQvL3k7inhG6vwbpFV7l",
        "Image": ""
    },
    {
        "Composer": "John Garth",
        "ID": "0gaoQQNgdl4uxU8TzjttkM",
        "Image": ""
    },
    {
        "Composer": "Sebastián Ramün de Albero y AÌ±aÌ±os",
        "ID": "5OSfdXdVKQkp8l876ATpFb",
        "Image": ""
    },
    {
        "Composer": "Giovanni Marco Rutini",
        "ID": "1pYbgkOyDi2tv7BfKtcKBy",
        "Image": ""
    },
    {
        "Composer": "Francesco Antonio Baldassare Uttini",
        "ID": "2O2GVkAbzrA6m0dAWRkSyw",
        "Image": ""
    },
    {
        "Composer": "Giovanni Battista Cirri",
        "ID": "3ai57kGXQ0bikXZh3idXCr",
        "Image": ""
    },
    {
        "Composer": "Johann Ernst Bach",
        "ID": "1r1i4mD5wsJKnkiZ8eNbye",
        "Image": ""
    },
    {
        "Composer": "Rafael Antonio Castellanos",
        "ID": "3TdtwbDNh1nVyLsVaFW5cg",
        "Image": ""
    },
    {
        "Composer": "Carl Friedrich Abel",
        "ID": "4tK1TZjoCeKTUr5flyNcxN",
        "Image": "https://i.scdn.co/image/47fd82ccb979f30f772db346afc57c025c4f30dd"
    },
    {
        "Composer": "Johann Christoph Kellner",
        "ID": "0sHAqRQksW5GnrOImdmdHo",
        "Image": ""
    },
    {
        "Composer": "Antonio Lolli",
        "ID": "29srCKHi7R4LIwq6puiqsg",
        "Image": ""
    },
    {
        "Composer": "Karl Kohaut",
        "ID": "0og7nQRLeAg21J1wbtkLvJ",
        "Image": "https://i.scdn.co/image/c2af7e3b94323f98867cda75d098bb7a0b79a805"
    },
    {
        "Composer": "Philip Hayes",
        "ID": "1m87XcQmuku81Rn7WNkRzM",
        "Image": ""
    },
    {
        "Composer": "Claude Balbastre",
        "ID": "3LPbfvn0fOPv78Ogri8CpN",
        "Image": ""
    },
    {
        "Composer": "Giovanni Paisiello",
        "ID": "11RfnL7BO42Nm3MzSB5QDa",
        "Image": "https://i.scdn.co/image/12d5ff597f6d9bb83233dcd53fa0840600af7da8"
    },
    {
        "Composer": "Joseph Starzer",
        "ID": "1n70ZINmPhrStQCvqYLJQR",
        "Image": ""
    },
    {
        "Composer": "Jan Adam Gallina",
        "ID": "7LH9VQGheK9Vqd8QLk6lOp",
        "Image": "https://i.scdn.co/image/a9274be76dce45092cb8a4df5106fe95b4bc3a46"
    },
    {
        "Composer": "Pasquale Anfossi",
        "ID": "0ASAcfLQK0TxF5ZcGbyvI2",
        "Image": ""
    },
    {
        "Composer": "Johann Becker",
        "ID": "5TBiWbOL3ZcYTkZKah748Z",
        "Image": ""
    },
    {
        "Composer": "Pierre-Montan Berton",
        "ID": "6NvWGhycYYXcfypuojS4hM",
        "Image": ""
    },
    {
        "Composer": "François-André-Danican Philidor",
        "ID": "4XllC7nMxqvTAbj1F9VqSD",
        "Image": ""
    },
    {
        "Composer": "Tommaso Traetta",
        "ID": "6E5mJxlDGZc2g3ICH2anZj",
        "Image": ""
    },
    {
        "Composer": "Johann Gottlieb Goldberg",
        "ID": "5E26lyQXoDmCaf1sRmpWwu",
        "Image": ""
    },
    {
        "Composer": "Johann Wilhelm Hertel",
        "ID": "494MRttG6b9DeZxaqSYO7G",
        "Image": "https://i.scdn.co/image/872ac15a521b1f8061400ae1e4776dc3a4837ea6"
    },
    {
        "Composer": "Friedrich Hartmann Graf",
        "ID": "7yYSD0UsjBV87530xLvcs2",
        "Image": ""
    },
    {
        "Composer": "François Martin",
        "ID": "6nkx9qOsZP8pUyEAYz2qym",
        "Image": ""
    },
    {
        "Composer": "Johann Gottfried Muthel",
        "ID": "35HWYnCMvXaV5Zn6bP2Ueg",
        "Image": ""
    },
    {
        "Composer": "Pietro Alessandro Guglielmi",
        "ID": "6kc377FOmImIgVjPG767pP",
        "Image": ""
    },
    {
        "Composer": "Hermann Raupach",
        "ID": "5ZxLoMvu5DfZtm1k6ofFCy",
        "Image": ""
    },
    {
        "Composer": "Niccolo Piccinni",
        "ID": "40OAUwFkiXg8XGiSofPqPJ",
        "Image": ""
    },
    {
        "Composer": "Johann Adam Hiller",
        "ID": "4ZvDoU9ERSWWo7veyKPVM2",
        "Image": ""
    },
    {
        "Composer": "Anton Cajetan Adlgasser",
        "ID": "5ydMaLEfH3L0i6QdPP7FUr",
        "Image": ""
    },
    {
        "Composer": "Florian Leopold Gassmann",
        "ID": "1hCfkEQfoSnVOj9T21iBlE",
        "Image": ""
    },
    {
        "Composer": "Pierre van Maldere",
        "ID": "1Q3Wa9bpeCwiE1Gqg2mHyE",
        "Image": ""
    },
    {
        "Composer": "Pierre-Alexandre Monsigny",
        "ID": "7oXrkSulSLaqNSapeXx8An",
        "Image": ""
    },
    {
        "Composer": "Giuseppe Sarti",
        "ID": "0z4M9DuPsmYHerg7LxiFq7",
        "Image": "https://i.scdn.co/image/d6ed8c9956d1802f50803385f3a0853dbaac1b98"
    },
    {
        "Composer": "Georg Robert von Pasterwitz",
        "ID": "4caZgdkYaJ0Ss5tp80MVBU",
        "Image": ""
    },
    {
        "Composer": "Antonio Soler",
        "ID": "5kUi36wXiRNh6Ib7DnIy4f",
        "Image": "https://i.scdn.co/image/d34b6c0f392805542fa6da0de8ab41142f36a86e"
    },
    {
        "Composer": "Giovanni Meneghetti",
        "ID": "07V2ccJgOJgtVg21GJDRd0",
        "Image": ""
    },
    {
        "Composer": "Carl Ditters von Dittersdorf",
        "ID": "0Wgs2IKNSvS2ysab5XOfkN",
        "Image": "https://i.scdn.co/image/2e8cb049b5fe5e4b72e8964cbb61e9a623d960a4"
    },
    {
        "Composer": "Capel Bond",
        "ID": "0XNX2voncTfhNN7TALyQ5w",
        "Image": ""
    },
    {
        "Composer": "Antonio Sacchini",
        "ID": "2rgNsQpcCoCWsvRc34zULU",
        "Image": ""
    },
    {
        "Composer": "William Jackson",
        "ID": "1W4RZP9tOkbbsxkkViDaBD",
        "Image": "https://i.scdn.co/image/fa3bbc33beb1134fcd7d73b660f04927715260b7"
    },
    {
        "Composer": "Christian Cannabich",
        "ID": "7k2aUIIMVkxJAwt51Ov7fN",
        "Image": ""
    },
    {
        "Composer": "Giuseppe Demachi",
        "ID": "3SkT0KE8cXC4dJnMIJkGXW",
        "Image": ""
    },
    {
        "Composer": "Gaetano Pugnani",
        "ID": "02TPcAGsJLwI40oYlva8gy",
        "Image": "https://i.scdn.co/image/f48e511bf2840fb7c54791ab7ad795663fb05bd4"
    },
    {
        "Composer": "Pierre Vachon",
        "ID": "3eoDydJvQ6KYPeNrnxCJWg",
        "Image": ""
    },
    {
        "Composer": "Gian Francesco de Majo",
        "ID": "4PMq3Thvp9DWsy7sBIrqwj",
        "Image": ""
    },
    {
        "Composer": "Franz Joseph Haydn",
        "ID": "656RXuyw7CE0dtjdPgjJV6",
        "Image": "https://i.scdn.co/image/8c542f22fe3fdb45e8c908f8c9dbacf764b1ae44"
    },
    {
        "Composer": "Johann Christian Kittel",
        "ID": "5Ocd6O1lRkrMQpXgQRhpb5",
        "Image": ""
    },
    {
        "Composer": "Johann Christian Fischer",
        "ID": "08G9u9N2LGuA68RuDBQJRl",
        "Image": ""
    },
    {
        "Composer": "Franz Ignaz Beck",
        "ID": "7hAPULAiKHfiE5MsUQSUeR",
        "Image": ""
    },
    {
        "Composer": "Jean-Jacques Beauvarlet-Charpentier",
        "ID": "69CxH8eJ1pduaLXv5FkVYx",
        "Image": ""
    },
    {
        "Composer": "Karl von Ordonez",
        "ID": "2Y5k1HBnpzcJMHFFNh5pYi",
        "Image": "https://i.scdn.co/image/74e5abd7c5daf6a4b277e7bd5975eae31147c7c7"
    },
    {
        "Composer": "Benjamin Cooke",
        "ID": "2guxve7rJCeTXafVMJWIZc",
        "Image": ""
    },
    {
        "Composer": "Francois-Joseph Gossec",
        "ID": "1KBWt9hc5YE25x6Bcr1zps",
        "Image": "https://i.scdn.co/image/8abc092919340eeb8b03a57cd7a99fd3ec742806"
    },
    {
        "Composer": "Johann Christoph Friedrich Bach",
        "ID": "6T42Lm3lRfFAQrWyA3Svsr",
        "Image": "https://i.scdn.co/image/aa67990c519cba9645f7efda7de0ea53cf2b5ba5"
    },
    {
        "Composer": "Ignazio Spergher",
        "ID": "16oUVXpqIofnkHvM0zfgup",
        "Image": ""
    },
    {
        "Composer": "Giovanni Battista Cervellini",
        "ID": "1TXyE8yqnFn8eiEtvYbU5X",
        "Image": ""
    },
    {
        "Composer": "John Collett",
        "ID": "2wWLaPKcydQGdcz9KlR9W6",
        "Image": ""
    },
    {
        "Composer": "Anton Schweitzer",
        "ID": "3dmkhyXL3wJg34RfMJNaPU",
        "Image": "https://i.scdn.co/image/b5e3e26f555b6380ca9f6e50f9b86212cc123c4f"
    },
    {
        "Composer": "Johann Christian Bach",
        "ID": "0ebni9QrrWMvEgH40nOWZQ",
        "Image": "https://i.scdn.co/image/8e101caaa0056a9d76bf80847d2aa706b164895d"
    },
    {
        "Composer": "John Bennett",
        "ID": "7lrl68wtTgB1btTCoHb8j0",
        "Image": "https://i.scdn.co/image/3ebe193dcd02f9819576d78d0df62686a34346b7"
    },
    {
        "Composer": "Ernst Wilhelm Wolf",
        "ID": "26FxB0VY5N9JrEF1S7Nk3Z",
        "Image": "https://i.scdn.co/image/0f2526d0697af36adf233d8e9a13c35f49e7abf4"
    },
    {
        "Composer": "Carl Friedrich Christian Fasch",
        "ID": "6JLqNYDqd0B9eIEY4bdXf1",
        "Image": ""
    },
    {
        "Composer": "Johann Georg Albrechtsberger",
        "ID": "49Aq12YWwKS5hg8pgInIRW",
        "Image": "https://i.scdn.co/image/4651a87137a139e1cdb7242d8aff7e44420f4e9d"
    },
    {
        "Composer": "Antonio Tozzi",
        "ID": "6ENa2xXZko3Fv1Lh0HJSif",
        "Image": "https://i.scdn.co/image/64acaa952e4db7196ab1a8fff0f90cb08efde8e0"
    },
    {
        "Composer": "Michael Haydn",
        "ID": "3rGstcVKQhx8DhhJzIVQoe",
        "Image": "https://i.scdn.co/image/bda1052dee2aebad1f912783b1e4c783dcdbb44c"
    },
    {
        "Composer": "Tommaso Giordani",
        "ID": "3kRXTKNW1P63F3njZ3tLdr",
        "Image": ""
    },
    {
        "Composer": "Friedrich Schwindl",
        "ID": "2jIrnFujRgsRpL1rmAsXR9",
        "Image": ""
    },
    {
        "Composer": "William Herschel",
        "ID": "1vXOHfaPrjlCiXWHpKHgdf",
        "Image": ""
    },
    {
        "Composer": "Francois-Hippolyte Barthelemon",
        "ID": "1pWaw40LykQ83AzWVEa9Sk",
        "Image": ""
    },
    {
        "Composer": "Franz Xaver Hammer",
        "ID": "14ZYkHo5U47fERw3VZBEmM",
        "Image": ""
    },
    {
        "Composer": "Johann Strauss II",
        "ID": "5goS0v24Fc1ydjCKQRwtjM",
        "Image": "https://i.scdn.co/image/13df907452086739d886713fa2005c8ec03ee340"
    },
    {
        "Composer": "Johann Baptist Wanhal",
        "ID": "6mPwuN6fC3q5v8jBPWLutn",
        "Image": ""
    },
    {
        "Composer": "Leopold Hofmann",
        "ID": "0n0v0UMvVzA9NFLY9ctDMT",
        "Image": "https://i.scdn.co/image/f4fdd23424ce83b73727f08648b324141fced65e"
    },
    {
        "Composer": "Michael Arne",
        "ID": "09KsosajGxApQs7OVJT41F",
        "Image": ""
    },
    {
        "Composer": "Samuel Arnold",
        "ID": "2Ktjp8bidiSir0ep0R5g8V",
        "Image": "https://i.scdn.co/image/b84b692ff5e6b380aa931970db24f23ce9aabfde"
    },
    {
        "Composer": "Ernst Eichner",
        "ID": "5ksdKR5sWmhA7BXhK2IhnU",
        "Image": ""
    },
    {
        "Composer": "Luigi Gatti",
        "ID": "2xGVspD67CVfSf1upSMrWs",
        "Image": ""
    },
    {
        "Composer": "Andrea Luchesi",
        "ID": "4ucxPL2ArQiRjaUjx4Exh6",
        "Image": ""
    },
    {
        "Composer": "Guillaume Lasceux",
        "ID": "2Iwje1gUaTlh9T2kdqD1QW",
        "Image": ""
    },
    {
        "Composer": "André-Ernest-Modeste Grétry",
        "ID": "1P4zceYumMICJvWy9Ih3W0",
        "Image": "https://i.scdn.co/image/1b1c8a7b84f1a03e609583e31a982ee551ad41a4"
    },
    {
        "Composer": "Johann Schobert",
        "ID": "00AvfPm2fQHShd4vt7kdE8",
        "Image": "https://i.scdn.co/image/d8de5fed486de05b97ab6e196c4a332ae9fad525"
    },
    {
        "Composer": "Václav Pichl",
        "ID": "3s7A9fIVw9pzZWqc4ixe79",
        "Image": ""
    },
    {
        "Composer": "Johann Gottlieb Naumann",
        "ID": "6IBWM3JIyvowwWGcNm2TaA",
        "Image": ""
    },
    {
        "Composer": "Jean Paul Egide Martini",
        "ID": "3NuYWtwa3fHQmlYdGJnZ4l",
        "Image": ""
    },
    {
        "Composer": "Leopold Kozeluch",
        "ID": "7C5oAOwd8u6WbaKEn7NJEl",
        "Image": "https://i.scdn.co/image/21371751592cd7168b0e6c459ae777ef2542aacd"
    },
    {
        "Composer": "Alois Luigi Tomasini",
        "ID": "4U1huMELvkCAKj9uVcYo6k",
        "Image": ""
    },
    {
        "Composer": "Jean-Baptiste Davaux",
        "ID": "35zTz2xRVql1qfrl8iY8KW",
        "Image": ""
    },
    {
        "Composer": "Vasily Pashkevich",
        "ID": "3hI3wp1zim3vEOmPTwRmUD",
        "Image": ""
    },
    {
        "Composer": "Gaetano Brunetti",
        "ID": "6tNrbFGcfaJni7MgILjpvE",
        "Image": ""
    },
    {
        "Composer": "Anton Zimmermann",
        "ID": "4Uu69JXg1V2HayHQBy9AGW",
        "Image": "https://i.scdn.co/image/7ae776eb792e4aee5a3437515737d3d2c9c1d432"
    },
    {
        "Composer": "Luigi Boccherini",
        "ID": "2l4vGfFV7e46yO8lxfxR76",
        "Image": "https://i.scdn.co/image/9577580a40b7188dd61e8d7073f5fe09c324dfed"
    },
    {
        "Composer": "Joseph Beer",
        "ID": "4QjVdEAF22ECLQSMrxKVQX",
        "Image": ""
    },
    {
        "Composer": "Ferdinando Gasparo Turrini",
        "ID": "4b4F7azOcDxCa3suEGXRAo",
        "Image": ""
    },
    {
        "Composer": "Giuseppe Gazzaniga",
        "ID": "3smS7pdrcGVlRCoY7el9ov",
        "Image": ""
    },
    {
        "Composer": "Maksym Berezovsky",
        "ID": "29OELj0kdryKFojlBySmxr",
        "Image": "https://i.scdn.co/image/c6a86d0920949ff3b30231645b90522a2234d1ea"
    },
    {
        "Composer": "Franz Nikolaus Novotny",
        "ID": "4o1DvJxrozHEI1prSmfc62",
        "Image": ""
    },
    {
        "Composer": "Joao de Sousa Carvalho",
        "ID": "0lUtb2fdJg7i9YqK7lcR0v",
        "Image": ""
    },
    {
        "Composer": "Carlo Franchi",
        "ID": "7rVShTjREDmitMMhiwtgBW",
        "Image": ""
    },
    {
        "Composer": "William Billings",
        "ID": "2wqMB8bWGc53kP74XLbQX1",
        "Image": ""
    },
    {
        "Composer": "Joseph Bengraf",
        "ID": "0LgkF4U9WdJ8ClIptoQfnl",
        "Image": ""
    },
    {
        "Composer": "Wolfgang Amadeus Mozart",
        "ID": "4NJhFmfw43RLBLjQvxDuRS",
        "Image": "https://i.scdn.co/image/2e7d4f7373412a29da4fa6ae4732396168662f9f"
    },
    {
        "Composer": "Georg Druschetzky",
        "ID": "7fxB8Moi08JvxHaN3f5DCC",
        "Image": ""
    },
    {
        "Composer": "Maddalena Laura Lombardini Sirmen",
        "ID": "1TfN8EV5lVoZ7Iq2QNkdMa",
        "Image": ""
    },
    {
        "Composer": "Giuseppe Maria Cambini",
        "ID": "1h1ehhJYPZwZUyLS5By30j",
        "Image": "https://i.scdn.co/image/c1434c8e2985e7be7ddb84f5b9519d93661547e0"
    },
    {
        "Composer": "Carl Stamitz",
        "ID": "07GFs4QjIiUspOwYP24qP5",
        "Image": "https://i.scdn.co/image/3111184c096f81fcfa75c02257e8a5e9bded0405"
    },
    {
        "Composer": "Jan Nepomuk Vent",
        "ID": "2TsHek4cCh7BoEXZYod7MC",
        "Image": ""
    },
    {
        "Composer": "Johann Stamitz",
        "ID": "3xo4qynwgOgEdxJvrGfW22",
        "Image": "https://i.scdn.co/image/d05961dea1503b00355a677fd81543ad50f17840"
    },
    {
        "Composer": "Francesco Azopardi",
        "ID": "0VkgX2L6MXaJaXFusZvNIy",
        "Image": ""
    },
    {
        "Composer": "Joseph Schuster",
        "ID": "20c8fobVGYB5zZERke3VHR",
        "Image": "https://i.scdn.co/image/8ab88e2260cc2048102e458f8b715058b4e6e539"
    },
    {
        "Composer": "James Hook",
        "ID": "3MtSPfL4OhW7nFrMQtdUe2",
        "Image": ""
    },
    {
        "Composer": "Giovanni Punto",
        "ID": "5jOKQhxYkN17aRgTDphMhB",
        "Image": "https://i.scdn.co/image/4709bd0834c417dc6cab278353cd12b38995691b"
    },
    {
        "Composer": "Ivan Khandoshkin",
        "ID": "1TQUhFvv7G4nRRFZ2P9wKW",
        "Image": "https://i.scdn.co/image/bb71d3cb7e67a3dc215f7f1ed81e3106b3e22e41"
    },
    {
        "Composer": "Johann Friedrich Peter",
        "ID": "5RPBccq4pICSUo4nQVIQCH",
        "Image": ""
    },
    {
        "Composer": "Antonio Rosetti",
        "ID": "3oI1VmAa821ogGTGIcb3qN",
        "Image": "https://i.scdn.co/image/346e9f13805003f414475e2f2035f96d7760b7d7"
    },
    {
        "Composer": "Josef Fiala",
        "ID": "16P3Gv8q5PTfHzqyBOvHiC",
        "Image": "https://i.scdn.co/image/9207ddcdd2c058e80adc411ab2f738428836c833"
    },
    {
        "Composer": "Joseph Quesnel",
        "ID": "3QmG29yb4JclbOycGwscNl",
        "Image": ""
    },
    {
        "Composer": "Justin Morgan",
        "ID": "1KlLeI5ilvpKwAzE6EzxIG",
        "Image": "https://i.scdn.co/image/634f4489f006d8eb8f8feec62783092fadacb996"
    },
    {
        "Composer": "Bartolomeo Campagnoli",
        "ID": "475rh7DliRsDAJuN8GgHlz",
        "Image": ""
    },
    {
        "Composer": "Johann Abraham Peter Schulz",
        "ID": "2wAjgQbL7hf3b7wFtNpVcl",
        "Image": "https://i.scdn.co/image/864a8e0af85041e03e21540a2714d713f15671d6"
    },
    {
        "Composer": "John Mahon",
        "ID": "2ayhKAIwS2NYUfNW7D7dbo",
        "Image": "https://i.scdn.co/image/2d7a2098ce11133054627a219a45b4197de68b3d"
    },
    {
        "Composer": "Emanuel Aloys Forster",
        "ID": "2xxzQj7Gi6tbmX0OdBv2ge",
        "Image": ""
    },
    {
        "Composer": "Christian Gottlob Neefe",
        "ID": "2DtZwF1LKXqqNd4PhCa5Ex",
        "Image": ""
    },
    {
        "Composer": "Domenico Cimarosa",
        "ID": "3UyRRlpJO3uCojQkBibqNZ",
        "Image": "https://i.scdn.co/image/935e2d18e4e010e3ca02a3dbd94459d5f9aea60e"
    },
    {
        "Composer": "William Shield",
        "ID": "7B8nY3TppdLIvHpuip2rnE",
        "Image": ""
    },
    {
        "Composer": "Jean-Frederic Edelmann",
        "ID": "5Til9i9o4syGI7YiK1iEOF",
        "Image": ""
    },
    {
        "Composer": "Jean-Louis Duport",
        "ID": "4QqTfBDO9OYjN68oq8biib",
        "Image": ""
    },
    {
        "Composer": "Antonio Salieri",
        "ID": "4zAMiCvE5KTXuTHxi56cPE",
        "Image": "https://i.scdn.co/image/e696fea8a7ec205266aaffbbb631d2d9724948c4"
    },
    {
        "Composer": "Abbé Georg Joseph Vogler",
        "ID": "41SsqXJOkU39U60BPguwTS",
        "Image": "https://i.scdn.co/image/d2ff5c1a314179b1a33ce8048f8b125b79e67fa8"
    },
    {
        "Composer": "Francesco Bianchi",
        "ID": "7qoQrmqalBc53mgVGugcOU",
        "Image": "https://i.scdn.co/image/f421eaa7eb7287f2ba84e11f3a7ef7889652e4b9"
    },
    {
        "Composer": "Giovanni Cifolelli",
        "ID": "42mR1aLwZqWV0pRZj5iYfS",
        "Image": ""
    },
    {
        "Composer": "Johann Franz Xaver Sterkel",
        "ID": "5Td1ljhODAYpsiTCJ9M6Nv",
        "Image": ""
    },
    {
        "Composer": "John Stafford Smith",
        "ID": "2aNSLswil0DmMEtpKyAQV9",
        "Image": ""
    },
    {
        "Composer": "Johannes Matthias Sperger",
        "ID": "4pJVnCwq09Q7PFhQzyabAs",
        "Image": "https://i.scdn.co/image/77831ce87a16f4da6ed84107858c0ec7e8ded4a3"
    },
    {
        "Composer": "Dmitry Bortniansky",
        "ID": "120rJmJK7OSWyvtEIqG5XX",
        "Image": ""
    },
    {
        "Composer": "Giuseppe Giordani",
        "ID": "0ZEUwDWj56BdnmBB4om1jf",
        "Image": ""
    },
    {
        "Composer": "Johann Samuel Schroeter",
        "ID": "6V5dmaGRVmX6PfSyOXPFHl",
        "Image": ""
    },
    {
        "Composer": "Corona Elisabeth Wilhelmine Schroter",
        "ID": "2MY0TKJibSFI0EoiepECsU",
        "Image": ""
    },
    {
        "Composer": "William Smethergell",
        "ID": "5vYYAm6x9pJCo6PpUsd0Ml",
        "Image": ""
    },
    {
        "Composer": "Vicente Martün Y Soler",
        "ID": "3QNhCkrXRNFHFPxxjEkmEp",
        "Image": ""
    },
    {
        "Composer": "Ludwig August Lebrun",
        "ID": "2AE8gL2coke38ug6AQFA57",
        "Image": "https://i.scdn.co/image/a31d92dcbffb0fbbed2e8a3dcf8afb76054669d5"
    },
    {
        "Composer": "John Marsh",
        "ID": "2XzmapOdG0v6RgTk6pD0QG",
        "Image": "https://i.scdn.co/image/ab890702d3e2ef501d41d5ca0ede8643a0ec92da"
    },
    {
        "Composer": "Josef Reicha",
        "ID": "4TfNToAkyMkrGjbdeEhJx3",
        "Image": ""
    },
    {
        "Composer": "Muzio Clementi",
        "ID": "47e2jUYcqSQ8RL2DVmxmzn",
        "Image": "https://i.scdn.co/image/a18cadf0f113d42250b0f93d4dc73985eaf99896"
    },
    {
        "Composer": "Franz Grill",
        "ID": "3Y473UxV2p2NDJu8A4C4xq",
        "Image": ""
    },
    {
        "Composer": "Johann Friedrich Reichardt",
        "ID": "30WUDFHc0goZHd00HxGSyO",
        "Image": ""
    },
    {
        "Composer": "Justin Heinrich Knecht",
        "ID": "08ZzzUbfnpDqxWASmq2kUn",
        "Image": ""
    },
    {
        "Composer": "Niccolü Antonio Zingarelli",
        "ID": "7mPVGqs6pyIZf3gPbiKhcS",
        "Image": ""
    },
    {
        "Composer": "Nicolas-Marie Dalayrac",
        "ID": "3WjrYOz9RdauRJ1cYgS5sz",
        "Image": ""
    },
    {
        "Composer": "Christian Friedrich Ruppe",
        "ID": "58odqGSagjBKBvp1oLaiYG",
        "Image": ""
    },
    {
        "Composer": "Johann Baptist Schenk",
        "ID": "2FJON0A1XLvC5AE7o4Cnof",
        "Image": ""
    },
    {
        "Composer": "Johan Wikmanson",
        "ID": "3F1RZ0mUTUS8yoXYKIgzU3",
        "Image": ""
    },
    {
        "Composer": "Franz Anton Hoffmeister",
        "ID": "2TxIbIf3EiutjCRSkhDaDy",
        "Image": "https://i.scdn.co/image/434dcd7b31fdd5a6d83c602df2bf4fbfd74ca539"
    },
    {
        "Composer": "Federigo Fiorillo",
        "ID": "2HQZFyiJrksYZN3hiM5uOq",
        "Image": "https://i.scdn.co/image/840ad2d24f88fcca0b73c1ee3c989cdb77c8cb00"
    },
    {
        "Composer": "Peter von Winter",
        "ID": "3DoJAyksa2qVrCI0OiwZrH",
        "Image": "https://i.scdn.co/image/6706c60d72eef1c156c44e5748475e6d36c5e828"
    },
    {
        "Composer": "Etienne Ozi",
        "ID": "7c3yXRd8ZwZwFL5pvr27wY",
        "Image": ""
    },
    {
        "Composer": "Giovanni Battista Viotti",
        "ID": "7e481IDyzSINMX6tH8YCab",
        "Image": "https://i.scdn.co/image/86f477c691cc88969e919ee89a3d85a23c2ab5a1"
    },
    {
        "Composer": "Michel Yost",
        "ID": "0Qq2BLiUSZrmLMoeCQLyxc",
        "Image": ""
    },
    {
        "Composer": "Antoine Frédéric Gresnick",
        "ID": "0wQgjKlddWyhxZ0Zj13JhA",
        "Image": ""
    },
    {
        "Composer": "Wilhelm Friedrich Ernst Bach",
        "ID": "0zAGZu2fUUuVGjrWzFPs1k",
        "Image": ""
    },
    {
        "Composer": "Giuseppe Ferlendis",
        "ID": "5jYFheK3JWqNBF3lx3nl5W",
        "Image": ""
    },
    {
        "Composer": "Alexander Reinagle",
        "ID": "2cCkx2FNhnkc1w4Q0Fc8Kn",
        "Image": ""
    },
    {
        "Composer": "Maria Theresa von Paradis",
        "ID": "2zyLLhavAl32o2ZIoWpfsT",
        "Image": ""
    },
    {
        "Composer": "Joseph Martin Kraus",
        "ID": "5Sh5bcsXTZJZlRgIrK1NxW",
        "Image": "https://i.scdn.co/image/e1fbc7aeafbe441b18bfe670215e8eececc78bc1"
    },
    {
        "Composer": "Ignaz Pleyel",
        "ID": "7LQsXsBaqdpd0GMVJe7drZ",
        "Image": "https://i.scdn.co/image/69e430498b0b32361e43de1b21850554d510e640"
    },
    {
        "Composer": "Josepha Barbara von Auernhammer",
        "ID": "1enE3dUczZVOZshcSsj2wn",
        "Image": ""
    },
    {
        "Composer": "Antonio Calegari",
        "ID": "0icHwAt0ofvx4VoKWMkUIm",
        "Image": ""
    },
    {
        "Composer": "Daniel Gottlob Türk",
        "ID": "4bKWcSkuhglMD7sbIDazSF",
        "Image": ""
    },
    {
        "Composer": "Paul Wranitzky",
        "ID": "6ZQRndtfkctetzKWE32YhJ",
        "Image": ""
    },
    {
        "Composer": "Vincenzo Righini",
        "ID": "2wOPMeVLxnDrnd0VGoMMp2",
        "Image": ""
    },
    {
        "Composer": "Gaetano Valeri",
        "ID": "6t7ZOEbpSAXQ0vmwkVpmp3",
        "Image": ""
    },
    {
        "Composer": "Friedrich Ludwig Aemilius Kunzen",
        "ID": "1LhBx5ZbpCMXKUgZOoE4kM",
        "Image": "https://i.scdn.co/image/7229e6b6418fbcec82df5332e19ab02fdc655c68"
    },
    {
        "Composer": "Carl Friedrich Zelter",
        "ID": "3OQDR5VyyHPURZ2fyE8CDa",
        "Image": ""
    },
    {
        "Composer": "Alessandro Rolla",
        "ID": "2UHRIqEuDWLNreZBp94lM4",
        "Image": ""
    },
    {
        "Composer": "Benedikt Schack",
        "ID": "7FH4WEkOEfqCIb6KxlAjrY",
        "Image": ""
    },
    {
        "Composer": "Francois Devienne",
        "ID": "5vgAYxogfSCdoUDjqXqjmp",
        "Image": "https://i.scdn.co/image/b649638ab73224ae176a3875f20b1e842d3954b7"
    },
    {
        "Composer": "Luigi Cherubini",
        "ID": "1SXRDJxjOty2T43t4gXAnk",
        "Image": "https://i.scdn.co/image/650d7657aa3645aa8cc63a49ff8dbde94285d317"
    },
    {
        "Composer": "Johann Ladislaus Dussek",
        "ID": "72kMxf51KK4mKY3kRX7Uve",
        "Image": ""
    },
    {
        "Composer": "Stephen Storace",
        "ID": "7DWSE4brrBrZfWgDpyqJ6y",
        "Image": ""
    },
    {
        "Composer": "Franz Krommer",
        "ID": "0QIh2G4Tu6jJSqnP03fpJW",
        "Image": "https://i.scdn.co/image/ca6c1b90f421a0f0cef53422e75632958ceede67"
    },
    {
        "Composer": "Johann Christian Friedrich Haeffner",
        "ID": "7dbTJq2VbMzN7TkiJjfXID",
        "Image": ""
    },
    {
        "Composer": "Franz Christoph Neubauer",
        "ID": "1Ua8RgwJUQgPdA9GMZJN6u",
        "Image": ""
    },
    {
        "Composer": "Angelo Tarchi",
        "ID": "5eLvIlNN0yR0hshDtl9sAY",
        "Image": ""
    },
    {
        "Composer": "Johann Rudolf Zumsteeg",
        "ID": "7yoD0mUNfjbK92uvoNP1jD",
        "Image": ""
    },
    {
        "Composer": "Pierre Gaveaux",
        "ID": "2XamJbVn0I3XGhpPGfUw93",
        "Image": ""
    },
    {
        "Composer": "Erik Tulindberg",
        "ID": "1DlCBgiYgeNBtbnsZEdiRn",
        "Image": ""
    },
    {
        "Composer": "Adalbert Gyrowetz",
        "ID": "7z9VQEeht1fKH2GDR1WWLp",
        "Image": ""
    },
    {
        "Composer": "Jean Xavier Lefevre",
        "ID": "4dQ2NbBlFqbhTOoubyte5e",
        "Image": ""
    },
    {
        "Composer": "Franz Danzi",
        "ID": "6k3Ws6wp7iOp7lN7pxsfjT",
        "Image": "https://i.scdn.co/image/40d5c8802af1d35f7f86adafa905a794a9381d06"
    },
    {
        "Composer": "Johann Simon Mayr",
        "ID": "2vbFFM9R4juvT5mTFMkUth",
        "Image": "https://i.scdn.co/image/7be817adc9ad2aa8f9ca8be81892dc8300b5b547"
    },
    {
        "Composer": "Domenico Dragonetti",
        "ID": "7pmy3Uf55KYqSRgXZTiR4F",
        "Image": ""
    },
    {
        "Composer": "Valentino Fioravanti",
        "ID": "0kEuO47LP8a0BZGnpslQYw",
        "Image": ""
    },
    {
        "Composer": "Wilhelm Peterson-Berger",
        "ID": "1pnzip6Xgb2Qs3xWHFx6Jt",
        "Image": "https://i.scdn.co/image/400c9c90179579ecf70e0ccf8aec8c224c2414b2"
    },
    {
        "Composer": "Henri Herz",
        "ID": "1S7g9vS9FKgRL58StTw43l",
        "Image": ""
    },
    {
        "Composer": "Cesare Pugni",
        "ID": "2Bd1yI8KlQ6zni5mUfHjc4",
        "Image": ""
    },
    {
        "Composer": "Louise Farrenc",
        "ID": "3cCP79U05k4MrNSU06eBy2",
        "Image": "https://i.scdn.co/image/9e28fe88d5886c6a7963f2421d4e63dcbb61644f"
    },
    {
        "Composer": "Adolphe Adam",
        "ID": "71VUVLmoTKKYfIugkavMeS",
        "Image": "https://i.scdn.co/image/e7747c8202d4a9e724c7cc23afb4974671c258b3"
    },
    {
        "Composer": "Franz Paul Lachner",
        "ID": "3WTI4rpJrtBnry5ALqFKwk",
        "Image": "https://i.scdn.co/image/108918d508e1f23b659918ac619ea0ae51e25891"
    },
    {
        "Composer": "Hector Berlioz",
        "ID": "11T8SOX82xraocZzUXzkvM",
        "Image": "https://i.scdn.co/image/02fa3aaf33c47f77415f17ebaa08be980324970f"
    },
    {
        "Composer": "Ignaz Lachner",
        "ID": "2K024xLePLxJbrNG4zVW7w",
        "Image": ""
    },
    {
        "Composer": "Mikhail Glinka",
        "ID": "1GEuHbNwTRj4QPyoythtBh",
        "Image": "https://i.scdn.co/image/3d094167cc7c7f65623fbd426356c32e1c5cfdcd"
    },
    {
        "Composer": "Johann Strauss I",
        "ID": "4WMHJgeJCssiGW3ssUT7eb",
        "Image": "https://i.scdn.co/image/3fc6f24a8bfadde2444e1e95dfb479f05639b357"
    },
    {
        "Composer": "Fanny Mendelssohn",
        "ID": "2Wj0NreQeOfrGxnPIaLcCi",
        "Image": "https://i.scdn.co/image/e022a57741294f2b5601929353de2d3ce7241948"
    },
    {
        "Composer": "Johann Kaspar Mertz",
        "ID": "06ZJnihZcaNruiWz4KWbRx",
        "Image": "https://i.scdn.co/image/dee9dc8768af68830bc432a8210c46555260ce01"
    },
    {
        "Composer": "Otto Jonas Lindblad",
        "ID": "2iFKcghd6GTtAKEe4eWPP6",
        "Image": ""
    },
    {
        "Composer": "Michael William Balfe",
        "ID": "7HuGWZ45JRS6T6Mu8yS7zW",
        "Image": "https://i.scdn.co/image/85d66758049e6acc653fe1e96cba58527fb944ec"
    },
    {
        "Composer": "Felix Mendelssohn",
        "ID": "6MF58APd3YV72Ln2eVg710",
        "Image": "https://i.scdn.co/image/26c5589f0d075be87cdcf66ebd3bdab0fe7e9138"
    },
    {
        "Composer": "Ludwig Schuncke",
        "ID": "2yjQ3NuzLiKUgNuQqzKAbX",
        "Image": ""
    },
    {
        "Composer": "Robert Schumann",
        "ID": "2UqjDAXnDxejEyE0CzfUrZ",
        "Image": "https://i.scdn.co/image/dd68ecbf195cd1efe59eeca468ccaaf915e4444f"
    },
    {
        "Composer": "Otto Nicolai",
        "ID": "5Cnc0noHxdjlRyiRPPvvjq",
        "Image": "https://i.scdn.co/image/f68664019b99283505b8c7a957e3cfd4c50be3ae"
    },
    {
        "Composer": "Budapest Ferenc Erkel Chamber Orchestra",
        "ID": "6GknxwK9Gbjgg3P3Qqyay1",
        "Image": "https://i.scdn.co/image/c6bbf294e3fdb5ce3cefcd5e0ac317ff00609b89"
    },
    {
        "Composer": "Wilhelm Taubert",
        "ID": "0xUuarjLZYfAOt6ca0yQkv",
        "Image": ""
    },
    {
        "Composer": "Ferdinand David",
        "ID": "0Zi3K8wNktyPQ3ZwNLXRvH",
        "Image": "https://i.scdn.co/image/583433d00161b66f4fa0ea0fcf1319de662c18e8"
    },
    {
        "Composer": "Franz Liszt",
        "ID": "1385hLNbrnbCJGokfH2ac2",
        "Image": "https://i.scdn.co/image/a13888f83f05b60b04c5ac5d34486b4afb8e0557"
    },
    {
        "Composer": "Ferdinand Hiller",
        "ID": "6K4d8IgQ373cKaACnR8WJh",
        "Image": ""
    },
    {
        "Composer": "Ambroise Thomas",
        "ID": "4b83P4cnmD7hqhoUkgGEsN",
        "Image": "https://i.scdn.co/image/eb1899bfcea2cbcdf9af1c0f25e12f69705a3741"
    },
    {
        "Composer": "Emilie Mayer",
        "ID": "4zkusum5eZdIObW4RHOkIh",
        "Image": ""
    },
    {
        "Composer": "Friedrich von Flotow",
        "ID": "1fiVwfyL3nKnmVz7580kET",
        "Image": "https://i.scdn.co/image/403a83743e078f9b6d818a6beede62a82faebefc"
    },
    {
        "Composer": "Sigismond Thalberg",
        "ID": "0UpUHX0xRdD7TLty6bU40x",
        "Image": "https://i.scdn.co/image/73225509c8faaf87fc3908d8163a64311e69a781"
    },
    {
        "Composer": "Alexandre Dubuque",
        "ID": "1ZfI9gGhq3Dk0rXFwCgvPP",
        "Image": ""
    },
    {
        "Composer": "Stephen Heller",
        "ID": "1zgoSczPOOrcC8mkZoiivQ",
        "Image": "https://i.scdn.co/image/8bd98c72fa664da20ed407e71c060975c9a7c064"
    },
    {
        "Composer": "Johann Rufinatscha",
        "ID": "4yXTuoHql4EnhEja1zNqUL",
        "Image": ""
    },
    {
        "Composer": "Alexander Dargomyzhsky",
        "ID": "2e1NJfIScuztewWi4oOnlF",
        "Image": "https://i.scdn.co/image/32dd2a6912be6a30c1866f1faeb72c6c951f3269"
    },
    {
        "Composer": "Charles-Valentin Alkan",
        "ID": "07OhqeLloDO7wu0yCaVO2D",
        "Image": "https://i.scdn.co/image/f39fec391016b674a9577449c030143113e3f997"
    },
    {
        "Composer": "Ernst Haberbier",
        "ID": "7sDKWxhZuHEtK8WFaGkbq2",
        "Image": ""
    },
    {
        "Composer": "Richard Wagner",
        "ID": "1C1x4MVkql8AiABuTw6DgE",
        "Image": "https://i.scdn.co/image/c4631dcc5c63825db5840869f89cd629a4466c7b"
    },
    {
        "Composer": "Giuseppe Verdi",
        "ID": "1JOQXgYdQV2yfrhewqx96o",
        "Image": "https://i.scdn.co/image/b7f0ce2e219e322971a6ee16fc3f4e31a5a7b973"
    },
    {
        "Composer": "Adolf von Henselt",
        "ID": "1ixDxXnQmZDWEiYPYJxNot",
        "Image": ""
    },
    {
        "Composer": "Giuseppe Lillo",
        "ID": "15P3fnVfX9DC8l5j3l9Js5",
        "Image": ""
    },
    {
        "Composer": "Josephine Lang",
        "ID": "5njDMXjq3quQzRy46db3sA",
        "Image": ""
    },
    {
        "Composer": "Friedrich Robert Volkmann",
        "ID": "3BW8UxKsDs71Lcx8AncOAS",
        "Image": ""
    },
    {
        "Composer": "Charles Dancla",
        "ID": "72lPlsUJ8DSrHC2cB14Skl",
        "Image": ""
    },
    {
        "Composer": "William Sterndale Bennett",
        "ID": "7DieDOyD7i2Hb1vtrIr2Ya",
        "Image": "https://i.scdn.co/image/68bb41462bca455b605113064fb3164e0ccbaf22"
    },
    {
        "Composer": "Henry Litolff",
        "ID": "5vd0CttoNZCsm9ExI28gkB",
        "Image": ""
    },
    {
        "Composer": "Niels Gade",
        "ID": "2GZyZiXixfvpfYo5t1kUwx",
        "Image": "https://i.scdn.co/image/813cb40a5a760f20a6e545e3416d3524a1c2ec2f"
    },
    {
        "Composer": "Jacques Offenbach",
        "ID": "4OihBPCQzR4GfbzqOY69Xm",
        "Image": "https://i.scdn.co/image/ec2ad60345e5badbb0534d272b9990c6abec4504"
    },
    {
        "Composer": "Antonio Bazzini",
        "ID": "06GaeXANkmOHTl28xHSE0A",
        "Image": "https://i.scdn.co/image/3d3413fff357cad274e1ecaf8db716b9a66c3ba0"
    },
    {
        "Composer": "Charles Gounod",
        "ID": "42Vmza0WYHdhsgxFmf9Tui",
        "Image": "https://i.scdn.co/image/2463e7119936cf1d19e5c8eb7644fe3f0fa32237"
    },
    {
        "Composer": "Clara Schumann",
        "ID": "2yzaWNFV3cxmcRZtwtr5WC",
        "Image": "https://i.scdn.co/image/f4ad4e6d20fb22b94144452b9af6fccee7d4f11d"
    },
    {
        "Composer": "Henri Vieuxtemps",
        "ID": "4ceZFtLs8nvyVMyvcNlxJh",
        "Image": "https://i.scdn.co/image/241aa2507b14c80655e3ac515b1a4af5042c0688"
    },
    {
        "Composer": "Giovanni Bottesini",
        "ID": "1cRTNFbSHeoVdpbNRy6bSO",
        "Image": "https://i.scdn.co/image/38d217f9f741eccd91ba6d0b5c9971f330e4ded8"
    },
    {
        "Composer": "Theodor Kirchner",
        "ID": "7o9aEM0H56UlOw3RMuabsS",
        "Image": "https://i.scdn.co/image/6133ae31319341f6f2d815a4c729a4ac50fd2f3f"
    },
    {
        "Composer": "Luigi Arditi",
        "ID": "5jPslEqO0MoZWmXspsbQLO",
        "Image": ""
    },
    {
        "Composer": "Bed?ich Smetana",
        "ID": "5KwwOyUyo4Uhr4z7EY5Kge",
        "Image": ""
    },
    {
        "Composer": "Josip Runjanin",
        "ID": "4ozSq2iSO2THqGqpJGIjtY",
        "Image": ""
    },
    {
        "Composer": "Joachim Raff",
        "ID": "1LA9Zn3bgZCPA1VJVEvDa0",
        "Image": "https://i.scdn.co/image/082082c35b15f2a1c94896fefae329843ee351f0"
    },
    {
        "Composer": "Anton Bruckner",
        "ID": "2bM3j1JQWBkmzuoZKu4zj2",
        "Image": "https://i.scdn.co/image/da53679d30eac626b8a043490d942df91925f387"
    },
    {
        "Composer": "Carl Reinecke",
        "ID": "6qrUIvuYX2DLbDruM7rguh",
        "Image": "https://i.scdn.co/image/57475a5b5a10fe727a204b80d9c6166c37c79408"
    },
    {
        "Composer": "Jean-Baptiste Arban",
        "ID": "1ZkiicBUSBwH2rOywqQ4Od",
        "Image": "https://i.scdn.co/image/8db8d0ede82d9b25e99c909aec2108fbea04b019"
    },
    {
        "Composer": "Richard Hol",
        "ID": "5tUfeFUseofhyvH4muBK0x",
        "Image": ""
    },
    {
        "Composer": "Johann Strauss II",
        "ID": "5goS0v24Fc1ydjCKQRwtjM",
        "Image": "https://i.scdn.co/image/13df907452086739d886713fa2005c8ec03ee340"
    },
    {
        "Composer": "Stephen Foster",
        "ID": "0ZC98hE2PleBKS61my6gly",
        "Image": "https://i.scdn.co/image/0662edb1974b32fefef43516540e1c5186e77b29"
    },
    {
        "Composer": "Ludwig Minkus",
        "ID": "6c9HjJ2cYmFsUUkjkcL1iD",
        "Image": "https://i.scdn.co/image/e7fdb0254c63af5638310e2d503edc6db669f410"
    },
    {
        "Composer": "Josef Strauss",
        "ID": "0qU8UdzIf1I2ZxyI5OHdut",
        "Image": "https://i.scdn.co/image/f69447d9e0250c6c8a7988a47b3c586115e01e94"
    },
    {
        "Composer": "Adolphe Blanc",
        "ID": "79FCxej0JOZ9XfsD9ZMMPV",
        "Image": "https://i.scdn.co/image/06c04f988006434e63321033b9ddf428a208147e"
    },
    {
        "Composer": "Louis Moreau Gottschalk",
        "ID": "5Q6oes1V99h1T2ufiUNI2c",
        "Image": "https://i.scdn.co/image/7321a6acf07f2eee990f265d5c45c9d05a2505c3"
    },
    {
        "Composer": "Karl Goldmark",
        "ID": "0Pz79wagKnssEZImEgGGFv",
        "Image": "https://i.scdn.co/image/35bee354d08473c9314cac5e7001f695b91575c6"
    },
    {
        "Composer": "Anton Rubinstein",
        "ID": "01ngcjkCXOFGBB3UVG3saM",
        "Image": "https://i.scdn.co/image/a66833942802abfbf16f757da1a572e0da1dc7e4"
    },
    {
        "Composer": "Ivan Larionov",
        "ID": "1KUrfLSG0x7r3AwFcHScHY",
        "Image": ""
    },
    {
        "Composer": "Hiromori Hayashi",
        "ID": "2G6qzsGtIX2bhJp56e6OLD",
        "Image": ""
    },
    {
        "Composer": "Alexander Borodin",
        "ID": "34MYamymtmnsmpwbqydd7I",
        "Image": "https://i.scdn.co/image/07d554227436c670346bf3468ab73a80443b9418"
    },
    {
        "Composer": "Joseph Joachim",
        "ID": "6QuJ4aZSRMebqwDXiJ3SuA",
        "Image": "https://i.scdn.co/image/07e1f998139d2f1af9435450f1b91b00691ef89b"
    },
    {
        "Composer": "Johannes Brahms",
        "ID": "5wTAi7QkpP6kp8a54lmTOq",
        "Image": "https://i.scdn.co/image/83df2e7b402567fe5ef981b8161fe7153ed5d927"
    },
    {
        "Composer": "Amilcare Ponchielli",
        "ID": "088fpww3Ae4U9cMZv5O6m8",
        "Image": "https://i.scdn.co/image/1a04fb46a1a256e670889a62e19f5a6306e184e8"
    },
    {
        "Composer": "Julius Reubke",
        "ID": "3NejtlAJlaXXCAI4lGLhHq",
        "Image": ""
    },
    {
        "Composer": "Peter Benoit",
        "ID": "260usZKSgRGs6Ze4DWahMI",
        "Image": "https://i.scdn.co/image/c9ca6e51e472afbe9f92b106ce05ba24b7db4cf1"
    },
    {
        "Composer": "Eduard Strauss",
        "ID": "5FRqFzmeoc0L2u7wWEaagD",
        "Image": "https://i.scdn.co/image/b5525aa417ea474561e81586ab03ce2a7fe53ffa"
    },
    {
        "Composer": "Henryk Wieniawski",
        "ID": "7wEcQTGkugQxXzikls4izh",
        "Image": "https://i.scdn.co/image/b72fba8d714820e499460285b1eb2595dde74e30"
    },
    {
        "Composer": "Felix Draeseke",
        "ID": "5Vp6oO51Y4KbSK4D5GH9dW",
        "Image": ""
    },
    {
        "Composer": "Davorin Jenko",
        "ID": "24FjXwooYti4KUDDgpM4om",
        "Image": ""
    },
    {
        "Composer": "Mily Balakirev",
        "ID": "2V5Fnwup32wFPAtMi2vmXq",
        "Image": "https://i.scdn.co/image/eb64914f3df0c50519c839bd24868089d032e4ee"
    },
    {
        "Composer": "Georges Bizet",
        "ID": "2D7RkvtKKb6E5UmbjQM1Jd",
        "Image": "https://i.scdn.co/image/d06a1a1c32ac26e366ca903412b1458de9826485"
    },
    {
        "Composer": "John Knowles Paine",
        "ID": "0WpSFotLxPgdnZYI6YceDg",
        "Image": "https://i.scdn.co/image/6793f5fb098dd899c3922269c97a12fe78f9a902"
    },
    {
        "Composer": "Max Bruch",
        "ID": "0521x50ZcNqqT1fKMJg5c5",
        "Image": "https://i.scdn.co/image/93b4266efe12db296295cc5e0113b3c36619277d"
    },
    {
        "Composer": "Modest Mussorgsky",
        "ID": "284mnx33IWcymQEpMxyfHl",
        "Image": "https://i.scdn.co/image/2ac33c5b8dff7855937a1249680c4ec6a1f482d4"
    },
    {
        "Composer": "John Stainer",
        "ID": "1Hw5GKs0jCKsLfnl41m8Wl",
        "Image": "https://i.scdn.co/image/1794e8b557ac5f5456f5c771e7c5a1ed7df39b52"
    },
    {
        "Composer": "Johan Svendsen",
        "ID": "7D8evrjQtt7dee4wqK3pva",
        "Image": "https://i.scdn.co/image/609f27045cb34b62f7e911c85ceb00425360382e"
    },
    {
        "Composer": "Emmanuel Chabrier",
        "ID": "7y3p0lS9e0oGcJUOHlF1wk",
        "Image": "https://i.scdn.co/image/318a7dc2c424003694f87634bc4b6719c2b4891e"
    },
    {
        "Composer": "Arrigo Boito",
        "ID": "4QHgItlRsXcYDTm3eJoFDP",
        "Image": "https://i.scdn.co/image/6d442936760878907699deb9797dc33b3527be4d"
    },
    {
        "Composer": "Giovanni Sgambati",
        "ID": "3m1zAAlMbuq1ZAHFggftkC",
        "Image": "https://i.scdn.co/image/3d3a60174bd53e11665e451a8f63d51474c6b624"
    },
    {
        "Composer": "Jules Massenet",
        "ID": "1AoIc5YFH0aSFc4mKqBEeB",
        "Image": "https://i.scdn.co/image/611f7bd3dd01d6ba0c34ddd6024669682710f17f"
    },
    {
        "Composer": "Giuseppe Silvestri",
        "ID": "0OQOA5GYqZRHNRPfS3D1TM",
        "Image": ""
    },
    {
        "Composer": "Johann Nepomuk Fuchs",
        "ID": "1XE8kAS14OzHpExiYFRuAT",
        "Image": ""
    },
    {
        "Composer": "Arthur Sullivan",
        "ID": "1jK7F6jheJ08CowHGDW6IN",
        "Image": "https://i.scdn.co/image/d726537b8c2b3528b507103825b532ff26120845"
    },
    {
        "Composer": "Nikolai Rimsky-Korsakov",
        "ID": "2kXJ68O899XvWOBdpzlXgs",
        "Image": "https://i.scdn.co/image/ff2fc4924b1e35bc9d56d18b0e5744f5daac71ce"
    },
    {
        "Composer": "Felip Pedrell",
        "ID": "5dEHq8WUcaGGUgLEiPd7CE",
        "Image": ""
    },
    {
        "Composer": "Edvard Grieg",
        "ID": "5ihY290YPGc3aY2xTyx7Gy",
        "Image": "https://i.scdn.co/image/5a434b6894d4e48995866aa31fa4f726e5773fa5"
    },
    {
        "Composer": "David Popper",
        "ID": "1Yfs1gSacKS9Bqph8IyxFX",
        "Image": "https://i.scdn.co/image/30a5572f5388b69fb98a95a1fe35590fb54e4fb6"
    },
    {
        "Composer": "Charles-Marie Widor",
        "ID": "6wgviqppMkEUf4p2WJ2uVa",
        "Image": "https://i.scdn.co/image/a1b52cf6f85fdc3ef4f61433f69c8cf729605394"
    },
    {
        "Composer": "Friedrich Nietzsche",
        "ID": "3kb5fJZ2Hktci2A1wHXnHP",
        "Image": "https://i.scdn.co/image/de3cc9d3760a3c41a06e38d7b7dcd42d3f8dfa2d"
    },
    {
        "Composer": "Ion Ivanovici",
        "ID": "52uLJEt26A79boYDbuM6JI",
        "Image": ""
    },
    {
        "Composer": "Luigi Denza",
        "ID": "604SIyQJ7kt1BUikmaNQAN",
        "Image": ""
    },
    {
        "Composer": "Pyotr Ilyich Tchaikovsky",
        "ID": "3MKCzCnpzw3TjUYs2v7vDA",
        "Image": "https://i.scdn.co/image/0d779eb9b65a5f1351d6ecbd6a222dba7a74fbb6"
    },
    {
        "Composer": "Zygmunt Noskowski",
        "ID": "56MXtax4swwHZmE11DsKjV",
        "Image": "https://i.scdn.co/image/394dcf1c7eb859b0f86b694206d2fc5b609ebca0"
    },
    {
        "Composer": "Robert Fuchs",
        "ID": "4cFqOPihbrbcaQeuK6ttpp",
        "Image": "https://i.scdn.co/image/3c50cef8ab589af210bd85ba5433ec9fa5919999"
    },
    {
        "Composer": "Philipp Scharwenka",
        "ID": "1xldmEWcUklELLd6NvMAkm",
        "Image": ""
    },
    {
        "Composer": "Hubert Parry",
        "ID": "4DAmH51BfQpej5UEP0dZ3u",
        "Image": "https://i.scdn.co/image/98e91acaaf99983ed5c11c9052d09812870c291d"
    },
    {
        "Composer": "Henri Duparc",
        "ID": "3ceP0vCQkBmSKTvF6CsuOw",
        "Image": "https://i.scdn.co/image/d4507538a71935bf4c0b2d316dc3b781c021156e"
    },
    {
        "Composer": "Benjamin Godard",
        "ID": "2OvKjmIo99mLNKbMIdCQOV",
        "Image": "https://i.scdn.co/image/cb523db166baee7253fc15f8dbf9217b762b6fce"
    },
    {
        "Composer": "C. A. Bracco",
        "ID": "2bkkbzDZkP5cRYarms9Aaa",
        "Image": ""
    },
    {
        "Composer": "Xaver Scharwenka",
        "ID": "48Ihwc9nWMzCYG7OQLa60M",
        "Image": ""
    },
    {
        "Composer": "Alexandre Luigini",
        "ID": "78en3eAZ4eLV5uocBDDjNc",
        "Image": ""
    },
    {
        "Composer": "Vincent d'Indy",
        "ID": "74t2IgTigmFhqMn5gs5XPt",
        "Image": "https://i.scdn.co/image/6155f97abc10b239c99b074fe21f6926e5b41d2e"
    },
    {
        "Composer": "Ciprian Porumbescu",
        "ID": "40eaxFtDhlj7BzFGpoBG7s",
        "Image": ""
    },
    {
        "Composer": "Charles Villiers Stanford",
        "ID": "1g5nZfwrmjGs2wLKi3XHk2",
        "Image": "https://i.scdn.co/image/82136b5ba43a10a0ce5af173e8f6c853221e50af"
    },
    {
        "Composer": "Alfredo Catalani",
        "ID": "2pJPaYySRIl7SVCgkT2weI",
        "Image": "https://i.scdn.co/image/4d79b0c35c70daeb0a05ae1c14a29da01fe311cb"
    },
    {
        "Composer": "Hans Huber",
        "ID": "4aA1PTOcMbSDK1uoUPMVlb",
        "Image": "https://i.scdn.co/image/a2d313fefddabaae35e7a21fa7e049194186dc03"
    },
    {
        "Composer": "Engelbert Humperdinck",
        "ID": "17XXKfRBMCWvLrqGoNkJXm",
        "Image": "https://i.scdn.co/image/48e3225d57e48568d1cbe2bd2a4e2fdee16ffe07"
    },
    {
        "Composer": "Bernard Zweers",
        "ID": "0lv6EgukCDPNOaGs2Qe9os",
        "Image": ""
    },
    {
        "Composer": "Moritz Moszkowski",
        "ID": "5x2Ufw4gSPVw4TNcGCpFT1",
        "Image": "https://i.scdn.co/image/f39674716823bfa48a69ec237c6da39707b714c5"
    },
    {
        "Composer": "George Whitefield Chadwick",
        "ID": "2IRHxBEVRIPVF9e8NHi3N9",
        "Image": "https://i.scdn.co/image/e9a0d4112f7a12865e737fbfc10247aa54ee9def"
    },
    {
        "Composer": "Ernest Chausson",
        "ID": "4dadMoMQOTGa96FlnhEzCi",
        "Image": "https://i.scdn.co/image/bfc90b75c65d8d4d2a81c583988fffa43d4fcd15"
    },
    {
        "Composer": "John Philip Sousa",
        "ID": "6jNyNAMv2gNLnfaP0bzo7y",
        "Image": "https://i.scdn.co/image/92d1ff4e6a0671d4d1b00a535bb742ffe2cb3fc8"
    },
    {
        "Composer": "Gustave Charpentier",
        "ID": "5OZAfzSUnJzQ5PrW4ZYCc8",
        "Image": "https://i.scdn.co/image/e28dd028b0d8f5a3c2ed89e93177c2eb9725f1fc"
    },
    {
        "Composer": "Sergei Lyapunov",
        "ID": "1Lb7Gn7nVNfxMBkKVmFZyI",
        "Image": "https://i.scdn.co/image/20543cd492824bcf221c4cd35f35a4a81d5bb84a"
    },
    {
        "Composer": "Arnold Mendelssohn",
        "ID": "18osfoG9A0DwxxjYz3KFSW",
        "Image": ""
    },
    {
        "Composer": "Paul Dukas",
        "ID": "3KpcdlqCaWWruPfmM2rWy1",
        "Image": "https://i.scdn.co/image/0bbf8f5ae3a7cb589d2a8531f7c09093c25ccee2"
    },
    {
        "Composer": "Giuseppe Martucci",
        "ID": "5ScBH9bGGSS0B1BtG5BMZD",
        "Image": "https://i.scdn.co/image/133bb5c2c6134b1f8a3f2ace8526a844a5c6b241"
    },
    {
        "Composer": "Alberto Williams",
        "ID": "11kKasV6eRUQnuIouit02q",
        "Image": "https://i.scdn.co/image/afa97f9685f3adb81f105556b13e5ae1e7ef62bb"
    },
    {
        "Composer": "Anatoly Lyadov",
        "ID": "7t5qhn89RAzTepqZBB4uob",
        "Image": "https://i.scdn.co/image/652dd3999f7f18ff1710c8bf72404fb76be02157"
    },
    {
        "Composer": "Stevan St. Mokranjac",
        "ID": "6bbFwVGb1FnkzXpaifykEm",
        "Image": ""
    },
    {
        "Composer": "Sergei Taneyev",
        "ID": "2xBVpJeox4UCMybat7LT8X",
        "Image": "https://i.scdn.co/image/6d8485155cd3f04d020b24ea8698c67f85e59827"
    },
    {
        "Composer": "Christian Sinding",
        "ID": "45Ju84OuCDMX3oH1iLKP63",
        "Image": "https://i.scdn.co/image/46042a4d4b915cbca094bcf8f646525a0cac5c8e"
    },
    {
        "Composer": "Ruggero Leoncavallo",
        "ID": "72auy9NefUbGecYVrTiPzq",
        "Image": "https://i.scdn.co/image/cc39aa4d6123bbd83e6850856c619379e7f0f28b"
    },
    {
        "Composer": "Edward Elgar",
        "ID": "430byzy0c5bPn5opiu0SRd",
        "Image": "https://i.scdn.co/image/a812a70dd3ada2cfd17fbb9723cc1604d42452e7"
    },
    {
        "Composer": "Giacomo Puccini",
        "ID": "0OzxPXyowUEQ532c9AmHUR",
        "Image": "https://i.scdn.co/image/6b124eb919776cb9d297ce799f63eee6fe0dd770"
    },
    {
        "Composer": "Victor Herbert",
        "ID": "4KKrqNQzDsogR5DCD9a9fv",
        "Image": "https://i.scdn.co/image/a47c23179caea77234eb0bd91ce4a0279206d45d"
    },
    {
        "Composer": "Mikhail Ippolitov-Ivanov",
        "ID": "0olnJhZ6Bou4zt2KkjdLkt",
        "Image": "https://i.scdn.co/image/66f4c571e10a1ddcc487f06b19e7cd021e542978"
    },
    {
        "Composer": "Valborg Aulin",
        "ID": "0dPXhX5Y4nNHF5XPUNXNd8",
        "Image": ""
    },
    {
        "Composer": "Alfredo d'Ambrosio",
        "ID": "7ltbXd27utG0AHGLLOCtxx",
        "Image": ""
    },
    {
        "Composer": "Gustav Mahler",
        "ID": "2ANtgfhQkKpsW6EYSDqldz",
        "Image": "https://i.scdn.co/image/aaef5347abd6fe7d1ca40524d96dd66d73b28841"
    },
    {
        "Composer": "Ignacy Jan Paderewski",
        "ID": "7Im00DCJCJrFrC1Ho6vjD6",
        "Image": "https://i.scdn.co/image/b6116a6778ce4730b1e9851c12aeb02444fafe15"
    },
    {
        "Composer": "Edward MacDowell",
        "ID": "3Pw22ANvFqf1RBh5VgHiJ2",
        "Image": "https://i.scdn.co/image/504becf14c762f9503a9a49a9d7729320c023cb0"
    },
    {
        "Composer": "Hugo Wolf",
        "ID": "3JvFTHGx6J55BUnjL8l04T",
        "Image": "https://i.scdn.co/image/ff95faf3b29e208913dbcd57241fb71a3c024b6b"
    },
    {
        "Composer": "Anton Arensky",
        "ID": "2DLKrW0pn180nOIjUWlTjm",
        "Image": "https://i.scdn.co/image/7c7a73baba9042734b413cee00d979b8660151d1"
    },
    {
        "Composer": "Georgy Catoire",
        "ID": "04Z3Uz420IFRwOCqvKZMQc",
        "Image": "https://i.scdn.co/image/8b28715dfff8208e1045be5ce39e197b2eaefb26"
    },
    {
        "Composer": "Frederick Delius",
        "ID": "65YhYi4Fz5Ibgq7ueev2Rm",
        "Image": "https://i.scdn.co/image/eea1031483306a304dd8a4b5b89243edca48b4c9"
    },
    {
        "Composer": "Claude Debussy",
        "ID": "1Uff91EOsvd99rtAupatMP",
        "Image": "https://i.scdn.co/image/6f4ec976be8f4f84539db4e1220f6e79438fed9c"
    },
    {
        "Composer": "Alberto Nepomuceno",
        "ID": "5BFlhpaPculZIatjhoistC",
        "Image": "https://i.scdn.co/image/494b589fccf1a49636390f9e4c4e59e3c43f55c0"
    },
    {
        "Composer": "Pietro Mascagni",
        "ID": "3Z5fRknMBBNfCw6pkgR9S8",
        "Image": "https://i.scdn.co/image/1d1949c205b169cbf4b0160a942cb31c3872b14c"
    },
    {
        "Composer": "Edward German",
        "ID": "1Xt44RqTpZ2uXrX6xo5ENc",
        "Image": "https://i.scdn.co/image/5ee5d215040b5e95b5677026de8bc97abe4831e2"
    },
    {
        "Composer": "Ricardo Castro",
        "ID": "2y1bWFBk6n6Jue3kIEpGLq",
        "Image": "https://i.scdn.co/image/ec4be11792d02051933ef108983024cac726948c"
    },
    {
        "Composer": "Guy Ropartz",
        "ID": "5dPR5LYM2CxXWlZGwntQ5C",
        "Image": "https://i.scdn.co/image/c73ff9933e8f736fd8946b81405645c2bbcd8fd0"
    },
    {
        "Composer": "Alexander Glazunov",
        "ID": "78t7WfwhjZLkDHN5QKwS5u",
        "Image": "https://i.scdn.co/image/81a8439b3f2c67ef439914d9089780255bd687f7"
    },
    {
        "Composer": "Richard Strauss",
        "ID": "6pAwHPeExeUbMd5w7Iny6D",
        "Image": "https://i.scdn.co/image/44f3fc5c0d099b98b1539ef942d51c3cf895e316"
    },
    {
        "Composer": "Paul Gilson",
        "ID": "3MhYSd4BC5GmfjFoHMgnPa",
        "Image": "https://i.scdn.co/image/79422122422b42b158abf4fb272bdd9a6a61697f"
    },
    {
        "Composer": "Eduardo di Capua",
        "ID": "2q0Rkp6Ud5XxPTCkCCdbYr",
        "Image": "https://i.scdn.co/image/fa122074ea2ead14d237cce1d96ca21cfc6677fa"
    },
    {
        "Composer": "Carl Nielsen",
        "ID": "73I7vbj7hzsw8rW4LUoxtz",
        "Image": "https://i.scdn.co/image/2b3efc843d473743aa7f122051d4fb06f08b58b1"
    },
    {
        "Composer": "Ferruccio Busoni",
        "ID": "7xH3VOMwOjnqGu7NERNUx1",
        "Image": "https://i.scdn.co/image/62be69834bef8dd235bd8657e11b1987b9abec4d"
    },
    {
        "Composer": "Jean Sibelius",
        "ID": "7jzR5qj8vFnSu5JHaXgFEr",
        "Image": "https://i.scdn.co/image/9c9995af2df51d848b632aaad081131298d1bd17"
    },
    {
        "Composer": "Erik Satie",
        "ID": "459INk8vcC0ebEef82WjIK",
        "Image": "https://i.scdn.co/image/8df0ab319da424e35faec8aefe42666ff71b960e"
    },
    {
        "Composer": "Francesco Cilea",
        "ID": "4UI5kd2hXbzrL9dH9zpK03",
        "Image": "https://i.scdn.co/image/fc25758d3f3ae4327ce0a82e7f87ae8166a338a8"
    },
    {
        "Composer": "Amy Beach",
        "ID": "1QeC5GwDENQv78O3PCLeZB",
        "Image": "https://i.scdn.co/image/db9e8bcf8706a6479934b23299c9a99cf8006c09"
    },
    {
        "Composer": "Samuel Maykapar",
        "ID": "5oAwr3CIgRd7qUpAFuw3cx",
        "Image": ""
    },
    {
        "Composer": "Vladimir Rebikov",
        "ID": "0egrebhFLsNr4p5IlkMDzk",
        "Image": ""
    },
    {
        "Composer": "Johann Strauss III",
        "ID": "5Mm1er8bhilA6r3JOcTeNU",
        "Image": ""
    },
    {
        "Composer": "Umberto Giordano",
        "ID": "2vedxcgUX1uom0dCE4xTTj",
        "Image": "https://i.scdn.co/image/94a1e46075e5e30e855a1bdfd6dfed6d81b2fdb4"
    },
    {
        "Composer": "Enrique Granados",
        "ID": "2xmzOWZeQCDksIQcLcnRrT",
        "Image": "https://i.scdn.co/image/887d350fc669103362203be722e979d8b68b9962"
    },
    {
        "Composer": "Wilhelm Peterson-Berger",
        "ID": "1pnzip6Xgb2Qs3xWHFx6Jt",
        "Image": "https://i.scdn.co/image/400c9c90179579ecf70e0ccf8aec8c224c2414b2"
    },
    {
        "Composer": "Charles Koechlin",
        "ID": "777ILKUd9KdXnQq0UX9G36",
        "Image": "https://i.scdn.co/image/2559ec5920313edeb8b133a398567fcefe3cb8a1"
    },
    {
        "Composer": "Scott Joplin",
        "ID": "5FgkTUuCNKDlilidPvZqOq",
        "Image": "https://i.scdn.co/image/b7999f204823c1916f0bda8f04b7e3b34707db83"
    },
    {
        "Composer": "Granville Bantock",
        "ID": "7LWakXb7xtbVwvHzeBotU1",
        "Image": "https://i.scdn.co/image/cc7bc8e161a33311f5466effa02dc28e83b96791"
    },
    {
        "Composer": "Hermann Bischoff",
        "ID": "3avQlyuZ0xuhq4QL1T6FO9",
        "Image": ""
    },
    {
        "Composer": "Vittorio Monti",
        "ID": "05ZN3Mgw6026ilsQzehDxC",
        "Image": "https://i.scdn.co/image/77e4466cfcf379d9dff390afa8b3c1f048023fcb"
    },
    {
        "Composer": "Juventino Rosas",
        "ID": "07KnR00fN51QEaiiSKPMWt",
        "Image": "https://i.scdn.co/image/260033f3c4a8cc5d0b93c0fa37f82aa90776c006"
    },
    {
        "Composer": "Hamish MacCunn",
        "ID": "4Gb3mNOBAtHAeJnZLwCxh9",
        "Image": ""
    },
    {
        "Composer": "Jan Brandts-Buys",
        "ID": "62XLoqaLiv9N5dmIUhCgJ7",
        "Image": ""
    },
    {
        "Composer": "Florent Schmitt",
        "ID": "46ogc4ghPoxhfxvj3ahDNL",
        "Image": "https://i.scdn.co/image/74f989da113ceada5a3ac32c0f628fd3705ecb82"
    },
    {
        "Composer": "Zygmunt Stojowski",
        "ID": "2inQTxsmnnRIzgR7UMuc1r",
        "Image": ""
    },
    {
        "Composer": "Giacomo Balla",
        "ID": "7C0tJ22qVgLsRI4ylbWcbV",
        "Image": ""
    },
    {
        "Composer": "Guillaume Lekeu",
        "ID": "0RXh5D9kovOKCElugtIMeW",
        "Image": "https://i.scdn.co/image/6a227139ea1a0f03dd09bf5d6639395311386809"
    },
    {
        "Composer": "Albert Roussel",
        "ID": "0GJc9hwpZqTk1JEba6EUPA",
        "Image": "https://i.scdn.co/image/465e7ea0f1217bd91546b794a60152e1314e517f"
    },
    {
        "Composer": "Oreste Ravanello",
        "ID": "5ZXNOXOsjRXN4VmGjjscXq",
        "Image": ""
    },
    {
        "Composer": "Charles Ives",
        "ID": "73s17iW5LTtXRMVoofi9sU",
        "Image": "https://i.scdn.co/image/987ae8616b1aa177570fd8d4ca5ad236e0eb7dfb"
    },
    {
        "Composer": "Wilhelm Stenhammar",
        "ID": "6gfRaesyLupPd0gDQaLwJV",
        "Image": "https://i.scdn.co/image/5e2a90fd68db6e4116db64829b4cbf4323b603fa"
    },
    {
        "Composer": "Alexander von Zemlinsky",
        "ID": "5z1DT2Qv5crikZIIJt5uO9",
        "Image": "https://i.scdn.co/image/88bf604f073237d5f68d92a96ec5ea30ebafa649"
    },
    {
        "Composer": "Ralph Vaughan Williams",
        "ID": "7wNkISK49lKeXuRaZcQVFe",
        "Image": "https://i.scdn.co/image/b404bdfc79579edba35faa44e5cb4353e7cf9b93"
    },
    {
        "Composer": "Alexander Scriabin",
        "ID": "6nZiWg5ZB511S24WmB7TCV",
        "Image": "https://i.scdn.co/image/b73c364d3d42b160833cf37861808d8324ac1437"
    },
    {
        "Composer": "Rubin Goldmark",
        "ID": "7wSGWtQtQsJPSzHKrMIak6",
        "Image": ""
    },
    {
        "Composer": "Sergei Rachmaninoff",
        "ID": "0Kekt6CKSo0m5mivKcoH51",
        "Image": "https://i.scdn.co/image/ec3bd7e3cb2154ea5575fa09adccce926186b33d"
    },
    {
        "Composer": "Reynaldo Hahn",
        "ID": "6Eu8djOGFxGaykaqJlbzEf",
        "Image": "https://i.scdn.co/image/9c2da578a4f020d83c0718c945a9f4ecd48e756e"
    },
    {
        "Composer": "Pascual Marquina Narro",
        "ID": "4lV1eSZ2q7UP1Yskke7Ifh",
        "Image": ""
    },
    {
        "Composer": "Max Reger",
        "ID": "2qpchAUtJNY45rG7auwQgz",
        "Image": "https://i.scdn.co/image/01990e8797e952b3bd482c17502995ccc8f7a91b"
    },
    {
        "Composer": "Leo Fall",
        "ID": "6ZZoPRHqoGpPTYFakdVWvu",
        "Image": "https://i.scdn.co/image/62092e16db07e9fe5daea9d949d879d9becd7254"
    },
    {
        "Composer": "Josef Suk",
        "ID": "6xV7WL4etX4sILBdTz6fYN",
        "Image": "https://i.scdn.co/image/3213d17bdaa618cd5e91e201969c2a08ed592898"
    },
    {
        "Composer": "Richard Wetz",
        "ID": "4fzpNEnmEqmAysw8T2VCnd",
        "Image": ""
    },
    {
        "Composer": "Arnold Schoenberg",
        "ID": "5U827e4jbYz6EjtN0fIDt9",
        "Image": "https://i.scdn.co/image/2fc56096767a81319e2738ea9b53f24a95935c14"
    },
    {
        "Composer": "Gustav Holst",
        "ID": "5B7uXBeLc2TkR5Jk23qKIZ",
        "Image": "https://i.scdn.co/image/9468e0e9731772a6736a015d6a492c8a1cadc9b3"
    },
    {
        "Composer": "Franco Alfano",
        "ID": "5dqt3SC39E4KU9EZSdPDrP",
        "Image": "https://i.scdn.co/image/10b0c5c0f0dbbb38f417f91c2e35f4e9823872a1"
    },
    {
        "Composer": "Franz Schmidt",
        "ID": "0Fx0FF13vvAQ3gmBE5LmhH",
        "Image": "https://i.scdn.co/image/e4fb1dfa797be9fb1c947b432f090499635c7735"
    },
    {
        "Composer": "Albert Ketèlbey",
        "ID": "5867Gd29EVb1Rt1sYiuYEj",
        "Image": "https://i.scdn.co/image/9919b70f3c59f0b8381d4b7cd8a5f169713f5aa9"
    },
    {
        "Composer": "Samuel Coleridge-Taylor",
        "ID": "0fhN6BHa9pN66ZnsrI5NUR",
        "Image": "https://i.scdn.co/image/288dc5bf164c09e78a63cb1b5228a07c9f5c56fc"
    },
    {
        "Composer": "Fritz Kreisler",
        "ID": "0HdNDZaNm7xLt18v9aWDfe",
        "Image": "https://i.scdn.co/image/41d75e86b9a90d97a63ce094bd7cb83b442c365a"
    },
    {
        "Composer": "Maurice Ravel",
        "ID": "17hR0sYHpx7VYTMRfFUOmY",
        "Image": "https://i.scdn.co/image/f5ba61b0b55b905bec4d6e1c14dafd5ed633ab28"
    },
    {
        "Composer": "Filippo Tommaso Marinetti",
        "ID": "3S3aaQ0jN4dEnrmXHTDgU4",
        "Image": "https://i.scdn.co/image/0d358e79f586623bd2f8fca79ba8150187bedb85"
    },
    {
        "Composer": "John Alden Carpenter",
        "ID": "6N2kuYAC5j9DaW8rtfPqCS",
        "Image": "https://i.scdn.co/image/7cd2ddde14f93a4484d4f248dab35bf9271f4352"
    },
    {
        "Composer": "Manuel de Falla",
        "ID": "5BcbyYRgvvhfVGmCJSjHlT",
        "Image": "https://i.scdn.co/image/7d0edfb608a1ddf98afbb3565d12c3ae43d670e9"
    },
    {
        "Composer": "Ludolf Nielsen",
        "ID": "7yRgkbUn4AL8XL3pCmAnh0",
        "Image": "https://i.scdn.co/image/a4c8746d5882838093bba3d15e1685e7b3cdce86"
    },
    {
        "Composer": "Carl Ruggles",
        "ID": "6IXC5tnl1tMnV3noIdHlfM",
        "Image": ""
    },
    {
        "Composer": "Fermo Dante Marchetti",
        "ID": "7xD3LmlGjxENuiPvErrDrb",
        "Image": ""
    },
    {
        "Composer": "Ermanno Wolf-Ferrari",
        "ID": "4ggOcxqsc7UOQdHzDxYexp",
        "Image": "https://i.scdn.co/image/4dc33fcbb76b4634b578da72e89eb04942a5c442"
    },
    {
        "Composer": "Antonio Russolo",
        "ID": "5t2sFKaprL2CwobmRlolTv",
        "Image": ""
    },
    {
        "Composer": "Joseph Holbrooke",
        "ID": "0rdVoRllKaWDVQX83tdGEP",
        "Image": "https://i.scdn.co/image/f0ef4266749cf4b6058932de704512744a763668"
    },
    {
        "Composer": "Gabriel Dupont",
        "ID": "1ioNBPhjY2VcZviexx8oyV",
        "Image": ""
    },
    {
        "Composer": "Frank Bridge",
        "ID": "7rj5B6cNPEJhWLnZAPSw9c",
        "Image": "https://i.scdn.co/image/41ed2b2d8caafe59b4e030ac0c943af359192b28"
    },
    {
        "Composer": "Franz Schreker",
        "ID": "7ehgiWrLMRMQkrr5tQQB2P",
        "Image": "https://i.scdn.co/image/c08acda87378b9b448d466ed00190623842bd457"
    },
    {
        "Composer": "Joseph Canteloube",
        "ID": "2Qxqr7UC93OtiiCiyFZsmw",
        "Image": "https://i.scdn.co/image/e61d115342b1ab2cdce907139bf6c0543e21e708"
    },
    {
        "Composer": "John Ireland",
        "ID": "0QzZLY6jZif9KbXnxaLIUV",
        "Image": "https://i.scdn.co/image/24257ff66c50aff5d4ed6ecd12b64df4cc3b3b1c"
    },
    {
        "Composer": "Hamilton Harty",
        "ID": "1BJZ8jnHa9XekLAj9cIm5C",
        "Image": "https://i.scdn.co/image/dae51325060268f5d259cd17f7e800445284c273"
    },
    {
        "Composer": "Otto Olsson",
        "ID": "02St7ubfTZFT4KGC9FJeHi",
        "Image": "https://i.scdn.co/image/f15fd8cb8bfbeadf1dabb6d20f604643986cd50f"
    },
    {
        "Composer": "Cyril Scott",
        "ID": "23r4muZmoiPOorfIXtW4MG",
        "Image": "https://i.scdn.co/image/62ab18d33a9a11524cca818829586c7c5272a2db"
    },
    {
        "Composer": "Alma Mahler",
        "ID": "3OU7d3J0bWYAALgPk2v4Gu",
        "Image": "https://i.scdn.co/image/2d4dd5a1b9ed3de0bd31375102d04b1ce2da173a"
    },
    {
        "Composer": "Francesco Balilla Pratella",
        "ID": "2hBGTVJ0bxUsKiV66MSfsw",
        "Image": ""
    },
    {
        "Composer": "Ottorino Respighi",
        "ID": "7KkUirCiJZhgRN3NbgG98L",
        "Image": "https://i.scdn.co/image/d7834df2ebc41fb41c7b377b50ee42230eba9ce2"
    },
    {
        "Composer": "Ernest Bloch",
        "ID": "4s7qI7HT1XDzotj6IYNEuJ",
        "Image": "https://i.scdn.co/image/51c7ce5730b1bb3596065f467ea049cab708ac92"
    },
    {
        "Composer": "John Foulds",
        "ID": "3gh8kWJETIg17FGev1fFkZ",
        "Image": "https://i.scdn.co/image/dc82d4ef6a0371b258f23f23850784264b2ecd1a"
    }
]
    return composers;
    }

