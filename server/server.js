// GLOBAL VARS
var HttpPort = 8005;
var V4PortReceive = 5000;
var V4PortSend = 5001;
var V4Ip = process.argv[2];
var ServerFolder = './webapp';
var static = require('node-static');
var dgram = require('dgram');
var http = require('http');


var https = require('https');
var fs = require('fs');

var options = {
  key: fs.readFileSync('./ssl/server.key'),
  cert: fs.readFileSync('./ssl/server.crt'),
  ca: fs.readFileSync('./ssl/ca.crt'),
  requestCert: true,
  rejectUnauthorized: false
};


var clients = {};
var clientFiles = new static.Server(ServerFolder);
var httpServer = https.createServer(options, function(request, response) {
	clientFiles.serve(request, response);
});


// LOG INIT MESSAGES
process.argv.forEach(function (val, index, array) {
	console.log(index + ': ' + val);
});

// INIT SERVER & SOCKET
io = require('socket.io').listen(httpServer);
io.set('log level', 1);
httpServer.listen(HttpPort);
serverUdp = dgram.createSocket("udp4");
serverUdp.bind(V4PortSend);




////////////////////////////////////////////////////////////////////////////////////

// ALCHEMY API
var AlchemyAPI = require('./webapp/js/alchemyapi');
var alchemyapi = new AlchemyAPI();


function analyze(myText){

	//myText = "Russland ist ein schönes Land!"

	//alchemyapi.sentiment("text", myText, {}, function(response) {
 	//	console.log("Sentiment: " + response["docSentiment"]["type"]);

	//});

	console.log(myText);

	alchemyapi.entities('text', myText,{ 'sentiment':0 }, function(response) {
		//console.log(JSON.stringify(response));
		UdpSend("NLP" + JSON.stringify(response)  + "NLP",V4Ip,V4PortReceive)

			alchemyapi.keywords('text', myText,{ 'sentiment':0 }, function(response) {
				//console.log(JSON.stringify(response));
				UdpSend("NLP" + JSON.stringify(response)  + "NLP",V4Ip,V4PortReceive)
			});
	});



}

////////////////////////////////////////////////////////////////////////////////////




// INIT SOCKET LISTENER
io.sockets.on('connection', function (socket) {

	

	// store new client ids
    if(!clients[socket.id])
	{
		clients[socket.id] = socket; 		
		var jsonObject = 	{ 	MessageData :	{
												MessageType : { Type : "string", Spread : ["Connect"]},
												SocketId : { Type : "string", Spread : [socket.id]}
												},
								Address : "SocketData"
							};

		var jsonString = JSON.stringify(jsonObject);
		UdpSend(jsonString,V4Ip,V4PortReceive)
	}	
	

	// handle client messages
	socket.on('message', function (msg) 
	{ 	

		

		// this is the json object we will send to vvvv
		var jsonObject = 	{ 	MessageData :	{
												MessageType : {Type : "string", Spread : ["Update"]},
												SocketId : { Type : "string", Spread : [socket.id]}
												},
								Address : "SocketData"
							};
		
		// add all key - value pairs the client sent
		var receivedJsonObject = JSON.parse(msg);


		


		for(var key in receivedJsonObject) {
	      	jsonObject.MessageData[key] = receivedJsonObject[key];
	      
	    }

	    /////////////////////////////////////////////////////////////////////
	    // Alchemy

	 	//analyze(receivedJsonObject["Value"]["Spread"][0]);

	 	/////////////////////////////////////////////////////////////////////



	    // stringify and send
		var jsonString = JSON.stringify(jsonObject);


		UdpSend(jsonString,V4Ip,V4PortReceive)
	});
 
	// handle server messages
	var callback = function (msg, rinfo) 
	{
		var jsonObject = JSON.parse(msg.toString('ascii', 0, rinfo.size));
		var socketId = jsonObject.MessageData.SocketId.Spread[0];
		// broadcast message
		if (socketId =="broadcast")
		{
			socket.emit("vvvv",jsonObject);
		} 
		// message for a specified client
		else if(clients[socketId])
		{
			clients[socketId].emit("vvvv",jsonObject);
		}
	};

	serverUdp.on("message", callback);
    
	// remove client id and event listener on disconnect
	socket.on('disconnect', function ()
	{ 
		var jsonObject = 	{ MessageData :	{
												MessageType : { Type : "string", Spread : ["Disconnect"]},
												SocketId : { Type : "string", Spread : [socket.id]}
											},
							Address : "SocketData"											
							};
		var jsonString = JSON.stringify(jsonObject);
		UdpSend(jsonString,V4Ip,V4PortReceive) 
		
		delete clients[socket.id];
		serverUdp.removeListener("message", callback);
    });
	
});

// SEND MESSAGE FROM CLIENT TO SERVER
function UdpSend(message,Host,port){
	console.log("sending");
	var client = dgram.createSocket("udp4");
	var buff = new Buffer(message);
	client.send(buff, 0, buff.length, port, Host, function(err, bytes) {
		client.close();
	});
}
