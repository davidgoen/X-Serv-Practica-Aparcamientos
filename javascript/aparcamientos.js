var arrapopUp = [];
var collection = {};
var usuariosParking = {};
var select = "";
var parkingguardo;

function mostrar_info(no){
    var parking = parkings[no];
    var lat = parking.location.latitude;
    var lon = parking.location.longitude;
    var name = parking.title;
    select = name;
    var cat = parking.organization["organization-desc"];
    var addr= parking.address.locality;
    var CP = parking.address["postal-code"];
    var streetaddr = parking.address["street-address"];      
    var direc = 'Direccion: '+streetaddr+', '+CP+', '+addr;

    $("#carousel-indicators").html("");
    $("#carousel-imgs").html("");
    var first = ["class='active'"," active"];
    $.ajax({
        dataType: 'jsonp',
        url : 'https://commons.wikimedia.org/w/api.php?format=json&action=query&generator=geosearch&ggsprimary=all&ggsnamespace=6&ggsradius=500&ggscoord='+lat+'|'+lon+'&ggslimit=10&prop=imageinfo&iilimit=1&iiprop=url&iiurlwidth=700&iiurlheight=500',
        success : function(json) {
        var i =0;
        jQuery.each(json.query.pages, function(i, val) {
            $("#carousel-imgs").append("<div class='item" + first[1] + "' align='center' >" +
                "<img src='" + val.imageinfo["0"].thumburl + "' alt='" + i + "'>" +
                "</div>");
            first = ["",""];
            i=i+1;
        }); 
        }     
    })
    $("#carousel").show();
    $('#info').html('<h2>' + name +'</h2>'+ '<p>'+direc+'</p><p><h5>' + cat +'</h5></p>');
    $(".col_title2").html(name);
    $("#desc2").html($('#info').html());
    parkingguardo=name;
    //Pinta a los usuarios de Google+
    $("#content").html("");
    var id;
    usuariosParking[name].forEach(function(id){
        makeApiCall(id,name,"none");
    });
    if(usuariosParking[name].length==0){
    	 $("#list_col_5 li").remove();
    }
}

function eliminarmarcador(lat,lon){
    for (var i = 0; i < arrapopUp.length; i++) {
        if (arrapopUp[i]._latlng.lat==lat && arrapopUp[i]._latlng.lng==lon){
            map.removeLayer(arrapopUp[i]);
            arrapopUp.splice(i, 1);
            break;
        }
    };
}

function mostrar_park(){
    var no = $(this).attr('no');
    var parking = parkings[no];
    var lat = parking.location.latitude;
    var lon = parking.location.longitude;
    var url = parking.relation;
    var name = parking.title;
    var existemarcador = false;
    var marcador = L.marker([lat, lon]);

    for (var i = 0; i < arrapopUp.length; i++) {
        if (arrapopUp[i]._latlng.lat==lat && arrapopUp[i]._latlng.lng==lon){
            existemarcador = true;
            marcador = arrapopUp[i];
            break;
        }
    }

    if (!existemarcador){
        arrapopUp.push(marcador);
        marcador.addTo(map)
            .bindPopup('<a no="'+ no +'" href="' + url + '">' + name + '</a><br/>' + "<a href='#desc'>+ info</a><button id='delete' onclick='eliminarmarcador("+lat+","+lon+")'></button>")
    }
    marcador.openPopup();
    map.setView([lat, lon], 15);
};


function mensaje(err,tipo){
    var msg = ""
    if(!err){
        if(tipo==1){
            msg = "El json se ha creado y enviado con exito.";
        }else{
            msg = "El json se ha cargado con exito.";
        }
        
    }else{
        msg = "Error " + err.error;
    }
    $("#msg").html(msg);
}


function save_load(mode){
    $( "#fguardar_cargar" ).submit(function(event){
    	//Recuperamos la pagina
        event.preventDefault();
        var github;
        var repo;
        var token = $("#token")[0].value;
        github = new Github({
            token: token,
            auth: "oauth"
        });
        var nombreUsuario = "davidgoen";
        var nombreRepos = $("#nombreR")[0].value;
        repo = github.getRepo(nombreUsuario, nombreRepos);
        var nombreFichero = $("#nombreF")[0].value;
        if (mode == "guardar"){
            var dict_global = {collection: collection, usuariosParking: usuariosParking};
            var contenidoFichero = JSON.stringify(dict_global);
            var mensajeCommit = "Guardado json";
            repo.write('master', nombreFichero, contenidoFichero, mensajeCommit,function(err) {
                $("#fguardar_cargar").hide();
                mensaje(err,1);
            });
        } else if (mode == "cargar"){
            repo.read('master', nombreFichero , function(err, data) {
                $("#fguardar_cargar").hide();
                var msg = ""
                if(!err){
                    var json = JSON.parse(data);
                    collection = json.collection;
                    usuariosParking = json.usuariosParking;
                    $("#list_col_2 ul").html("");
                    Object.keys(collection).forEach(function(i){   
                        $("#list_col_2 ul").append("<li>" + i + "</li>");
                    });
                    $("#list_col_2 li").click(function(event){
                        var coll = event.target.textContent;
                        mostrar_parkings(coll);
                    });
                }
                mensaje(err,0)
            });
        }
    });
}

function obtener_parkings(){
$.getJSON("json/aparcamientos.json", function(data) {
        parkings = data.graph;
        $('#get').html('<p>Aparcamientos encontrados: ' + parkings.length + '</p>');
        var list = '<ul>'
        for (var i = 0; i < parkings.length; i++) {
            list = list + '<li  class="ui-widget-content" no=' + i + '>' + parkings[i].title + '</li>';
            //Array vacio para usuarios de Google+
            var users_plus = [];
            usuariosParking[parkings[i].title] =  users_plus;
        }
        list = list + '</ul>';
        $('.list').html(list);
        $("#list_col_1 li" ).draggable({revert:true,appendTo:"body",helper:"clone"});
        $('#list_home li').click(mostrar_park);
    });
};

function mostrar_parkings(coll){
    $(".col_title").html(coll);
    $(".h_coll ul").html("");
    var parking;
    collection[coll].forEach(function(n){
        parking = n.title;
        $(".h_coll ul").append("<li>" + parking + "</li>")
    });
};

$(document).ready(function() {
	    // Abre la pagina de guardar cargar github
    $( "#guardar, #cargar" ).click(function( event ) {
        event.preventDefault();
        var id_press = event.currentTarget.id;
        var title = ""
        if (id_press == "guardar"){

            title = "GUARDAR contenido en github."

        }else if (id_press == "cargar"){

            title = "CARGAR contenido desde el github"
        }
        //Reinicia
        $("#fguardar_cargar").show();
        $("#msg").html("");
        $( "#dialog" ).dialog( "option" ,"title",title);
        save_load(id_press);
        $( "#dialog" ).data("link", this).dialog( "open" );  
    });

    $('#tabs').tab();
    map = L.map('map').setView([40.4175, -3.708], 11);
    L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    $("#get").click(obtener_parkings);
    map.on('popupopen', function() {
        //Posicion del popup
        mostrar_info($(this._popup._content).attr('no'));
    });

    $("#list_col_3").droppable({
        drop: function( event, ui ) {
            var key = $(".col_title")[0].textContent;
            if (key == "") return;
			var no = ui.draggable.attr("no");
            var parking = parkings[no].title;
            collection[key].push(parkings[no]);
            $(".h_coll ul").append("<li>" + parking + "</li>");
        }
    });

    $("#list_col_5").droppable({
        drop: function( event, ui ) {
        	$("#list_col_5").append('<li><span><img src='+ui.draggable.attr("path")+'>'+ui.draggable.text()+'</span></li>');
        	usuariosParking[parkingguardo].push(ui.draggable.attr("no"));
        }
    });

    $( "#form" ).submit(function(event) {
        event.preventDefault();
        var new_col = $("#col_name")[0].value;
        $("#col_name")[0].value = "";
        if (new_col == "") return;
        $("#list_col_2 ul").append("<li>" + new_col + "</li>");
        var parking_col = []
        collection[new_col] = parking_col;
        $("#list_col_2 li").click(function(event){
            var coll = event.target.textContent;
            mostrar_parkings(coll);
        });
    });


    $( "#form_plus" ).submit(function(event) {
        event.preventDefault(); //con esto no se recarga la pagina       
		try {

		var host = "ws://127.0.0.1:80";
		console.log("Host:", host);
		var s = new WebSocket(host);
		
		s.onopen = function (e) {
			console.log("Socket opened.");
		};
		
		s.onclose = function (e) {
			console.log("Socket closed.");
		};
		
		s.onmessage = function (e) {

			if (select == ""){
            alert("Debes tener un alojamiento selecionado para asignarle un nuevo id de usuario google+")
            return; // si no esta selecionado se acaba
        	}
        	makeApiCall(e.data,select,"new");
		};
		
		s.onerror = function (e) {
			console.log("Socket error:", e);
		};
		
	} catch (ex) {
		console.log("Socket exception:", ex);
}
    });

  

    $( "#dialog" ).dialog({
        autoOpen: false,
        width: 330,
        modal: true,
        overlay: {
            opacity: 0.5,
            background: "black"
        }
    });
});
