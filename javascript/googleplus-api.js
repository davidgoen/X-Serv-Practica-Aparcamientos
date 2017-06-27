//esta es mi key personal
var apiKey = ' AIzaSyCZ7TPSzOcP01awp2QOfKarAEBePZ3WkUI ';

//Esto se cargara directamente y se usará mi key para autenticarme
function handleClientLoad() {
  gapi.client.setApiKey(apiKey);
  //makeApiCall();
}

// Load the API and make an API call.  Display the results on the screen.
//mode: Si es nuevo se añade al array si no no se añade
//function makeApiCall(id,parking,mode) {
function makeApiCall(id,parking,mode) {
    gapi.client.load('plus', 'v1', function() {
    var request = gapi.client.plus.people.get({
      'userId': id
    });
    request.execute(function(resp) {
      var image = document.createElement('img');
      if (resp.image == undefined){
        alert('el id "' + id + '" no existe')
        return;
      }
        if(mode=="none"){
          $("#list_col_5").append('<li path=' +resp.image.url+' no=' + id + '><span><img src='+resp.image.url+'>'+resp.displayName+'</span></li>');
        }else{
          $("#list_col_4").append('<li path=' +resp.image.url+' no=' + id + '><span><img src='+resp.image.url+'>'+resp.displayName+'</span></li>');
          $("#list_col_4 li").draggable({revert:true,appendTo:"body",helper:"clone"});  
        }
    });
  });
}
