/**
 * A naive priority queue implementation
 * @constructor
 */
function PriorityQueue() {
	this.typeName = "PriorityQueue";
	this._list = [];
}

PriorityQueue.prototype.enqueue = function (obj, delay) {
	var node = {time: delay + (new Date()).getTime(), value : obj };
	var i = this._list.length - 1;		
	while (i >= 0 && node.time < this._list[i].time) {
		i--;				
	}
	this._list.splice(i + 1, 0, node);
};
	
PriorityQueue.prototype.dequeue = function () {
	return this._list.shift().value;			
};

PriorityQueue.prototype.head = function () {
	return this._list[0];
};

PriorityQueue.prototype.addTime = function(delta) {
	for(var i = 0; i < this._list.length; i++) {
		this._list[i].time += delta;
	}
};


/**
 * @constructor
 * 
 */
function Controller(map) {
	this.typeName = "Controller";
	this._queue = new PriorityQueue();
	this._handle = null;
	this._lastStoppedTime = (new Date).getTime();
	this.interval = 0; //delay on timer in ms		
	this.map = map;
	
	this.state = "stopped";	
}

Controller.prototype.schedule = function(actor, delay) {
	this._queue.enqueue(actor, delay);
};
	
/**
 * @returns state - one of "stopped", "running"
 */
Controller.prototype.getState = function() {
	return this.state;
};

Controller.prototype.start = function() {
	if (this.state != "running") {
		//update the timestamps to reflect the current clock time
		this._queue.addTime((new Date).getTime() - this._lastStoppedTime);
		this.state = "running";
		this._tick();
	}
}; 

Controller.prototype.stop = function() {
	this.state = "stopped";
	//ensure that the queue state can be restored later to match time change
	this._lastStoppedTime = (new Date).getTime();
};

Controller.prototype._tick = function() {
	var actors = [];
	var done = false;
	var d = new Date();
	var head = this._queue.head();
	while (head && head.time <= d.getTime()) {			
		actors.push(this._queue.dequeue());
		head = this._queue.head(); 
	}
	var len = actors.length;
	for (var i = 0; i < len; i++) {
		var actor = actors[i];
		if (actor.active) actor.act(this); //in case of e.g. death
	}
	
	this.raiseEvent("tick");
	
	if (this.state === "running") {			
		this._handle = setTimeout(bind(this, this._tick), this.interval);
	}				
};

Controller.prototype.saveGame = function() {
    this.stop();
    this.map.player.clearActions();
    if (!this.hasOwnProperty("gameId")) 
		this.gameId = parseInt(Math.random() * 10000);
    gameStorage.saveGame(this.gameId, this);        
    this.start();
};
