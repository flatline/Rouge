/**
 * Factory methods for frames that the View composes to render the scene
 */
var gameFrameBuilder = new function GameFrameBuilder() {
	this.build = function(controller, view, imageTable, backgroundImage, attrs) {
		var timings = [];
		var lastFrameDrawn = 0;
		
		var frame = new Frame(attrs);
		var map = controller.map;
		var player = map.player;
		
		frame.prerenderBackground = function() {
			window.setTimeout(function() {
				var ctx = backgroundImage.getContext('2d');
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
							frame.drawSprite(statics[k], ctx);
						}
					}
				}							
				
				frame.raiseEvent("prerenderComplete");
			}, 0);
		};
		
		frame.draw = function(ctx) {
			ctx.drawImage(backgroundImage, 
						  frame.playerXOffset(), 
						  frame.playerYOffset());

			// hack - draw over the already-rendered squares with solid black.  Consider only 
			// rendering landscape features, perhaps those already discovered, with partial alpha
			// transparency.
			var fov = new FieldOfView(map, 
									  frame.height / vc.tileHeight,
									  frame.width / vc.tileWidth);

			var hidden_tiles = fov.get_hidden_tiles(player.loc);

			// draw sprite for each indexed entity
			for (var i in map.index) {
				if (map.index.hasOwnProperty(i)) {
					var item = map.index[i];
					if ("loc" in item &&
						item["static"] !== true &&
						!fov.is_tile_hidden(item.loc))
					{
						frame.drawRelativeToPlayer(item, ctx);
					}
				}
			}

			for (var i = 0; i < hidden_tiles.length; i++) {
				var loc = hidden_tiles[i];
				var drawX = loc.col * vc.tileWidth + frame.playerXOffset();
				var drawY = loc.row * vc.tileHeight + frame.playerYOffset();
				ctx.fillStyle = "rgba(0,0,0, .5)";
				ctx.fillRect (drawX, drawY, 32, 32);
			}

			frame.showFPS(ctx);
		};				  
					  
		frame.playerXOffset = function() {
			return frame.left - (player.loc.col * vc.tileWidth) + 
				(frame.width / 2) - vc.tileWidth/2;
		};
		
		frame.playerYOffset = function() {
			return frame.top - (player.loc.row * vc.tileHeight) + 
				(frame.height / 2) - vc.tileHeight/2;
		};
			
		frame.drawSprite = function(sprite, ctx) {
			var loc = sprite.loc;
			var drawX = loc.col * vc.tileWidth;
			var drawY = loc.row * vc.tileHeight;
			if (sprite.repr in imageTable) {
				var img = imageTable[sprite.repr];
				ctx.drawImage(img, drawX, drawY);
			} else {
				ctx.fillText(sprite.repr, drawX, drawY);
			}
		};
		
		frame.drawRelativeToPlayer = function(sprite, ctx) {
			var loc = sprite.loc;
			var drawX = loc.col * vc.tileWidth + frame.playerXOffset();
			var drawY = loc.row * vc.tileHeight + frame.playerYOffset();
			if (sprite.repr in imageTable) {
				var img = imageTable[sprite.repr];
				ctx.drawImage(img, drawX, drawY);
			} else {
				ctx.fillText(sprite.repr, drawX, drawY);
			}	 
		};
	
		frame.showFPS = function(ctx) {
			var elapsed = (new Date()).getTime() - lastFrameDrawn;
			timings.push(elapsed);
			if (timings.length > 20) timings.shift();
			var avg = timings.fold(function(i, acc) { 
				return i + acc; 
			}, 0) / timings.length;
			ctx.fillStyle = "rgba(255,0,0,.5)";
			ctx.fillText(Math.floor(1000 / avg) + "fps", 1,10);		   
			lastFrameDrawn = (new Date()).getTime();		
		};

		frame.commandHandler = function (evt) {
			// if the game is paused, don't accept anything other than the unpause command
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
				view.showInventory(player);
				// inventoryFrame responsible for returning focus
			case 83: 
				// s - save game
				controller.saveGame();
				alert("Game " + controller.gameId + " saved.");
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
		
		return frame;
		//end build routine
	};
}
