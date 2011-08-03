/**
 * Shows the target selector over the game frame
 */
function TargetFrame(view, callback, map) {
	this.view = view;
	this.map = map;
	this.loc = map.player.loc;
	this.cb = callback;
	this.gfWidth = view.gameFrame.width;
	this.gfHeight = view.gameFrame.height;
}
TargetFrame.prototype = new Frame();

TargetFrame.prototype.draw = function(ctx) {
	//no back fill; just draw the cursor over the selected location
	ctx.strokeStyle = "#f00";
	var gameFrame = this.view.gameFrame;
	ctx.strokeRect(
		gameFrame.playerXOffset() + vc.tileWidth * this.loc.col, 
		gameFrame.playerYOffset() + vc.tileHeight * this.loc.row,
		vc.tileWidth,
		vc.tileHeight);
};

TargetFrame.prototype.commandHandler = function(evt) {
	var stopEvent = false;
	var player = this.map.player;
	var widthFromCenter = player.loc.col - this.loc.col;
	var heightFromCenter = player.loc.row - this.loc.row;

	switch(evt.keyCode) {
	case 13:
		// enter
		this.view.closeTargeting();
		this.cb.call(this, this.loc);
		stopEvent = true;
	case 27:
		// esc
		this.view.closeTargeting();
		stopEvent = true;
		return false;
	case 38:
	case 104:
		// up-arrow
		if (heightFromCenter < Math.floor(this.gfHeight  / (2 * vc.tileHeight))) {
			this.loc = this.map.peek(this.loc.row - 1, this.loc.col);
		}
		stopEvent = true;
		break;
	case 40:
	case 98:
		// down-arrow
		if (heightFromCenter > -1 * Math.floor(this.gfHeight  / (2 * vc.tileHeight))) {
			this.loc = this.map.peek(this.loc.row + 1, this.loc.col);
		}
		stopEvent = true;
		break;
	case 37:
	case 100:
		// left-arrow
		if (widthFromCenter < Math.floor(this.gfWidth / (2 * vc.tileWidth))) {
			this.loc = this.map.peek(this.loc.row, this.loc.col - 1);
		}
		stopEvent = true;
		break;
	case 39:
	case 102:
		// right-arrow
		if (widthFromCenter > -1 * Math.floor(this.gfWidth / (2 * vc.tileWidth))) {
			this.loc = this.map.peek(this.loc.row, this.loc.col + 1);
		}
		stopEvent = true;
	}

	// re-render when anything changes, e.g. an item is dropped.
	this.view.renderMap();
	return !stopEvent;
};