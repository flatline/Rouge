function WallBot(map) {
	// procedural wall drawing algorithm
	var self = this;
	this.map = map;
	this.dir = [0,1];
	this.loc = [0,0];
	this.state = "up"; //up|down

	this.move = function(count) {
		while (count-- > 0) {
			if (self.state === "down") self.place();
			self.loc[0] += self.dir[0];
			self.loc[1] += self.dir[1];
		}
	}

	this.down = function() {
		self.place();
		self.state = "down";
	}

	this.up = function() {
		self.state = "up";
	}

	this.place = function() {
		self.map.poke(new Wall(), self.loc[0], self.loc[1]);
	}
}

function newMap() {
	var map = new Map();
	map.init(30,30);

	//alternate light/dark tiles on each row
	for (var i = 0; i < 30; i++) {
		// for (var j = 0; j < 30; j+=2) {
		// 	map.poke({ repr: "grounds:0,4", "static" : true },  i, j + i%2);
		// 	map.poke({ repr: "grounds:0,3", "static" : true }, i, j + (i%2 ? 0 : 1));
		// }
		for (var j = 0; j < 30; j++) {
			map.poke({ repr: "grounds:0,4", "static" : true },  i, j);
		}
	}

	var player = new Player();
	map.player = player;
	map.poke(player, 15, 15);

	//draw us some walls!
	var wallBot = new WallBot(map);
	wallBot.dir = [1,1];
	wallBot.move(10);
	wallBot.down();
	wallBot.dir = [0,1];
	wallBot.move(10);
	wallBot.dir = [1,0];
	wallBot.move(10);
	wallBot.dir = [0,-1];
	wallBot.move(5);
	wallBot.up();

	//put a door here
	wallBot.move(1);		
	wallBot.down();
	wallBot.move(4);
	wallBot.dir = [-1,0];
	wallBot.move(10);

	//draw an outer wall
	wallBot.up();
	wallBot.dir = [-1, -1];
	wallBot.move(2);
	wallBot.dir = [0, 1];
	wallBot.down();
	wallBot.move(14);
	wallBot.dir = [1, 0];
	wallBot.move(6);
	wallBot.up();
	wallBot.move(2);
	wallBot.down();
	wallBot.move(6);
	wallBot.dir = [0, -1];
	wallBot.move(14);
	wallBot.dir = [-1, 0];
	wallBot.move(6);
	wallBot.up();
	wallBot.move(2);
	wallBot.down();
	wallBot.move(6);

	//put down rows of pillars
	wallBot = new WallBot(map);
	wallBot.dir = [1, 1];
	wallBot.move(1);
	wallBot.dir = [1, 0];
	
	for (j = 0; j < 3; j++) {
		// move up.down the current row
		for (var i = 0; i < map.height / 2 - 1; i++) {
			wallBot.down();
			wallBot.move(1);
			wallBot.up();
			wallBot.move(1);
		}
		
		// move over and offset by a tile
		wallBot.up();
		var old_dir = wallBot.dir[0];
		wallBot.dir = [0,2];
		wallBot.move(1);
		wallBot.dir = [old_dir * -1, 0];
		wallBot.move(1);
	}

	// columns on the right of the map
	wallBot = new WallBot(map);
	wallBot.dir = [0,1];
	wallBot.move(24);

	wallBot.dir = [1, 0];
	
	for (j = 0; j < 3; j++) {
		// move up.down the current row
		for (var i = 0; i < map.height / 2 - 1; i++) {
			wallBot.down();
			wallBot.move(1);
			wallBot.up();
			wallBot.move(1);
		}
		
		// move over and offset by a tile
		wallBot.up();
		var old_dir = wallBot.dir[0];
		wallBot.dir = [0,2];
		wallBot.move(1);
		wallBot.dir = [old_dir * -1, 0];
		wallBot.move(1);
	}

	
	return map;
}

function newGameController() {
	var map = newMap();
	
	var controller = new Controller(map);
	
	return controller;
}

Rouge.initGame(newGameController());