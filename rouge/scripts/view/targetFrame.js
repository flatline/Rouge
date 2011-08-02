/**
 * Shows the target selector over the game frame
 */
function TargetFrame(view, callback, map) {
	this.view = view;
	this.map = map;
	this.loc = map.player.loc;
	this.cb = callback;
}
TargetFrame.prototype = new Frame();

TargetFrame.prototype.draw = function(ctx) {
	//no back fill; just draw the cursor over the selected location
	ctx.strokeStyle = "#f00";
	var gameFrame = this.view.gameFrame;
	ctx.strokeRect(
		gameFrame._playerXOffset() + vc.tileWidth * this.loc.col, 
		gameFrame._playerYOffset() + vc.tileHeight * this.loc.row,
		vc.tileWidth,
		vc.tileHeight);
};

TargetFrame.prototype.commandHandler = function(evt) {
	var stopEvent = false;
	var player = this.map.player;

	switch(evt.keyCode) {
	case 13:
		// enter
		this.view.closeTargeting();
		this.cb.apply(this, this.loc);
		stopEvent = true;
	case 27:
		// esc
		this.view.closeTargeting();
		stopEvent = true;
		return false;
	case 38:
	case 104:
		// up-arrow
		this.loc = this.map.peek(this.loc.row - 1, this.loc.col);
		stopEvent = true;
		break;
	case 40:
	case 98:
		// down-arrow
		this.loc = this.map.peek(this.loc.row + 1, this.loc.col);
		stopEvent = true;
		break;
	case 37:
	case 100:
		// left-arrow
		this.loc = this.map.peek(this.loc.row, this.loc.col - 1);
		stopEvent = true;
		break;
	case 39:
	case 102:
		// right-arrow
		this.loc = this.map.peek(this.loc.row, this.loc.col + 1);
		stopEvent = true;
	}

	// re-render when anything changes, e.g. an item is dropped.
	this.view.renderMap();
	return !stopEvent;
};