// drop some items around a map
function newMap() {
	var map = new Map();
	map.init(30,30);

	// tile the ground
	for (var i = 0; i < 30; i++) {
		for (var j = 0; j < 30; j++) {
			map.poke({ repr: "grounds:0,4", static : true, descr: "floor" },  i, j);
		}
	}

	var shrooms = ["shroom_red", "shroom_blue", "shroom_orange", "shroom_brown", "shroom_green"];
	var weapons = ["longsword", "shortsword", "broadsword", "greatsword"];

	for (var i = 0; i < 30; i++) {
		map.poke(FoodBuilder.build(shrooms[Math.floor(Math.random() * shrooms.length)]), Math.floor(Math.random() * 30), Math.floor(Math.random() * 30));
	}

	for (var i = 0; i < 4; i++) {
		map.poke(WeaponBuilder.build(weapons[Math.floor(Math.random() * weapons.length)]), Math.floor(Math.random() * 30), Math.floor(Math.random() * 30));
	}

	var player = new Player();
	map.player = player;
	map.poke(player, 15, 15);
	
	return map;
}

function newGameController() {
	var map = newMap();
	
	var controller = new Controller(map);
	
	return controller;
}

Rouge.initGame(newGameController());