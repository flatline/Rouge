function NPC(spec) {
	this.typeName = "NPC";
	this.name = "NPC";
	this.type = "NPC";
	this.HD = 2;
	this.hitPoints = Math.round(this.HD * Math.random() * 6) + 1
	this.currentStrategy = new WanderStrategy(this); //start state
	this.currentStrategyName = typeof this.currentStrategy;
}
	
NPC.prototype = new Character();

NPC.prototype.setCurrentStrategy = function(strategy, name) {
	this.currentStrategy = strategy;
	this.currentStrategyName = name;
};

NPC.prototype.getNextAction = function(ctrl) {
	//scan area for player
	var map = ctrl.map;
	var dist = map.distance(map.player.loc, this.loc);
	var sName = this.currentStrategyName;
	
	//update currentStrategy based on percepts
	//TODO: build a better model for state transitions and strategy 
	//selection.
	if (dist <= 7 && dist > 1) {
		if (sName !== "FollowStrategy") 
			this.setCurrentStrategy(new FollowStrategy(this, map.player), 
									"FollowStrategy");			
	} else if (dist <= 1) {
		if (sName !== "CombatStrategy") 
			this.setCurrentStrategy(new CombatStrategy(this, map.player), 
									"CombatStrategy");
	} else {
		if (sName !== "WanderStrategy")
			this.setCurrentStrategy(new WanderStrategy(this), 
									"WanderStrategy");
	}
	
	return this.currentStrategy.getNextAction(ctrl, this);
};

function WanderStrategy(actor) {
	var self = this;
	this.typeName = "WanderStrategy";
	this.actor = actor;
	
	this.getNextAction = function(ctrl) {
			//random walk		
		var dir = directions[Math.floor(Math.random() * 8)];
		var vec = dirVectors[dir];		
	
		if (self.actor.loc) {			
			return new Action(
						function() { self.move(ctrl.map, vec); }, 
				Math.round(500 * Math.sqrt(dir.length) + Math.random() * 100)
			);
			} else {
				return null;
			}
	}
	
	this.move = function(map, vec) {
		map.move(self.actor, self.actor.loc.row + vec[0], 
				 self.actor.loc.col + vec[1]);
	};
}

function FollowStrategy(actor, target) {
	var self = this;
	this.typeName = "FollowStrategy";
	this.actor = actor;
	this.target = target;
	
	this.getNextAction = function(ctrl) {
		var actor = self.actor;
		var target = self.target;
		//move generally towards the player, favoring diagonal movement.
		var hDiff = target.loc.col - actor.loc.col;
			var vDiff = target.loc.row - actor.loc.row;
		
		var hMove, vMove;
		if (hDiff > 0)		hMove = "e";
		else if (hDiff < 0)	hMove = "w";
		else				hMove = "";		
		
		if (vDiff > 0)		vMove = "s";
		else if (vDiff < 0)	vMove = "n";
		else				vMove = "";
		
		var dir = vMove + hMove
		var vec = dirVectors[dir];
		
		return new Action( 
			function() { self.move(ctrl.map, vec); }, 
			Math.round(500 * Math.sqrt(dir.length) + Math.random() * 100)
		);
	}
	
	this.move = function(map, vec) {
		map.move(self.actor, self.actor.loc.row + vec[0], 
				 self.actor.loc.col + vec[1]);
	};
}

function CombatStrategy(actor, target) {
	var self = this;
	this.typeName = "CombatStrategy";
	this.actor = actor;
	this.target = target;
	
	this.getNextAction = function(ctrl) {
		//just perform a basic attack for now.
		return new Action(function() {
			self.actor.attack(self.target, ctrl.map);
		}, 
		500);
	}
}