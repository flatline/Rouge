/**
 * {@link common.js}
 * {@link actions.js}
 */
var world = new function World() {
    var _lastID = 0;

    this.maps = [];

	this.getID = function() {
		return ++_lastID;				
	};						 
}

/**
 * The basic map structure of an in-game area.
 * @constructor
 */
function Map() {
	this.typeName = "Map";
	this._grid = [];
	this.index = {};
	
	this.actions = [];
	this.messages = [];
	this.maxMessages = 10;
	
	this.height = 0;
	this.width = 0;

	this.player = null;
}

/**
 * Build the map out with empty cell refs at each locus
 * @param {Number} h
 * @param {Number} w
 * @return
 */
Map.prototype.init = function(h, w) {		
	var i, j, row, cell;
	
	for (i = 0; i < h; i++) {
		row = [];
		this._grid.push(row);
		for (j = 0; j < w; j++) {
			cell = [];
			cell.col = j;
			cell.row = i;
			row.push(cell);
		}
	}
	this.height = h;
	this.width = w;				   
};

/**
 * Have a look at whatever's at the specified coordinates
 * @param {Number} row
 * @param {Number} col
 * @param {Number} idx
 * @return
 */
Map.prototype.peek = function(row, col, idx) {		
	var result = null;
	if (typeof(row) !== "undefined") {
		if (row < 0 || row > this.height - 1) return null;
		result = this._grid[row];
	}
	if (typeof(col) !== "undefined") {
		if (col < 0 || col > this.width - 1) return null;
		result = result[col];
	}
	if (typeof idx != "undefined") {
		if (idx < 0 || idx > result.length - 1) return null;
		result = result[idx];
	}
	return result;
};

/**
 * Adds obj at the given row, column, and optionally index
 * @param obj - the object to place on the stack at the given coordinates
 * @param row - the row or y coordinate in the map
 * @param col - the column or x coordinate in the map
 * @param idx - optional; if present, injects at the specified z-index 
 *              of the stack, else pushes to the top
 * @return
 */
Map.prototype.poke = function(obj, row, col, idx) {
	var cell = this.peek(row, col);
	if ("id" in obj) this.index[obj.id] = obj;
	obj.loc = cell;
	if (typeof idx != "undefined") {
		cell.splice(idx, 0, obj);
	} else {
		cell.push(obj);
	}
	return this;
};

/**
 * Removes obj from the map via its cell reference
 * @param obj - the object to remove
 */
Map.prototype.yank = function(obj) {				   
	delete this.index[obj.id];
	var cell = obj.loc;
	for (var i = 0; i < cell.length; i++) {
		if (cell[i] == obj) {
			cell.splice(i, 1);
		}
	}
	delete obj.loc;
	return obj;
};

/**
 * The most basic movement operation.  It enforces an interface on the 
 * target cell such that tryToPass, if defined, is called on all objects 
 * in the target object stack.  If tryToPass does not fail for any items 
 * in the target, the object's cell reference is updated, completing 
 * the move.
 */
Map.prototype.move = function(obj, row, col, idx) {		
	if (row >= this.height || row < 0 || col >= this.width || col < 0) 
		return this;		
	var cell = this.peek(row, col);		
	var canPass = cell.fold(function(o, acc) {
		return typeof o.tryToPass !== "undefined" ? 
			acc && o.tryToPass(obj, this) : 
			acc && true; 
	}, true);
	if (canPass) {
		this.yank(obj);
		return this.poke(obj, row, col, idx);
	} else {
		return this;
	}
};

/**
 * Add a message to the list
 */
Map.prototype.addMessage = function(msg) {
	this.messages.push(msg);
	
	// truncate list
	if (this.messages.length > this.maxMessages) {
		this.messages = this.messages.slice(this.messages.length - this.maxMessages, 
											this.messages.length + 1);
	}
};

/**
 * Calculates the linear distance between two locations on the map
 */
Map.prototype.distance = function (loc1, loc2) {
	if (!(loc1 && loc2)) 
		return 100000;

	return Math.round(
		Math.sqrt( 
			Math.pow(loc1.row - loc2.row, 2) + 
				Math.pow(loc1.col - loc2.col, 2)));
};

/**
 * Selects a subset of tiles from the underlying map structure.  Returns null on error.
 * @param tr - starting row index, 0-based
 * @param tc - starting column, 0-based
 * @param h - height of region
 * @param w - width of region
 * @param reflect_cols - reverse the column order in the result set
 * @param reflect_rows - reverse the row order in the result set
 */
Map.prototype.get_region = function(tr, tc, h, w, reflect_rows, reflect_cols) {
	var result = [];
	try {
		var start, end, next, cmp;
		if (reflect_rows) {
			// reverse the traversal order
			start = tr + h;
			if (start > this._grid.length) start = this._grid.length;
			end = tr;
			if (end < -1) end = -1;
			next = -1;
			cmp = function(a, b) { return a > b };
		}
		else {
			start = tr;
			if (start < -1) start = -1;
			end = tr + h;
			if (end > this._grid.length) end = this._grid.length;
			next = 1;
			cmp = function(a, b) { return a < b };
		}

		for (i = start; cmp(i, end); i += next) {
			var row = this.peek(i);
			if (tc < 0) {
				w = Math.floor(w + tc);
				tc = 0;
			}
			var new_row = row.slice(tc, tc + w + 1);
			if (reflect_cols) new_row.reverse();
			result.push(new_row);
		}
	}
	catch (e) {
		return null;
	}
	return result;
};
