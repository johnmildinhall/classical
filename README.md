#Classical Music Ponce

CMP is an experimental project that allows users to search for Classical Music using the Spotify API. 

In order to retrieve purely classical music, the app searches for a whitelist of composers derived from the Baroque, Classical and Modern Classical composers on Wikipedia.

This is achieved using two methods. The first is to check for search terms that are simply composers' names. Their most popular pieces are returned using the Spotify artist endpoint. The second is to run a standard spotify search, and filter on the results using the whitelist. 

##Demo

A demo can be found here (no dynos, so takes a while to spin up):

http://classical-music-ponce.herokuapp.com/

Try "Beethoven" or "Bassoon" as example search terms.

##To run Classical Music Ponce

Clone repo, node app.js to get running.