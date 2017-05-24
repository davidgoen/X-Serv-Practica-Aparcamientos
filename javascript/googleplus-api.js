//esta es mi key personal
var apiKey = ' AIzaSyCZ7TPSzOcP01awp2QOfKarAEBePZ3WkUI ';

//Esto se cargara directamente y se usará mi key para autenticarme
function handleClientLoad() {
  gapi.client.setApiKey(apiKey);
  //makeApiCall();
}

// Load the API and make an API call.  Display the results on the screen.
//mode: Si es nuevo se añade al array si no no se añade
function makeApiCall(id,parking,mode) {
  gapi.client.load('plus', 'v1', function() {
    var request = gapi.client.plus.people.get({
      'userId': id
      // For instance:
      // 'userId': '+GregorioRobles'
    });
    request.execute(function(resp) {
      var heading = document.createElement('h4');
      var image = document.createElement('img');
      if (resp.image == undefined){
        alert('el id "' + id + '" no existe')
        return;
      }
      if (mode == "new"){
        usuariosParking[parking].push(id);
      }
      image.src = resp.image.url;
      heading.appendChild(image);
      heading.appendChild(document.createTextNode(resp.displayName));

      document.getElementById('content').appendChild(heading);
    });
  });
}
