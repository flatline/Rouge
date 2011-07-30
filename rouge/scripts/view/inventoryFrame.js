/**
 * Displays the inventory of anything with an "items" property that contains a list of
 * Items.  For example, a character, or a container like a backpack or bag.
 */
function InventoryFrame(view, container) {
	this.container = container;
	this.imageSize = 32;
	this.selectedIndex = -1;
	this.view = view;
}
InventoryFrame.prototype = new Frame();

InventoryFrame.prototype.draw = function(ctx) {
	var margin = 3;
	this.fill(ctx, "#000");
	for (var i = 0; i < this.container.items.length; i++) {
		var xOffset = margin;
		var yOffset = i * (this.imageSize + margin);
		var item = this.container.items[i];
		ctx.drawImage(this.view.imageTable[item.repr], xOffset, yOffset);
		ctx.fillStyle = "#fff";
		ctx.fillText(
			item.descr, 
			xOffset + this.imageSize, 
			yOffset + this.imageSize / 2, 
			this.width - xOffset - this.imageSize);
	}
};

InventoryFrame.prototype.commandHandler = function(evt) {
	switch(evt.keyCode) {
	case 27:
		// esc
		this.view.closeInventory();
		return false;
	default:
		// re-render when anything changes, e.g. an item is dropped.
		view.renderMap();
		break;
	}
};