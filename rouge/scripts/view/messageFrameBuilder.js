var messageFrameBuilder = new function MessageFrameBuilder() {
	this.build = function(map, frameAttrs) {
		var msgFrame = new Frame(frameAttrs);
		
		var maxMessages = 10;
		
		msgFrame.draw = function(ctx) {
			var messages = map.messages;
			msgFrame.fill(ctx, "#000");
			var borderWidth = 3;
			msgFrame.border(ctx, "#888", borderWidth);
			ctx.fillStyle = "#000";
			
			var len = messages.length > maxMessages ? 
				maxMessages : 
				messages.length;

			//print last at bottom of the frame
			var msg;
			for (var i = len - 1; i >= 0; i--) {
				if (msg = messages[i]) {
					ctx.fillText(
						msg, 
						borderWidth + 3, 
						msgFrame.top + msgFrame.height - (len - i) * 10, 
						msgFrame.width);
				} 
			}
		};
		
		return msgFrame;
	}
};
