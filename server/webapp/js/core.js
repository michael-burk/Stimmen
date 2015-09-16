
/*
	BASIC INITIALIZATION
	===============================================================================================
*/
var socket;

$(document).ready(function() {
		socket = io.connect();
		initUserInterface();
		initServerMessageHandler();
});


/*
	INITIALIZATION OF THE USER INTERFACE
	===============================================================================================
	All different kinds of UI elements are initialized here. According to their type the values get
	extracted and the sendMessage function is called. At the moment you can use the following 
	UI types:
	.text 		= Inputs for text
	.button 	= Buttons
	.radio 		= Radiobuttons
	.color 		= Colorpickers
	.slider 	= Sliders
	.xyPad		= XY-pad that sends a 2d vector
*/

function initUserInterface(){
		
		// init sync state - this is used to prevent sending received data back to the server
		$(".synchronizable").each(function(index) {
			$(this).attr('data-state', '0');
		});
		
		// TEXT INPUT FIELDS
		$('input.text').keyup(function(){
			if(this.dataset.state==0){
				var valuearray = new Array();
				valuearray.push($('input.text').value);
				sendMessage(this.dataset.vname, valuearray);
			}
		});

		// BUTTONS
		$(".button").button().click(function(event, ui) {
			if(this.dataset.state==0){
				var valuearray = new Array();
				if ( this.dataset.value == "toggle"){
					var id = $(this).attr('id')
					var value = "toggleOff";
					if ($("label[for='"+id+"']").hasClass('ui-state-active')) value = "toggleOn";
					valuearray.push(value);
					sendMessage(this.dataset.vname, valuearray);	
				}
				else {
					valuearray.push(this.dataset.value);
					sendMessage(this.dataset.vname, valuearray);	
				}
				
			}
		});

		// RADIO BUTTONS / BUTTON SETS
		$( 'input.radio' ).click(function(event, ui) {
			if(this.dataset.state==0){
				var valuearray = new Array();
				valuearray.push(this.dataset.value);
				sendMessage(this.dataset.vname, valuearray);
			}
		});
		
		$(".buttonset").buttonset(); // inits buttonets
		
		// COLOR PICKERS ( http://labs.abeautifulsite.net/jquery-minicolors/ )
		$('input.color').each( function() {
			$(this).minicolors({
				control: $(this).attr('data-control') || 'hue',
				defaultValue: $(this).attr('data-defaultValue') || '',
				inline: $(this).attr('data-inline') === 'true',
				letterCase: $(this).attr('data-letterCase') || 'lowercase',
				opacity: $(this).attr('data-opacity'),
				position: $(this).attr('data-position') || 'bottom left',
				change: function(hex, opacity) {
					if(this.dataset.state==0){
						var hexColor;
						try {
							var valuearray = new Array();
							hexColor = hex ? hex : 'transparent';
							valuearray.push(hexColor);
							if( opacity ) valuearray.push(opacity);
							sendMessage(this.dataset.vname, valuearray);
						} catch(e) {}
					}					
				},
				theme: 'default'
			});
		});

		// SLIDERS
		$('div.slider').slider({
			orientation: "horizontal",
			min: 0,
			max: 100,
			slide: function(event, ui){
				if(this.dataset.state==0){
					var valuearray = new Array();
					valuearray.push(ui.value);
					sendMessage(this.dataset.vname, valuearray);
				}
			}
		});
		
		// XY PADS
		$(".xyPad").each(function(){
			var dragArea = $("<div class='dragArea'></div>");
			$(this).append(dragArea);
			dragArea.draggable({ containment: "parent",
				drag: function( event, ui ) {
					if($(this).parent().attr("data-state") == 0){
						var valuearray = new Array();
						var normalizedX = ui.position.left / ($(this).parent().width() - $(this).width());
						var normalizedY = ui.position.top / ( $(this).parent().height() - $(this).height());
						valuearray.push(normalizedX);
						valuearray.push(normalizedY);
						sendMessage($(this).parent().attr("data-vname"), valuearray);
					}
				}
			});
		});
}


/*
	HANDLING OF SERVER MESSAGES
	===============================================================================================
	Initializes the function that listens to socket messages. Every received message contains a
	variable name and its values. The according DOM-element is selected by the variable name and
	dependent on its UI type the values are assigned.
*/
  
function initServerMessageHandler(){

	var started = true;


	socket.on('vvvv', function (msg) {
		//console.log("yo");
		var vname = msg.MessageData.VariableName.Spread[0];
		var valuearray = msg.MessageData.Value.Spread;
		
		//console.log("hi");
		//console.log(msg.MessageData.VariableName.Spread[0]);
		//console.log(msg.MessageData.Value.Spread[0]);

		if(vname == "Record"){
			if(valuearray[0] == 1 && !started){
				//console.log(vname);
				//recognizer.start();
				//started = true;

			}
			if(valuearray[0] == 0 && started){
				
				//recognizer.stop();
				//started = false;

			}

		}

		if(vname == "Lang"){
			console.log("Lang");
		}

		if(vname == "recordable"){
			if(valuearray[0] == 1){

				recordable = true;
				$("#recordButton").css("background-color","Black");




					if(!active) recognizer.start();
					active = true;


					
					$("#recordButton").css("background-color","red");
			  		
			  		
			  		var valuearray = new Array();
					valuearray.push("start");
					sendMessage("record", valuearray);



					setTimeout(function(){ 

						if(active) recognizer.stop();
						active = false;
						recordable = false;

						$("#recordButton").css("background-color","LightGrey");

				  		var valuearray = new Array();
						valuearray.push("stop");
						sendMessage("record", valuearray);

					
						lateSendTimeout = setTimeout(sendMessageLate, 5000);

						console.log("end");

					}, 30000);
				

			}
		}

		// get element by variable name
		var uiElement = $('[data-vname*=' + vname +']');

		// TEXT INPUTS
		if(uiElement.hasClass("text")){
			uiElement.attr("data-state","1");
			uiElement.val(valuearray.join(", "));
			uiElement.attr("data-state","0");
		}
		
		// OTHER TEXT ELEMENTS
		else if(uiElement.hasClass("info")){
			uiElement.attr("data-state","1");
			uiElement.html(valuearray.join(", "));
			uiElement.attr("data-state","0");
		}
		
		// SLIDERS
		else if(uiElement.hasClass("slider")){
		   uiElement.attr("data-state","1");
		   uiElement.slider( "value", valuearray[0] );
		   uiElement.attr("data-state","0");
		}

		// BUTTONS
		else if(uiElement.hasClass("button")){
			uiElement.attr("data-state","1");
			uiElement.trigger('click');
			uiElement.attr("data-state","0");
		}
		
		// RADIO BUTTONS
		else if(uiElement.hasClass("radio")){
			$('[data-vname*=' + vname + '][data-value*=' + valuearray[0] + ']').trigger('click');
			uiElement.parent().buttonset("refresh");
		}
		
		// XY PADS
		else if(uiElement.hasClass("xyPad")){
			uiElement.attr("data-state","1");
			var dragArea = $(uiElement).children(".dragArea");

			// first 2 spreadvalues set the drag area if they are higher than (0,0)
			if(valuearray[0] >= 0 && valuearray[1] >= 0){
				var top = (uiElement.height() - dragArea.height());
				var left = (uiElement.width() - dragArea.width());
				dragArea.css({'top': valuearray[1] * top, 'left' : valuearray[0] * left});	
			}
			
			// the following values create aditional points on the vector pad
			$(uiElement).children(".additionalArea").remove();
			if (valuearray.length > 2){
				for (i = 0; i < ((valuearray.length-2)/2); i++ ){
					var additionalArea = $("<div class='additionalArea'></div>");
					uiElement.append(additionalArea);
					var top = (uiElement.height() - additionalArea.height());
					var left = (uiElement.width() - additionalArea.width());
					additionalArea.css({'top': valuearray[((i+2)*2)-1] * top - dragArea.height() - (i*additionalArea.height()), 'left' : valuearray[((i+2)*2)-2] * left});
				}
			}

			uiElement.attr("data-state","0");
		}
		
		// COLOR PICKERS ( http://labs.abeautifulsite.net/jquery-minicolors/ )
		else if(uiElement.hasClass("color")){
			uiElement.attr("data-state","1");
			uiElement.minicolors('value', valuearray[0]);
			uiElement.attr("data-state","0");
		}
	});
}


/*
	SERVER COMMUNICATION
	===============================================================================================
	Sends data to the socket. Have a look at the processValues function. By overwriting this function
	in the function call you can implement a preprocessing of values before they are submitted.
*/

function extend(a, b) {
  for ( var prop in b ) {
    a[prop] = b[prop];
  }
  return a;
}

function encode_utf8(s) {
  return unescape(encodeURIComponent(s));
}

function sendMessage( vname, valuearray, options) {
    options = extend({ 
        processValues: function(){ 
        	return valuearray;
        }
      }, options || {});

    var jsonObject = {};
	jsonObject["VariableName"] = { Type : "string", "Spread" : [vname] };
	jsonObject["Value"] = { Type : "string", "Spread" : options.processValues() };
	var jsonString = JSON.stringify(jsonObject);
	socket.send(jsonString);
};

