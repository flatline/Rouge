function GameFrame(view, backgroundImage) {
	this.view = view;
	this.timings = [];
	this.lastFrameDrawn = 0;
	this.controller = view.controller;
	this.map = this.controller.map;
	this.player = this.map.player;
	this.imageTable = view.imageTable;
	this.backgroundImage = backgroundImage;
	this.fov = null;
}

GameFrame.prototype = new Frame();

GameFrame.prototype.prerenderBackground = function() {
	window.setTimeout(bind(
		this, 
		function() {
			var map = this.map;
			var ctx = this.backgroundImage.getContext('2d');
			for (var i = 0; i < map.height; i++) {
				var row = map.peek(i);
				for (var j = 0; j < map.width; j++) {
					var cell = row[j];
					var ground = cell[0];
					var statics = cell.filter(function (item) { 
						return "static" in item && 
							item["static"] === true 
					});
					for (var k = 0; k < statics.length; k++) {
						this._drawSprite(statics[k], ctx);
					}
				}
			}
			this.raiseEvent("prerenderComplete");
		}), 0);
};

GameFrame.prototype.draw = function(ctx) {
	var xOffset = this.playerXOffset();
	var yOffset = this.playerYOffset();

	ctx.drawImage(this.backgroundImage, xOffset, yOffset);

	var map = this.map;

	// hack - draw over the already-rendered squares with solid black.  Consider only 
	// rendering landscape features, perhaps those already discovered, with partial alpha
	// transparency.
	this.fov = new FieldOfView(map, 
							   this.height / vc.tileHeight,
							   this.width / vc.tileWidth);
	var fov = this.fov;
	var hidden_tiles = fov.get_hidden_tiles(this.player.loc);

	// draw sprite for each indexed entity
	// todo: restrict to entities in viewport?
	for (var i in map.index) {
		if (map.index.hasOwnProperty(i)) {
			var item = map.index[i];
			if ("loc" in item &&
				item["static"] !== true &&
				!fov.is_tile_hidden(item.loc))
			{
				this._drawRelativeToPlayer(item, ctx);
			}
		}
	}

	for (var i = 0; i < hidden_tiles.length; i++) {
		var loc = hidden_tiles[i];
		var drawX = loc.col * vc.tileWidth + xOffset;
		var drawY = loc.row * vc.tileHeight + yOffset;
		ctx.fillStyle = "rgba(0,0,0, .5)";
		ctx.fillRect (drawX, drawY, 32, 32);
	}

	this._showFPS(ctx);
};

/**
 * Calculates the player's X Offset from left edge of map in pixels
 */
GameFrame.prototype.playerXOffset = function() {
	return this.left - (this.player.loc.col * vc.tileWidth) + 
		(this.width / 2) - vc.tileWidth/2;
};

/**
 * Calculates the player's Y Offset from left edge of map in pixels
 */
GameFrame.prototype.playerYOffset = function() {
	return this.top - (this.player.loc.row * vc.tileHeight) + 
		(this.height / 2) - vc.tileHeight/2;
};

GameFrame.prototype._drawSprite = function(sprite, ctx) {
	var loc = sprite.loc;
	var drawX = loc.col * vc.tileWidth;
	var drawY = loc.row * vc.tileHeight;
	if (sprite.repr in this.imageTable) {
		var img = this.imageTable[sprite.repr];
		ctx.drawImage(img, drawX, drawY);
	} else {
		ctx.fillText(sprite.repr, drawX, drawY);
	}
};

GameFrame.prototype._drawRelativeToPlayer = function(sprite, ctx) {
	var loc = sprite.loc;
	var drawX = loc.col * vc.tileWidth + this.playerXOffset();
	var drawY = loc.row * vc.tileHeight + this.playerYOffset();
	var imageTable = this.imageTable;
	if (sprite.repr in imageTable) {
		var img = imageTable[sprite.repr];
		ctx.drawImage(img, drawX, drawY);
	} else {
		ctx.fillText(sprite.repr, drawX, drawY);
	}	 
};

GameFrame.prototype._showFPS = function(ctx) {
	var elapsed = (new Date()).getTime() - this.lastFrameDrawn;
	var timings = this.timings;
	timings.push(elapsed);
	if (timings.length > 20) timings.shift();
	var avg = timings.fold(function(i, acc) { 
		return i + acc; 
	}, 0) / timings.length;
	ctx.fillStyle = "rgba(255,0,0,.5)";
	ctx.fillText(Math.floor(1000 / avg) + "fps", 1,10);		   
	this.lastFrameDrawn = (new Date()).getTime();		
};

/**
 * Callback procedure for look command
 */
GameFrame.prototype._lookAtTarget = function(loc) {
	if (this.fov.is_tile_hidden(loc)) {
		this.map.addMessage("You see only darkness");
		return;
	}

	var message = "You see: ";
	var anythingThere = false;
	for (var i = 0; i < loc.length; i++) {
		var thing = loc[i];
		if ("hidden" in thing && thing.hidden) {
			continue;
		}
		else if ("descr" in thing) {
			anythingThere = true;
			message += thing.descr;
			if ("qty" in thing && thing.qty > 1)
				message += "(" + thing.qty + ")";
		}
		else if ("name" in thing) {
			anythingThere = true;
			message += thing.name;
		}
		else {
			continue;
		}

		if (i < loc.length - 1)
			message += ", ";
	}

	if (anythingThere) {
		this.map.addMessage(message);
	} 
	else {
		this.map.addMessage("You don't see anything");
	}
}

GameFrame.prototype.commandHandler = function (evt) {
	// if the game is paused, don't accept anything other than the unpause command
	var controller = this.controller;
	var view = this.view;
	if (controller.getState() == "stopped" && evt.keyCode != 32)
		return false;

	//debug(evt.keyCode);
	switch (evt.keyCode) {
		//	case 59: //: - focus on input
		//	case 27: //esc
		//	case 13: //enter
	case 32: 
		//space
		if (controller.getState() == "stopped") 
			controller.start();
		else
			controller.stop();

		// todo: render paused message
		return false;
	case 73:
		// i - inventory
		controller.stop();
		view.showInventory(this.player.items);
		return false;
		// inventoryFrame responsible for returning focus
	case 83: 
		// s - save game
		controller.saveGame();
		alert("Game " + controller.gameId + " saved.");
		return false;
	case 76:
		// l - look
		view.showTargeting(bind(this, this._lookAtTarget));
		// todo: print loc;
		return false;
	default:
		// an actual action to be taken, not specific to the view
		var key = "k" + evt.keyCode.toString();
		if (key in playerCommands) {
			controller.setPlayerCommand(playerCommands[key]);
			return false;
		}
	}
};
