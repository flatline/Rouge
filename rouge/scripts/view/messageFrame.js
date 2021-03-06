function MessageFrame(map) {
	this.map = map;
	this.maxMessages = 11;
}
MessageFrame.prototype = new Frame();

MessageFrame.prototype.draw = function(ctx) {
	var messages = this.map.messages;
	this.fill(ctx, "#000");
	var borderWidth = 3;
	this.border(ctx, "#888", borderWidth);
	ctx.font = "13px monospace";
	ctx.fillStyle = "#fff";
	
	var len = messages.length > this.maxMessages ? 
		this.maxMessages : 
		messages.length;

	//print last at bottom of the frame
	var msg;
	for (var i = len - 1; i >= 0; i--) {
		if (msg = messages[i]) {
			ctx.fillText(
				msg, 
				this.left + borderWidth + 3, 
				this.top + (len - i) * 11, 
				this.width);
		} 
	}
};
