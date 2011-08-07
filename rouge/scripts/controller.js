/**
 * A naive priority queue implementation
 * @constructor
 */
function PriorityQueue() {
	var self = this;
	this.typeName = "PriorityQueue";
	this._list = [];
	this.enqueue = function (obj, delay) {
		var node = {time: delay + (new Date()).getTime(), value : obj };
		var i = self._list.length - 1;		
		while (i >= 0 && node.time < self._list[i].time) {
			i--;				
		}
		self._list.splice(i + 1, 0, node);
	};
	
	this.dequeue = function () {
		return self._list.shift().value;			
	};
	
	this.head = function () {
		return self._list[0];
	};

	this.addTime = function(delta) {
		for(var i = 0; i < self._list.length; i++) {
			self._list[i].time += delta;
		}
	}
}

/**
 * @constructor
 * 
 */
function Controller(map) {
	var self = this;
	this.typeName = "Controller";
	this._queue = new PriorityQueue();
	this._handle = null;
	this._lastStoppedTime = (new Date).getTime();
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
			//update the timestamps to reflect the current clock time
			self._queue.addTime((new Date).getTime() - self._lastStoppedTime);
			state = "running";
			self._tick();
		}
	}; 
	
	this.stop = function() {
		state = "stopped";
		//ensure that the queue state can be restored later to match time change
		self._lastStoppedTime = (new Date).getTime();
	};
	
	this._tick = function() {
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
		
		self.raiseEvent("tick");
		
		if (state === "running") {			
			self._handle = setTimeout(self._tick, self.interval);
		}				
	};
	
	this.saveGame = function() {
        self.stop();
        self.map.player.clearActions();
        if (!self.hasOwnProperty("gameId")) 
			self.gameId = parseInt(Math.random() * 10000);
        gameStorage.saveGame(self.gameId, self);        
        self.start();
	}
}