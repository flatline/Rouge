/**
 * Displays the inventory of anything with an "items" property that contains a list of
 * Items.  For example, a character, or a container like a backpack or bag.
 */
function InventoryFrame(view, container) {
	this.container = container;
	this.items = container.items;
	this.imageSize = 32;
	this.selectedIndex = 0;
	this.view = view;
}
InventoryFrame.prototype = new Frame();

InventoryFrame.prototype.draw = function(ctx) {
	var margin = 3;
	this.fill(ctx, "#000");
	ctx.strokeStyle = "#fff";
	for (var i = 0; i < this.items.length; i++) {
		var xOffset = margin;
		var yOffset = i * (this.imageSize + margin);
		var item = this.items[i];
		ctx.drawImage(this.view.imageTable[item.repr], xOffset, yOffset);
		ctx.fillStyle = "#fff";
		ctx.fillText(
			item.descr, 
			xOffset + this.imageSize, 
			yOffset + this.imageSize / 2, 
			this.width - xOffset - this.imageSize);
		if (i == this.selectedIndex) {
			ctx.strokeRect(1, yOffset , this.width - 2, this.imageSize);
		}
	}
};

InventoryFrame.prototype.commandHandler = function(evt) {
	var stopEvent = false;

	// local references for convenience
	var loc = this.view.map.player.loc;
	var items = this.items;
	var idx = this.selectedIndex;
	var item = items[idx];

	switch(evt.keyCode) {
	case 27:
		// esc
		this.view.closeInventory();
		return false;
	case 38:
	case 104:
		// up-arrow
		if (this.selectedIndex > 0)
			this.selectedIndex -=1;
		stopEvent = true;
		break;
	case 40:
	case 98:
		// down-arrow
		if (this.selectedIndex < this.container.items.length - 1) 
			this.selectedIndex += 1;
		stopEvent = true;
		break;
	case 68:
		// d = drop
		if (items.length > 0) {
			this.view.map.poke(item, loc.row, loc.col);
			items.splice(this.selectedIndex, 1);
			if (idx > items.length - 1)
				this.selectedIndex = items.length - 1;
			this.view.map.addMessage("You dropped " + item.descr);
		}
		stopEvent = true;
	}

	// re-render when anything changes, e.g. an item is dropped.
	this.view.renderMap();
	return stopEvent;
};