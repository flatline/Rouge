var directions = ["n", "s", "e", "w", "ne", "se", "nw", "sw"];
var dirVectors = { "n" : [-1,0], "s" : [1,0], "e" : [0,1], "w" : [0,-1], 
				   "ne" : [-1,1], "se" : [1,1], "nw" : [-1,-1], "sw" : [1,-1] };

function Action(fn, delay) {	
	this.execute = fn;
	this.delay = delay;				
}

function Actor() {
	var self = this;
	this.loc = null;
	this.active = true;	
	this.type = "Actor";
	
	this.getNextAction = function(scheduler) {
		//random move if this function is not overridden
		var dir = directions[Math.floor(Math.random() * 8)];
		var vec = dirVectors[dir];		
		
		if (self.loc) {			
			return new Action( 
				function() { self.move(scheduler.map, vec); }, 
				Math.round(500 * Math.sqrt(dir.length) + Math.random() * 100)
			);
		} else {
			return null;
		}
	};
	
	this.act = function(scheduler) {
		if (!this.active) return;
		var action = this.getNextAction(scheduler);
		if (action !== null) action.execute();
		var me = this;
		scheduler.schedule(me, action.delay);		
	};
	
	this.move = function(map, vec) {
		map.move(this, this.loc.row + vec[0], this.loc.col + vec[1]);
	};
	
	this.tryToPass = function() { return false; };
}

function Character() {
	
	this.type = "Character";
	this.name = "Character";	
	this.hitPoints = Math.random() * 12;
	this.accuracy = 5;
	this.dodge = 1;
	this.dmg = 4;
	this.dmgResist = 1;
	
	this.attack = function(target, map) {
		//TODO: follow an attack strategy instead						
		if (typeof(target) === "undefined" || 
			typeof(target.loc) === "undefined" || 
			target.loc === null || 
			!target.active) 
		{
			map.messages.push(this.name + " swings wildly at the air");
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
				map.messages.push(this.name + " hit " + target.name + 
								  " for " + dmg + " points of damage");
				if (dmg >= 0) target.hitPoints -= dmg;
				else map.messages.push(this.name + " lands a weak blow");
				if (target.hitPoints <= 0) { 
					target.die(map);					
				}
			} else {
				map.messages.push(this.name + " swings and misses");
			}
		} else {
			map.messages.push(this.name + " swings at thin air");
		}
	};
	
	this.die = function(map) {
		this.active = false;
		map.messages.push(this.name + " has died");
		map.yank(this);		
	};
}
Character.prototype = new Actor();
