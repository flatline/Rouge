var directions = ["n", "s", "e", "w", "ne", "se", "nw", "sw"];
var dirVectors = { "n" : [-1,0], "s" : [1,0], "e" : [0,1], "w" : [0,-1], 
				   "ne" : [-1,1], "se" : [1,1], "nw" : [-1,-1], "sw" : [1,-1] };

function Action(fn, delay) {	
	this.execute = fn;
	this.delay = delay;				
}

/**
 * Base prototype for Actors, which is extended by the Character and then NPC
 * and Player objects.  The basic requirement for an actor is that it have an
 * act and getNextAction function, for use by the controller to keep the actor
 * in the queue.
 */
function Actor() {
	this.loc = null;
	this.active = true;	
	this.type = "Actor";
}

Actor.prototype.getNextAction = function(controller) {
	//random move if this function is not overridden
	var dir = directions[Math.floor(Math.random() * 8)];
	var vec = dirVectors[dir];		
	
	if (this.loc) {			
		return new Action( 
			function() { this.move(controller.map, vec); }, 
			Math.round(500 * Math.sqrt(dir.length) + Math.random() * 100)
		);
	} else {
		return null;
	}
};

Actor.prototype.act = function(controller) {
	if (!this.active) return;
	var action = this.getNextAction(controller);
	if (action !== null) action.execute();
	var me = this;
	controller.schedule(me, action.delay);		
};

Actor.prototype.move = function(map, vec) {
	map.move(this, this.loc.row + vec[0], this.loc.col + vec[1]);
};

Actor.prototype.tryToPass = function() { return false; };

/**
 * A character can do more than just the basic actor; currently move, attack,
 * and die.
 */
function Character() {	
	this.type = "Character";
	this.name = "Character";	
	this.hitPoints = Math.random() * 12;
	this.accuracy = 5;
	this.dodge = 1;

	// default hand-to-hand damage
	this.dmg = 4;
	this.dmgResist = 1;	

	this.weapon = null;

	// character inventory
	this.items = new Container();
}

Character.prototype = new Actor();

Character.prototype.attack = function(target, map) {
	//TODO: follow an attack strategy instead						
	if (typeof(target) === "undefined" || 
		typeof(target.loc) === "undefined" || 
		target.loc === null || 
		!target.active) 
	{
		map.addMessage(this.name + " swings wildly at the air");
		return;
	}
	
	//hack for melee combat - make sure target is still in range.
	if (map.distance(this.loc, target.loc) <= 1) {
		var hit = 
			this.accuracy * Math.random() - 
			target.dodge * Math.random();						
		
		if (hit > 0) {
			var dmg = Math.round(
				this.dmg * Math.random() + 1 -
					target.dmgResist * Math.random() + 1);
			map.addMessage(this.name + " hit " + target.name + 
						   " for " + dmg + " points of damage");
			if (dmg >= 0) target.hitPoints -= dmg;
			else map.addMessage(this.name + " lands a weak blow");
			if (target.hitPoints <= 0) { 
				target.die(map);					
			}
		} else {
			map.addMessage(this.name + " swings and misses");
		}
	} else {
		map.addMessage(this.name + " swings at thin air");
	}
};

Character.prototype.die = function(map) {
	this.active = false;
	map.addMessage(this.name + " has died");
	map.yank(this);		
};

/**
 * Pick up the topmost item on the stack, if any
 */
Character.prototype.pickup = function(map) {
	for (var i = this.loc.length - 1; i > 0; i--) {
	 	var item = this.loc[i];
	 	if ("itemCategory" in item) {
			this.items.addItem(map.yank(item));
	 		map.addMessage(this.name + " picked up " + item.descr);
	 		return item;
	 	}
	}
};

/**
 * Drops the item at items[itemIdx] onto the character's location on the map
 * @param container - the container to drop from; if not specified, assumes {this}.
 */
Character.prototype.drop = function(container, itemIdx, map) {
	var items = container ? container : this.items;
	var loc = this.loc;
	if (items.length > 0 && itemIdx < items.length) {
		var item = items.removeItem(itemIdx);
		map.poke(item, loc.row, loc.col);
		map.addMessage(this.name + " dropped " + item.descr);
	}
};
