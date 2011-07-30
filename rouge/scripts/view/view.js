/**
 * The view class, rendered to canvas
 * @constructor
 * @param {Map} map - the map for the view
 * @param {Controller} controller - the main controller
 */
function HtmlMapView(controller) {	
	var self = this;

	var imageTable = null;
	var backgroundImage = null;
	var mainFrame, gameFrame, messageFrame = null;
	
	// the currently focused frame
	var focusFrame = null;

	var map = controller.map;
	var display = null;

	this.inventoryFrames = [];
	
	this.init = function() {
		//create the main canvas and a hidden canvas for pre-rendering the background.
		var canvas = $("<canvas width='" + vc.displayWidth + "px' height='" + 
					   vc.displayHeight + "px'>Incompatible browser</canvas>");	
		display = canvas[0].getContext('2d');
		
		backgroundImage = $("<canvas style='display: none;' width='" + 
							map.width * vc.tileWidth + "' height='" + 
							map.height * vc.tileHeight + "'></canvas>")[0];
		
		$("#game_view").append(canvas).append(backgroundImage);
		controller.addEventHandler("tick", self.renderMap);
		
		this.imageTable = new ImageTable();
		self.initFrames();
		
		//preload images - we don't have any way to properly wait, have to 
		//go through a chain of events to eventually get to the main loop
		display.fillStyle = "rgb(0,0,0)";
		display.fillText("Loading images...", 200, 144);
		
		(new EventChain())
			.add(imageTable.init, imageTable, "ready")
			.add(self.gameFrame.prerenderBackground, self.gameFrame, 
				 "prerenderComplete")
			.execute(controller.start);		
	};	
		
	/**
	 * Sets the focus to the specified frame.  If the focused frame provides a
	 * "commandHandler" method, this will be passed a jQuery Event object in response
	 * to the keydown window event.
	 */
	this.setFocusFrame = function(frame) {
		if (self.focusFrame && "commandHandler" in self.focusFrame) {
			$(window).unbind("keydown", self.focusFrame.commandHandler);
		}

		if ("commandHandler" in frame) {
			$(window).bind("keydown", frame.commandHandler);
		}
		
		self.focusFrame = frame;
	};
	
	this.initFrames = function() {
		//compose the game frame atop the message frame for the default view
		var gameFrame = self.gameFrame = gameFrameBuilder.build(
			controller,
			self,
			imageTable,
			backgroundImage, 
			{
				height: vc.displayHeight - 128,
				width: vc.displayWidth
			});
		
		var msgFrame = self.messageFrame = messageFrameBuilder.build(
			map, 
			{
				height: 128,
				width:	vc.displayWidth
			});
		
		self.mainFrame = gameFrame.above(msgFrame);
		self.setFocusFrame(gameFrame);
	}
	
	this.renderMap = function() {	 
		//wipe the canvas
		var ctx = display;
		ctx.fillStyle = "rgb(0,0,0)";
		ctx.fillRect(0,0,vc.displayWidth,vc.displayHeight);
		
		//render the current scene
		self.mainFrame.draw(ctx);
	};

	this.showInventory = function(container) {
		// todo: keep a stack of these for e.g. containers within containers
		controller.stop();
		var frame = inventoryFrameBuilder.build(
			container, 
			this, 
			{
				height: vc.displayHeight - 128,
				width: vc.displayWidth
			});
		
		this.inventoryFrames.push(frame);

		self.mainFrame = frame.above(msgFrame);
		self.setFocusFrame(frame);
	};

	/**
	 * restore either the last inventory frame or the main game frame
	 */
	this.closeInventory = function() {
		
		var frame = this.inventoryFrames.pop() || this.mainFrame;
		this.mainFrame = frame.above(this.msgFrame);
		this.setFocusFrame(frame);

		if (frame == this.mainFrame) 
			controller.start();
	};
	
	this.showAnimations = function () {
		
	};
}
