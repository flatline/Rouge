/**
 * Logic for generating the field of view of the player.  This could also potentially provide other 
 * line of sight algorithms for npc targeting, etc.
 */

function FieldOfView(map, region_height, region_width) {
	this.map = map;
	this.region_height = region_height;
	this.region_width = region_width;
}

/**
 * Returns a list of tiles that cannot be seen from the specified origin, within the 
 * region specified in the constructor between map, region_height, and region_width.
 * Tiles blocking visibility must specify the "opaque" property.
 *
 * @param origin - an object with "row" and "col" properties, e.g. player.loc
 */
FieldOfView.prototype.get_hidden_tiles = function(origin) {
	hidden_tiles = [];
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
	
	this._find_hidden_tiles(q1, hidden_tiles);
	this._find_hidden_tiles(q2, hidden_tiles);
	this._find_hidden_tiles(q3, hidden_tiles);
	this._find_hidden_tiles(q4, hidden_tiles);
	
	return hidden_tiles;
};

/**
 * Calculates the list of hidden tiles for quadrant 1, where the x/col and y/row coordinates
 * are positive with respect to the origin.  This is then performed for the remaining quadrants
 * by reflecting about the x and/or y axis the region of the map corresponding to the quadrant.
 *
 * @param region - a two-dimensional array of the quadrant in question; a subset of the map's
 *     internal grid representation is expected here, e.g. 
 *     [ [ [{Player}, {Tile}], [{Tile}] ],
 *       [ [{Tile}], [{Tile}] ] ]
 * 
 * @param hidden_tiles - in/out param, running list of tiles across all quadrants.  This yields
 *     the final result of the calculation.
 */
FieldOfView.prototype._find_hidden_tiles = function(region, hidden_list) { //, origin) {
	// return list of cells in the region that should not be shown from the point of origin
	
	// treat each cell as an idealized 1x1 square
	var result = hidden_list;
	
	// currently Q1 only (row > 0, col > 0) - ideally would move out from origin.
	// todo - make work in each direction from an origin in the center of a region, perhaps
	// by reflection or change of direction in the line and comparison formulae
	for (var row = 0; row < region.length; row++) {
		current_row = region[row];
		for (var col = 0; col < current_row.length; col++) {
			var current = current_row[col];
			
			// already hidden?
			// todo: change to hash table for quick lookup, flatten before returning
			if (result.indexOf(current) > -1) continue; 
			
			// search for a tile with an opaque item
			var opaque = false;
			for (var item_idx = 0; item_idx < current.length; item_idx++) {
				var item = current[item_idx];
				if (item.hasOwnProperty("opaque") && item["opaque"]) {
					opaque = true;
					break;
				}
			}
			
			if (opaque)
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
						
						if (result.indexOf(cell) == -1 && 
							(i < ubound && i > lbound))
						{
							// this cell should be hidden
							result.push(cell);
							// todo: early out here when past edge of line?
						}
					}
				}
			}
		}
	}
};
