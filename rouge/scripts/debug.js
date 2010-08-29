function Debug() {	
	var self = this;

	this.write = function(msg, style) {
		$("body").append("<div style='" + style + "'>" + msg + "</div>");
	};
	
	this.info = function(msg) {
		self.write(msg, "color: black");
	};

	this.error = function(msg) {
		self.write(msg, "color: red");
	};		
	
	this.assert = function(b, failMsg) {
		if (!b) {
			(failMsg === undefined) ? self.error("Assert failed") : self.error(failMsg);			
		}		 
	};
	
	this.run = function(fn) {
		try {
			fn();
		} catch (e) {
			self.error("Error running test: " + e);
		}
	}
}