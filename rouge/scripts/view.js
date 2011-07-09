/**
 * {@link common.js}
 * {@link main.js}
 * {@link actions.js}
 * {@link controller.js} 
 */
 
var viewConstants = {
	tileWidth: 32,
	tileHeight: 32,
	displayWidth: 608,
	displayHeight: 608
};
var vc = viewConstants;

var ImageLoader = function() {
	//wait to preload all images, then populate this as a hashtable
	//$(document).append("<p>loading images...</p>");
	var self = this;
	
	this.ready = false;
	
	this.init = function() {
		var imgList = [
			"player1", 
			"stone1", 
			"orc1", 
			"elf1", 
			"human",
			"amazon",
			"armor_leather",
			"barbarian",
			"boots_leather",
			"chest",
			"door_closed",
			"door_open",
			"grass1",
			"grass2",
			"grass3",
			"human",
			"longsword",
			"pikeman",
			"ranger",
			"shield_small",
			"spear",
			"tile_dark",
			"tile_light",
			"wall1"
		];

		var loaded = 0;
		var imgCount = imgList.length;	
		var loadHandler = function() { 
			if (++loaded >= imgCount) {
				self.ready = true;
				self.raiseEvent("ready", this);
					}	
		};
		
		for (var i = 0; i < imgCount; i++) {
			var img = new Image();
			img.onload = loadHandler;
			img.src = "images/" + imgList[i] + ".png";
			self[imgList[i]] = img;
		}
	}
}

/**
 * Factory methods for frames that the View composes to render the scene
 */

var gameFrameBuilder = new function GameFrameBuilder() {
	this.build = function(map, imageTable, backgroundImage, attrs) {
		var timings = [];
		var lastFrameDrawn = 0;
		
		var frame = new Frame(attrs);
		
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
							return item.hasOwnProperty("static") && 
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

			for (var i in map.index) {
				if (map.index.hasOwnProperty(i)) {
					var item = map.index[i];
					if (item.hasOwnProperty("loc") && 
						!item.hasOwnProperty("static") && 
						item["static"] !== true) 
					{
						frame.drawRelativeToPlayer(item, ctx);
					}
				}
			}

			var quad_width = frame.width  / (vc.tileWidth * 2);
			var quad_height = frame.height / (vc.tileHeight * 2);

			// hack - black out POV tiles after they have been drawn
			// todo - encapsulate quadrant stuff in fov package
			var q1 = map.get_region(player.loc.row, 
									player.loc.col, 
									quad_height,
									quad_width,
									false, false);
			var q2 = map.get_region(player.loc.row, 
									player.loc.col - quad_width,
									quad_height,
									quad_width,
									false, true);
			var q3 = map.get_region(player.loc.row - quad_height, 
									player.loc.col - quad_width,
									quad_height,
									quad_width,									
									true, true);
			var q4 = map.get_region(player.loc.row - quad_height, 
									player.loc.col,
									quad_height,
									quad_width,
									true, false);
									
			var hidden_tiles = map.field_of_view_hidden(q1);
			hidden_tiles.push.apply(hidden_tiles, map.field_of_view_hidden(q2));
			hidden_tiles.push.apply(hidden_tiles, map.field_of_view_hidden(q3));
			hidden_tiles.push.apply(hidden_tiles, map.field_of_view_hidden(q4));

			for (var i = 0; i < hidden_tiles.length; i++) {
				var loc = hidden_tiles[i];
				var drawX = loc.col * vc.tileWidth + frame.playerXOffset();
				var drawY = loc.row * vc.tileHeight + frame.playerYOffset();
				ctx.fillStyle = "rgb(0,0,0)";
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
			if (imageTable.hasOwnProperty(sprite.repr)) {
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
			if (imageTable.hasOwnProperty(sprite.repr)) {
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
		
		return frame;
		//end build routine
	};
}

var messageFrameBuilder = new function MessageFrameBuilder() {
	this.build = function(map, frameAttrs) {
		var msgFrame = new Frame(frameAttrs);
		
		var maxMessages = 10;
		
		msgFrame.draw = function(ctx) {
			var messages = map.messages;
			msgFrame.fill(ctx, "#000");
			var borderWidth = 3;
			msgFrame.border(ctx, "#888", borderWidth);
			ctx.fillStyle = "#000";
			
			var len = messages.length > maxMessages ? 
				maxMessages : 
				messages.length;

			//print last at bottom of the frame
			var msg;
			for (var i = len - 1; i >= 0; i--) {
				if (msg = messages[i]) {
					ctx.fillText(
						msg, 
						borderWidth + 3, 
						msgFrame.top + msgFrame.height - (len - i) * 10, 
						msgFrame.width);
				} 
			}
			//dirty, but when else to we truncate?
			if (messages.length > maxMessages) {
				map.messages = messages.slice(messages.length - maxMessages, 
											  messages.length + 1);
			}
		};
		
		return msgFrame;
	}
}

/**
 * The view class, rendered to canvas
 * @constructor
 * @param {Map} map - the map for the view
 * @param {Controller} controller - the main controller
 */
function HtmlMapView(controller) {	
	var self = this;
	
	var imageTable = null;
	var backgroundImage = null;
	var mainFrame, gameFrame, messageFrame = null;
	
	var map = controller.map;
	var display = null;
	
	this.init = function() {
		//create the main canvas and a hidden canvas for pre-rendering the background.
		var canvas = $("<canvas width='" + vc.displayWidth + "px' height='" + 
					   vc.displayHeight + "px'>Incompatible browser</canvas>");	
		display = canvas[0].getContext('2d');
		
		backgroundImage = $("<canvas style='display: none;' width='" + 
							map.width * vc.tileWidth + "' height='" + 
							map.height * vc.tileHeight + "'></canvas>")[0];
		
		$("body").append(canvas).append(backgroundImage);
		$("body").append('<div id="debug" style="width: 100%; overflow-y:' +
						 'scroll; height: 300px"><ul></ul></div>');
		
		self.initListeners();
		controller.addEventHandler("tick", self.renderMap);
		
		imageTable = new ImageLoader();
		self.initFrames();
		
		//preload images - we don't have any way to properly wait, have to 
		//go through a chain of events to eventually get to the main loop
		display.fillStyle = "rgb(0,0,0)";
		display.fillText("Loading images...", 200, 144);
		
		(new EventChain())
			.add(imageTable.init, imageTable, "ready")
			.add(self.gameFrame.prerenderBackground, self.gameFrame, 
				 "prerenderComplete")
			.execute(controller.start);		
	};	
		
	this.initListeners = function () {
		$(window).keydown(function (evt) {
			
			//debug(evt.keyCode);
			switch (evt.keyCode) {
				//	case 59: //: - focus on input
				//      this.userInput[0].focus();
				//	    return false;
				//	case 27: //esc
				//		this.userInput[0].blur();
				//		return false;
				//	case 13: //enter
				//		var txt = this.userInput.text();
				//		if (txt != "") 
				//			this.userInput.text("");
				//						
			case 83: // s - save game
				controller.saveGame();
				alert("Game " + controller.gameId + " saved.");				   
				break;
			default:
				// an actual action to be taken, not specific to the view
				controller.setPlayerCommand(
					playerCommands["k" + evt.keyCode.toString()]);
				break;				
			}
		});				
	};
	
	this.initFrames = function() {
		//compose the game frame atop the message frame for the default view
		var gameFrame = self.gameFrame = gameFrameBuilder.build(
			map,
			imageTable,
			backgroundImage, 
			{
				height: vc.displayHeight - 128,
				width: vc.displayWidth
			});
		
		var msgFrame = self.messageFrame = messageFrameBuilder.build(
			map, 
			{
				height: 128,
				width:	vc.displayWidth
			});
		
		self.mainFrame = gameFrame.above(msgFrame);	   
	}
	
	this.renderMap = function() {	 
		//wipe the canvas
		var ctx = display;
		ctx.fillStyle = "rgb(0,0,0)";
		ctx.fillRect(0,0,vc.displayWidth,vc.displayHeight);
		
		//render the current scene
		self.mainFrame.draw(ctx);
	};
	
	this.showAnimations = function () {
		
	};
}