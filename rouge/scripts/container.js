/**
 * An item container - inherits from Array but should use the addItem, removeItem, etc., 
 * to properly build an inventory collection.
 */
function Container() {
	this.typeName = "Container";
}
Container.prototype = new Array();

Container.prototype._categoryPredicate = function(a, b) {
	if (a.itemCategory > b.itemCategory) 
		return 1;
	else if (a.itemCategory < b.itemCategory) 
		return -1;
	else
		return a.descr > b.descr ? 1 : -1;
}

Container.prototype.addItem = function(item) {
	if (item.stackable) {
		var found = false;
		for (var i = 0; !found &&  i < this.length; i++) {
			// todo: equality comparison of items??
			if (this[i].descr == item.descr) {
				this[i].qty += 1;
				found = true;
			}
		}
		if (!found) {
			this.push(item);
			this.sort(this._categoryPredicate);
		}
	}
	else {
		this.push(item);
		// keep everything sorted by category
		this.sort(this._categoryPredicate);
	}
};

Container.prototype.removeItem = function(itemIdx) {
	var item = this[itemIdx];
	if (item && item.stackable && item.qty > 1) {
		item.qty -=1;
		// clone a new copy of the item
		var result = new Item();
		result.merge(item);
		return result;
	}
	else {
		this.splice(itemIdx, 1);
		return item;
	}
};
