function InventoryFrame(view, container) {
	this.container = container;
	this.itemHeight = 32;
	this.selectedIndex = -1;
	this.view = view;
}
InventoryFrame.prototype = new Frame();

InventoryFrame.prototype.commandHandler = function(evt) {
	switch(evt.keyCode) {
	case 27:
		// esc
		this.view.closeInventory();
	}
};