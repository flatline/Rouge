/**
 * @constructor
 * 
 */
function Controller(map) {
	var self = this;
	this.typeName = "Controller";
	this._queue = new PriorityQueue();
	this._handle = null;
	this.interval = 0; //delay on timer in ms		
	this.map = map;
	
	var state = "stopped";	
	
	/************************************
	  Scheduler code
	************************************/
	this.schedule = function(actor, delay) {
		self._queue.enqueue(actor, delay);
	};
	
	/**
	 * @returns state - one of "stopped", "running"
	 */
	this.getState = function() {
		return state;
	};
	
	this.start = function() {
		if (state != "running") {
			state = "running";
			self._tick();
		}
	}; 
	
	this.stop = function() {
		state = "stopped";
	};
	
	this._tick = function() {
		try {
			var actors = [];
			var done = false;
			var d = new Date();
			var head = self._queue.head();
			while (head && head.time <= d.getTime()) {			
				actors.push(self._queue.dequeue());
				head = self._queue.head(); 
			}
			var len = actors.length;
			for (var i = 0; i < len; i++) {
				var actor = actors[i];
				if (actor.active) actor.act(self); //in case of e.g. death
			}
		} catch (e) {
			debug(e);
		}
		
		self.raiseEvent("tick");
		
		if (state === "running") {			
			self._handle = setTimeout(self._tick, self.interval);
		}				
	};
	
	/* Command handling */
	
	/**
	 * Sets the player's action based on an ActionBuilder 
	 * (from player.js/playerCommands). Was formerly in the view object.
	 */
	this.setPlayerCommand = function(actionBuilder) {	   
		if (typeof(actionBuilder) !== "undefined") {
			//TODO: aren't some of these parameters now redundant after 
			//moving the body of this code into player.setAction?
    		self.map.player.setAction(
				actionBuilder(self.map, self.map.player), self);
	    }
	}
	
	this.saveGame = function() {
        self.stop();
        self.map.player.clearActions();
        if (!self.hasOwnProperty("gameId")) 
			self.gameId = parseInt(Math.random() * 10000);
        gameStorage.saveGame(self.gameId, self);        
        self.start();
	}
}