/**
 * Logic for generating the field of view of the player.  This could also potentially provide other 
 * line of sight algorithms for npc targeting, etc.
 *
 * The FOV object should be considered read-only; when something in the environment has changed,
 * a new object should be constructed.
 */
function FieldOfView(map, region_height, region_width) {
	this.map = map;
	this.region_height = region_height;
	this.region_width = region_width;
	this._hidden_tiles = null;
}

/**
 * Returns true if a stack in a row contains an item with the "opaque" property set to true.
 */
FieldOfView.prototype.is_tile_opaque = function(tile) {
	var opaque = false;
	for (var i = 0; i < tile.length; i++) {
		var item = tile[i];
		if (item.hasOwnProperty("opaque") && item["opaque"]) {
			return true;
		}
	}
	return false;
};

/**
 * If the tile is obscured from the point of view of the origin
 * @param loc - a cell on the map with "row" and "col" properties
 */
FieldOfView.prototype.is_tile_hidden = function(loc) {
	if (this._hidden_tiles == null) {
		// populate the hidden list and lookup
		this.get_hidden_tiles();
	}
	return this._hidden_tiles.indexOf(loc) != -1;
	
	// tried to do an object/hash table as lookup, performance was bad when done like this,
	// not sure if it's the setup of the array or the lookup itself that's killing it but 
	// may well be worth revisiting.
	// return this._hidden_lookup.hasOwnProperty([loc.row, loc.col]);
};

/**
 * Returns a list of tiles that cannot be seen from the specified origin, within the 
 * region specified in the constructor between map, region_height, and region_width.
 * Tiles blocking visibility must specify the "opaque" property.
 *
 * @param origin - an object with "row" and "col" properties, e.g. player.loc
 */
FieldOfView.prototype.get_hidden_tiles = function(origin) {
	// one-time lazy evaluation of the list
	if (this.hidden_tiles) {
		return this.hidden_tiles;
	}

	this._hidden_tiles = [];
	var quad_width = this.region_width / 2;
	var quad_height = this.region_height / 2;
	var map = this.map;
	
	var q1 = map.get_region(origin.row, 
							origin.col, 
							quad_height,
							quad_width,
							false, false);
	var q2 = map.get_region(origin.row, 
							origin.col - quad_width,
							quad_height,
							quad_width,
							false, true);
	var q3 = map.get_region(origin.row - quad_height, 
							origin.col - quad_width,
							quad_height,
							quad_width,									
							true, true);
	var q4 = map.get_region(origin.row - quad_height, 
							origin.col,
							quad_height,
							quad_width,
							true, false);
	
	this._find_hidden_tiles(q1);
	this._find_hidden_tiles(q2);
	this._find_hidden_tiles(q3);
	this._find_hidden_tiles(q4);
	
	return this._hidden_tiles;
};

/**
 * Calculates the list of hidden tiles for quadrant 1, where the x/col and y/row coordinates
 * are positive with respect to the origin.  This must be performed for the remaining quadrants
 * by reflecting about the x and/or y axis the region of the map corresponding to the quadrant.
 *
 * @param region - a two-dimensional array of the quadrant in question; a subset of the map's
 *     internal grid representation is expected here, e.g. 
 *     [ [ [{Player}, {Tile}], [{Tile}] ],
 *       [ [{Tile}], [{Tile}] ] ]
 */
FieldOfView.prototype._find_hidden_tiles = function(region) {
	// return list of cells in the region that should not be shown from the point of origin
	for (var row = 0; row < region.length; row++) {
		current_row = region[row];
		for (var col = 0; col < current_row.length; col++) {
			// must check all squares for opacity, even those that are hidden, as 
			// part of an opaque square may hide other squares that the square obscuring
			// it does not explicitly hide.			
			var current = current_row[col];

			// search for a tile with an opaque item			
			if (this.is_tile_opaque(current))
			{
				// create rulings, solve for x to walk each row in the grid.
				var top_line = function(x) {
					return ((row + 1) / col) * (x - col) + row + 1;
				}
				
				var bottom_line = function(x) {
					return (row / (col + 1)) * (x - col - 1) + row;						
				}
				
				// check whether each visible tile falls in the region between the lines
				for (var i = row; i < region.length; i++) {
					var check_row = region[i];
					
					// don't include the opaque tile in walk to find obscured tiles
					var j = (i == row) ? col + 1 : 0;
					
					for (; j < check_row.length; j++) {
						var ubound = top_line(j);
						// hack for 0th column - div by zero error in line fn?
						if (isNaN(ubound)) ubound = region.length;
						var lbound = bottom_line(j);
						if (lbound == 0) lbound = -.001
						var cell = check_row[j];
						
						if (!this.is_tile_hidden(cell) && 
							(i < ubound && i > lbound))
						{
							// this cell should be hidden
							this._hidden_tiles.push(cell);
							// todo: early out here when past edge of line?
						}
					}
				}
			}
		}
	}
};
