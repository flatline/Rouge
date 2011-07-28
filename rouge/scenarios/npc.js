/**
 * Debug - lays down a default set of tiles ('.') on each square of a map.
 * @param {Map} map - the map to tile 
 */
function tileMap(map) {
	var width = map.width;
	var height = map.height;
	for (var i = 0; i < height; i++) {
		for (var j =0; j < width; j++) {
			map.poke({ repr: "grounds:1,0", "static": true }, i, j);
		}			
	}		 
}

function newGameController() {
	var map = new Map();
	map.init(30, 30);
	tileMap(map);
	
	var controller = new Controller(map);

	var player = new Player();
	map.player = player;
	map.poke(player, 1, 1);

	for (var i = 0; i < 3; i++) {
		var orc = new NPC();
		orc.repr = "monster1:3,1";
		orc.id = world.getID();									   
		map.poke(orc, 15, i);
		controller.schedule(orc, 1000);
	}
	return controller;
}

Rouge.initGame(newGameController());