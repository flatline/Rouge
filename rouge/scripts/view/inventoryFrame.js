/**
 * Displays the inventory of a Container.  For example, a character, or a backpack.
 */
function InventoryFrame(view, container) {
	this.container = container;
	this.imageSize = 32;
	this.selectedIndex = 0;
	this.view = view;
	this.player = view.map.player;
	this.qtyWidth = 25;
}
InventoryFrame.prototype = new Frame();

InventoryFrame.prototype.draw = function(ctx) {
	var margin = 3;
	this.fill(ctx, "#000");
	ctx.strokeStyle = "#fff";

	for (var i = 0; i < this.container.length; i++) {
		var xOffset = margin;
		var yOffset = i * (this.imageSize + margin);
		var width = this.width;
		var item = this.container[i];

		// highlight selected
		if (i == this.selectedIndex) {
			ctx.strokeRect(1, yOffset , this.width - 2, this.imageSize);
		}

		// image
		ctx.drawImage(this.view.imageTable[item.repr], xOffset, yOffset);

		// qty
		xOffset += this.imageSize + margin;
		yOffset += this.imageSize / 2;
		width -= xOffset + this.imageSize;
		ctx.fillStyle = "#fff";
		ctx.fillText(item.qty.toString(), xOffset, yOffset, width);

		// descr
		var descr = item.descr;
		xOffset += this.qtyWidth;
		width -= this.qtyWidth;
		// show if wielded or worn
		if (item instanceof Armor && this.player.armorSlots[item.slot] == item) {
			descr += " (being worn)";
		}
		else if (item instanceof Weapon) {
			if (this.player.weaponSlots["right_hand"] == item) {
				descr += " (wielded in right hand)";
			}
			else if (this.player.weaponSlots["left_hand"] == item) {
				descr += " (wielded in left hand)";
			}
		}

		ctx.fillText(descr, xOffset, yOffset, width);
	}
};

InventoryFrame.prototype.commandHandler = function(evt) {
	var stopEvent = false;
	var container = this.container;
	var item = this.container[this.selectedIndex];
	var player = this.player;

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
		if (this.selectedIndex < container.length - 1) 
			this.selectedIndex += 1;
		stopEvent = true;
		break;
	case 68:
		// d = drop
		if (container.length > 0) {
			this.view.map.player.drop(container, this.selectedIndex, this.view.map);
			if (this.selectedIndex > container.length - 1)
				this.selectedIndex = container.length - 1;
		}
		stopEvent = true;
	case 87:
		// w = wield or wear
		if (item instanceof Armor) {
			player.wearArmor(item);
			this.view.map.addMessage("You put on " + item.descr);
		}
		else if (item instanceof Weapon) {
			try {
				player.wieldWeapon(item);
				this.view.map.addMessage("You wield " + item.descr);
			}
			catch (e) {
				this.view.map.addMessage(e);
			}
		}
		//todo: remove
	}

	// re-render when anything changes, e.g. an item is dropped.
	this.view.renderMap();
	return !stopEvent;
};