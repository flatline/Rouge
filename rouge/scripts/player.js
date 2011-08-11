/**
 * The player character and associated logic for handling commands and user
 * actions.
 */
function Player() {
	this.typeName = "Player";
	this.repr = "people:2,2";
	this.actionCode = null;
	this.type = "Player";
	this.name = "Player";
	this.id = world.getID();
	this.hitPoints = 18;
	//delay from the last action plus the time at which the action was started
	this.timeout = 0; 
	
	//cache up to 2 commands, don't accept more until one has executed.
	this.queuedAction = null;
	
	this.locked = false;
}
Player.prototype = new Character();

/**
 * Handles setting the action from the view; will schedule the action 
 * automatically and handle queueing.
 * @param actionCode - "k" + the event keyCode property
 */
Player.prototype.setAction = function(actionCode, controller) {
	var schedule = false;
	if (typeof(this.actionCode) === "undefined" || this.actionCode === null) {
		this.actionCode = actionCode;
		schedule = true;
	} else if (typeof(this.queuedAction) === "undefined" || 
			   this.queuedAction === null) 
	{
		this.queuedAction = actionCode;
	} //else ignore
	
	//this.act() will continue scheduling until the queued action and
	//"current" action are complete.						
	if (schedule) {
		var delay = this.timeout - (new Date()).getTime();		
		controller.schedule(this, delay);
	}
};

/**
 * Creates and executes a new action based on the current actionCode; 
 * Swaps in queuedAction if applicable.
 */
Player.prototype.act = function(controller) {
	//rely on the view to set the action based on user input
	if (typeof(this.actionCode) === "undefined" || this.actionCode === null) 
		return;
	
	var action = playerCommands[this.actionCode].call(this, controller.map, this);
	action.execute();
	this.timeout = (new Date()).getTime() + action.delay;
	
	//handle queued action
	if (typeof(this.queuedAction) !== "undefined" && 
		this.queuedAction !== null) 
	{
		controller.schedule(this, action.delay);
	}
	
	this.actionCode = this.queuedAction;
	this.queuedAction = null;		
};

Player.prototype.clearActions = function() {
	this.actionCode = null;
	this.queuedAction = null;
};

// todo: encapsulate the command stuff somewhere...?
function makePlayerMoveCommand (dir) {	
	return function(map, actor) {
		//attack or move to the square?
		var vec = dirVectors[dir];
		var cell = map.peek(actor.loc.row + vec[0], actor.loc.col + vec[1]);
		if (!cell) return null;
		var npcIdx = -1;
		for (var i = 0; i < cell.length; i++) {
			if (typeof(cell[i].type) !== "undefined" && cell[i].type == "NPC") {
				npcIdx = i;
				break;
			}
		}		
		
		var action = null;		
		if (npcIdx > -1) {
			//return attack command
			var target = cell[npcIdx];
			action = new Action(function() {
				actor.attack(target, map);
			},
			1000);
		} else {		
			//move to the designated location
			action = new Action(function() { 
				actor.move(map, dirVectors[dir]);
			},
			//diagonal moves should be timed accordingly
			Math.round(150 * Math.sqrt(dir.length)));			
		}
		return action;
	};
}

function makePlayerPickupCommand() {
	return function(map, actor) {
		return new Action(function() { actor.pickup(map); }, 0);
	};
}

playerCommands = {
	"k37" : makePlayerMoveCommand("w"),
	"k38" : makePlayerMoveCommand("n"),
	"k39" : makePlayerMoveCommand("e"),
	"k40" : makePlayerMoveCommand("s"),
	"k97" : makePlayerMoveCommand("sw"),
	"k98" : makePlayerMoveCommand("s"),
	"k99" : makePlayerMoveCommand("se"),
	"k100" : makePlayerMoveCommand("w"),
	"k102" : makePlayerMoveCommand("e"),
	"k103" : makePlayerMoveCommand("nw"),
	"k104" : makePlayerMoveCommand("n"),
	"k105" : makePlayerMoveCommand("ne"),
	"k188" : makePlayerPickupCommand()
};

