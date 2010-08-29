function Player() {
   	var self = this;
   	this.typeName = "Player";
   	this.repr = "player1";
   	this.action = null;
   	this.type = "Player";
   	this.name = "Player";
   	this.id = world.getID();
   	this.hitPoints = 18;
   	this.timeout = 0; // the delay from the last action plus the time at which the action was started
	
   	//if the player has issued two commands, don't accept any more until one has executed.
   	this.queuedAction = null;
	
   	this.locked = false;
	
   	/**
   	* Handles setting the action from the view; will schedule the action automatically
   	* and handle queueing.
   	*/
   	this.setAction = function(action, controller) {
  		    try {			
         			var schedule = false;
         			if (typeof(self.action) === "undefined" || self.action === null) {
            				self.action = action;
            				schedule = true;
         			} else if (typeof(self.queuedAction) === "undefined" || self.queuedAction === null) {
            				self.queuedAction = action;
         			} //else ignore
    							
 	    		    //this.act() will continue scheduling until the queued action and
         			//"current" action are complete.						
         			if (schedule) {
        				    var delay = self.timeout - (new Date()).getTime();		
            				controller.schedule(self, delay);
         			}
      		} catch (e) {
 			        debug("Player.setAction error: " + e);
  		    }
   	};
	
   	this.act = function(controller) {
  		    //rely on the view to set the action based on user input
  		    if (typeof(self.action) === "undefined" || self.action === null) 
  		        return;

 			    try {
    				    self.action.execute();
    				    self.timeout = (new Date()).getTime() + self.action.delay;
				
    				    //handle queued action
    				    if (typeof(self.queuedAction) !== "undefined" && self.queuedAction !== null) {
   					        controller.schedule(self, self.action.delay);
    				    }
				
    				    self.action = self.queuedAction;
    				    self.queuedAction = null;		
 			    } catch (e) {
    				    debug("Player.act error: " + e);
 			    }
	   };
	   
	   this.clearActions = function() {
	       self.action = null;
	       self.queuedAction = null;
	   }
}
Player.prototype = new Character();

//TODO:  cached commands are often stale, e.g. a stale attack command that should have been converted to a move
//should use builder pattern and delay to store the command code and generate the command when it's used.
function makePlayerMoveCommand (dir) {	
   	return function(map, actor) {
  		    //attack or move to the square?
      		var vec = dirVectors[dir];
      		var cell = map.peek(actor.loc.row + vec[0], actor.loc.col + vec[1]);
      		if (!cell) return null;
      		var npcIdx = -1;
      		for (var i = 0; i < cell.length; i++) {
     			    if (typeof(cell[i].type) !== "undefined" && cell[i].type === "NPC")  {
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
     			    500);
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

var playerCommands = {
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
	   "k105" : makePlayerMoveCommand("ne")
};