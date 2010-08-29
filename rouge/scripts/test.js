var test = {};

test.wireUpTestButtons = function() {

    $("#GetButton").click(function() {
	test.ajax("GET", 125);
    });

    $("#PutButton").click(function() {
        test.ajax("PUT", 125, "value=putval");
    });

    $("#DeleteButton").click(function() {
	test.ajax("DELETE", 125);	
    });

    $("#PostButton").click(function() {
	test.ajax("POST", 125, "value=postval");
    });
};

test.ajax = function(type, param, payload) {
    $.ajax({
	type: type,
	url: "game/" + param,
	data: payload ? payload : null,
	success: function(data) {
	    alert(data);
	},
	error: function(xhr, msg) {
	    alert("An error occurred: " + xhr.statusText + 
		  (msg ? ", " + msg : ""));
	}
    });
};