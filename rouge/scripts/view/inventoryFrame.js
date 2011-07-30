var inventoryFrameBuilder = new function MessageFrameBuilder() {
	/**
	 * @param container - anything with an inventory property, as 
	 * an array of Items.
	 */
	this.build = function(container, view, frameAttrs) {
		var invFrame = new Frame(frameAttrs);
		var itemHeight = 35;
		var verticalOffset = 0;

		invFrame.idx = 0;

		invFrame.draw = function(ctx) {
			invFrame.fill(ctx, "#000");
			var borderWidth = 3;
			invFrame.border(ctx, "#888", borderWidth);
			ctx.fillStyle = "#000";
			
			
			
				if (msg = messages[i]) {
					ctx.fillText(
						msg, 
						borderWidth + 3, 
						msgFrame.top + msgFrame.height - (len - i) * 10, 
						msgFrame.width);
				} 
			}
		};

		invFrame.commandHandler = function(evt) {
			switch(evt.keyCode) {
			case 27:
				// esc
				view.closeInventory();
			}
		};
		
		return invFrame;
	}
};
