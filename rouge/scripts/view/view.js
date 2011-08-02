/**
 * The view class, rendered to canvas
 * @constructor
 * @param {Map} map - the map for the view
 * @param {Controller} controller - the main controller
 */
function HtmlMapView(controller) {
	this.imageTable = null;
	this.backgroundImage = null;
	this.mainFrame = null
	this.gameFrame = null;
	this.messageFrame = null;
	
	// the currently focused frame
	this.focusFrame = null;

	this.map = controller.map;
	this.display = null;

	this.inventoryFrames = [];
	this.controller = controller;
}

HtmlMapView.prototype.init = function() {
	//create the main canvas and a hidden canvas for pre-rendering the background.
	var canvas = $("<canvas width='" + vc.displayWidth + "px' height='" + 
				   vc.displayHeight + "px'>Incompatible browser</canvas>");	
	this.display = canvas[0].getContext('2d');
	var map = this.map;
	
	this.backgroundImage = $("<canvas style='display: none;' width='" + 
							 map.width * vc.tileWidth + "' height='" + 
							 map.height * vc.tileHeight + "'></canvas>")[0];
	
	$("#game_view").append(canvas).append(this.backgroundImage);
	this.controller.addEventHandler("tick", bind(this, this.renderMap));
	
	this.imageTable = new ImageTable();
	this.initFrames();
	
	//preload images - we don't have any way to properly wait, have to 
	//go through a chain of events to eventually get to the main loop
	this.display.fillStyle = "rgb(0,0,0)";
	this.display.fillText("Loading images...", 200, 144);
	
	(new EventChain())
		.add(bind(this.imageTable, this.imageTable.init), this.imageTable, "ready")
		.add(bind(this.gameFrame, this.gameFrame.prerenderBackground), this.gameFrame, 
			 "prerenderComplete")
		.execute(bind(this.controller, this.controller.start));		
};	

/**
 * Sets the focus to the specified frame.  If the focused frame provides a
 * "commandHandler" method, this will be passed a jQuery Event object in response
 * to the keydown window event.
 */
HtmlMapView.prototype.setFocusFrame = function(frame) {
	if (this.focusFrame && "commandHandler" in this.focusFrame) {
		$(window).unbind("keydown");
	}

	if ("commandHandler" in frame) {
		$(window).bind("keydown", bind(frame, frame.commandHandler));
	}
	
	this.focusFrame = frame;
};

HtmlMapView.prototype.initFrames = function() {
	this.gameFrame = new GameFrame(this, this.backgroundImage);
	this.gameFrame.init({
		height: vc.displayHeight - 128, 
		width: vc.displayWidth
	});

	this.messageFrame = new MessageFrame(this.map);
	this.messageFrame.init({
		height: 128,
		width:	vc.displayWidth
	});
	
	this.mainFrame = this.gameFrame.above(this.messageFrame);
	this.setFocusFrame(this.gameFrame);
}

HtmlMapView.prototype.renderMap = function() {	 
	//wipe the canvas
	var ctx = this.display;
	ctx.fillStyle = "rgb(0,0,0)";
	ctx.fillRect(0,0,vc.displayWidth,vc.displayHeight);
	
	//render the current scene
	this.mainFrame.draw(ctx);
};

/**
 * Pushes an inventory frame onto the stack
 *
 * @param container - anything with an {items} collection
 */
HtmlMapView.prototype.showInventory = function(container) {
	// todo: keep a stack of these for e.g. containers within containers
	this.controller.stop();
	var frame = new InventoryFrame(this, container);
	frame.init({
		height: vc.displayHeight - 128,
		width: vc.displayWidth
	});
	
	this.inventoryFrames.push(frame);

	this.mainFrame = frame.above(this.messageFrame);
	this.setFocusFrame(frame);
};

/**
 * Restore either the last inventory frame or the main game frame
 */
HtmlMapView.prototype.closeInventory = function() {
	this.inventoryFrames.pop();
	var frameCount = this.inventoryFrames.length;
	var frame = frameCount > 0 ? this.inventoryFrames[frameCount - 1] : this.gameFrame;
	this.mainFrame = frame.above(this.messageFrame);
	this.setFocusFrame(frame);

	if (frame == this.gameFrame) 
		this.controller.start();
};

/**
 * Shows the targeting interface overlaying the gameframe
 * @param callback - function that accepts the payload parameter, a loc on the map,
 */
HtmlMapView.prototype.showTargeting = function(callback) {
	this.controller.stop();
	// leave height and width to 0, will draw over the game frame...
	var targetFrame = new TargetFrame(this, callback, this.map);
	this.mainFrame = this.mainFrame.above(targetFrame);
	this.setFocusFrame(targetFrame);
};

HtmlMapView.prototype.closeTargeting = function() {
	this.mainFrame = this.gameFrame.above(this.messageFrame);
	this.setFocusFrame(this.gameFrame);
	this.controller.start();
};
