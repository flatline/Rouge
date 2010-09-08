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
	var self = this;
	this.typeName = "Map";
	this._grid = [];
	this.index = {};
	
	this.actions = [];
	this.messages = [];
	
	this.height = 0;
	this.width = 0;

	this.player = null;
	
	/**
	 * Build the map out with empty cell refs at each locus
	 * @param {Number} h
	 * @param {Number} w
	 * @return
	 */
	this.init = function(h, w) {		
		var i, j, row, cell;
		
		for (i = 0; i < h; i++) {
			row = [];
			self._grid.push(row);
			for (j = 0; j < w; j++) {
				cell = [];
				cell.col = j;
				cell.row = i;
				row.push(cell);
			}
		}
		self.height = h;
		self.width = w;				   
	};
	
	/**
	 * Have a look at whatever's at the specified coordinates
	 * @param {Number} row
	 * @param {Number} col
	 * @param {Number} idx
	 * @return
	 */
	this.peek = function(row, col, idx) {		
		var result = null;
		if (typeof(row) !== "undefined") {
			if (row < 0 || row > self.height - 1) return null;
			result = self._grid[row];
		}
		if (typeof(col) !== "undefined") {
			if (col < 0 || col > self.width - 1) return null;
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
	this.poke = function(obj, row, col, idx) {
		var cell = self.peek(row, col);
		if (obj.hasOwnProperty("id")) self.index[obj.id] = obj;
		obj.loc = cell;
		if (typeof idx != "undefined") {
			cell.splice(idx, 0, obj);
		} else {
			cell.push(obj);
		}
		return self;
	};
	
	/**
	 * Removes obj from the map via its cell reference
	 * @param obj - the object to remove
	 */
	this.yank = function(obj) {				   
		delete self.index[obj.id];
		var cell = obj.loc;
		for (var i = 0; i < cell.length; i++) {
			if (cell[i] == obj) {
				cell.splice(i, 1);
			}
		}
		delete obj.loc;
		return self;
	};
	
	/**
	 * The most basic movement operation.  It enforces an interface on the 
	 * target cell such that tryToPass, if defined, is called on all objects 
	 * in the target object stack.  If tryToPass does not fail for any items 
	 * in the target, the object's cell reference is updated, completing 
	 * the move.
	 */
	this.move = function(obj, row, col, idx) {		
		if (row >= this.height || row < 0 || col >= this.width || col < 0) 
			return self;		
		var cell = self.peek(row, col);		
		var canPass = cell.fold(function(o, acc) {
			return typeof o.tryToPass !== "undefined" ? 
				acc && o.tryToPass(obj, self) : 
				acc && true; 
		}, true);
		if (canPass) {
			return self.yank(obj).poke(obj, row, col, idx);
		} else {
			return self;
		}
	};
	
	/**
	 * Calculates the linear distance between two locations on the map
	 */
	this.distance = function (loc1, loc2) {
		try {
			return Math.round(
				Math.sqrt( 
					Math.pow(loc1.row - loc2.row, 2) + 
					Math.pow(loc1.col - loc2.col, 2)));
		} catch (e) {
			debug("Map.distance: " + e + ": " + e.stack);
		}		
	};
}

/**
 * Debug - lays down a default set of tiles ('.') on each square of a map.
 * @param {Map} map - the map to tile 
 */
function tileMap(map) {
	var width = map.width;
	var height = map.height;
	for (var i = 0; i < height; i++) {
		for (var j =0; j < width; j++) {
			map.poke({ repr: "grass1", "static": true }, i, j);
		}			
	}		 
}

function debug(val) {
	$("#debug ul")
		.prepend("<li><div class='debug-time'>" +
				 new Date().toLocaleTimeString() +
				 "</div><span>" +
				 val + 
				 "</span></li>");
}

function assert(val, failMsg, successMsg) {
	if (!val) {
		if (typeof failMsg != "undefined") debug("Assert failed: " + failMsg);
		else debug("Assert failed");
	} else {
		if (typeof successMsg != "undefined") debug("Assert passed: " + successMsg);
		else debug("Assert passed");
	}
}
