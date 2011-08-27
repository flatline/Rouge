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

function BodyPart(descr, size, type, children) {
	this.typeName = "BodyPart";
	this.descr = descr;
	this.size = size;
	this.type = type;
	this.condition = 100;
	// ok, missing
	this.status = "ok";
	this.children = children;
}

/**
 * A character can do more than just the basic actor; has a body structure and can wield weapons,
 * etc.
 */
function Character() {	
	this.type = "Character";
	this.name = "Character";	
	this.hitPoints = 12;
	this.maxHitPoints = 12;

	// default hand-to-hand damage
	this.dmg = 4;
	this.unarmedAttackType = "blunt";

	// character stats
	this.str = Math.random() * 15 + 4;
	this.dex = Math.random() * 15 + 4;

	// max level of ten for each
	this.skills = {
		"unarmed" : 0,
		"longsword" : 0,
		"sword" : 0,
		"hammer" : 0,
		"greatsword" : 0,
		"bow" : 0
	};

	// character inventory
	this.items = new Container();

	this.weaponSlots = {
		right_hand : null,
		left_hand : null
	}

	this.ammoSlot = null;

	// slots for e.g. armor, rings, etc.
	this.armorSlots = {
		"armor" : null,
		"head" : null,
		"hands" : null,
		"feet" : null,
		"back" : null,
		"neck" : null,
	};

	/**
	 * basic humanoid body structure
	 */
	this.body = new BodyPart("torso", 24, "torso", [
		new BodyPart("head", 4, "head", null),
		new BodyPart("right arm", 6, "arm", [
			new BodyPart("right hand", 2, "hand", [
				new BodyPart("right thumb", .1, "thumb", null),
				new BodyPart("right index finger", .1, "finger", null),
				new BodyPart("right middle finger", .1, "finger", null),
				new BodyPart("right ring finger", .1, "finger", null),
				new BodyPart("right pinky finger", .1, "finger", null)
			])
		]),
		new BodyPart("left arm", 6, "arm", [
			new BodyPart("left hand", 2, "hand", [
				new BodyPart("left thumb", .1, "thumb", null),
				new BodyPart("left index finger", .1, "finger", null),
				new BodyPart("left middle finger", .1, "finger", null),
				new BodyPart("left ring finger", .1, "finger", null),
				new BodyPart("left pinky finger", .1, "finger", null)
			])
		]),
		new BodyPart("right leg", 16, "leg", [
			new BodyPart("right foot", 3, "foot", [
				new BodyPart("right big toe", .1, "toe", null),
				new BodyPart("right second toe", .1, "toe", null),
				new BodyPart("right third toe", .1, "toe", null),
				new BodyPart("right fourth toe", .1, "toe", null),
				new BodyPart("right little toe", .1, "toe", null)
			])
		]),
		new BodyPart("left leg", 16, "leg", [
			new BodyPart("left foot", 3, "foot", [
				new BodyPart("left big toe", .1, "toe", null),
				new BodyPart("left second toe", .1, "toe", null),
				new BodyPart("left third toe", .1, "toe", null),
				new BodyPart("left fourth toe", .1, "toe", null),
				new BodyPart("left little toe", .1, "toe", null)
			])
		])
	]);

	//access through getFlattenedBody
	this._flattenedBody = null;

	// access through getBodySize
	this._bodySize = 0;
}
Character.prototype = new Actor();

Character.prototype.countBodyParts = function(root, type, filter) {
	if (typeof(filter) === "undefined") filter = function() { return true;};
	var count = 0;
	if (root.type == type) {
		// assume that there is no child object of same type
		return (root.status == "ok" && filter(root)) ? 1 : 0;
	}
	else if (root.children != null && root.children.count > 0 && root.status == "ok") {
		for (var i = 0; i < root.children.length; i++) {
			count += this.countBodyParts(root.children[i], type, filter);
		}
	}
	return count;
};

/**
 * Lazy calculation of the _flattenedBody array for easy iteration over body parts
 */
Character.prototype.getFlattenedBody = function() {
	if (!this._flattenedBody) {
		var result = [];
		var iterate = function(root) {
			result.push(root);
			if (root.children) {
				for (var i = 0; i < root.children.length; i++) {
					iterate(root.children[i]);
				}
			}
		}

		iterate(this.body);
		result.sort(function(a, b) { return b.size - a.size; });
		this._flattenedBody = result;
	}

	return this._flattenedBody;
};

/**
 * Lazy calculation of the _bodySize property
 */	
Character.prototype.getBodySize = function() {
	if (this._bodySize == 0) {
		var body = this.getFlattenedBody();
		var total = 0;
		for (var i = 0; i < body.length; i++) {
			var part = body[i].size;
			total += part;
		}
		this._bodySize = total;
	}

	return this._bodySize;
};

Character.prototype.getRandomWeightedBodyPart = function() {
	var body = this.getFlattenedBody();
	var rand = this.getBodySize() * Math.random() + 1;
	var part = body[0];

	for (var i = 0; i < body.length; i++) {
		part = body[i];
		rand -= part.size;
		if (rand <= 0)
			break;
	}
	
	return part;
};

Character.prototype.attack = function(target, map) {
	// figure out if we're attacking with our hands (this.dmg) or a weapon
	var dmg = this.dmg;
	var type = this.unarmedAttackType;
	var skill = "unarmed";
	var weapon = null;
	for (var slot in this.weaponSlots) {
		weapon = this.weaponSlots[slot];
		if (weapon) {
			dmg = weapon.dmg;
			type = weapon.attack_type;
			skill = weapon.skill;
			break;
		}
	}

	//to hit: default is 9/20 chance, plus skill level (out of max 10):
	var hitRoll = Math.random() * 20;
	var hitModifier = 8 + (skill in this.skills ? this.skills[skill] : 0);
	
	if (hitRoll < hitModifier) {

		// what did we hit?
		var part = target.getRandomWeightedBodyPart();

		// how much damage did we do overall, minus armor protection on body part?
		var armor = target.armorSlots[part.type];
		var actual_dmg = Math.round(Math.random() * dmg + 1);
		if (armor) actual_dmg -= armor[type];

		if (dmg > 0) {
			target.hitPoints -= actual_dmg;
			map.addMessage(this.name + " hits " + target.name + " in the " + part.descr + 
						   " for " + actual_dmg.toString() + " points of damage");

		}
		else {
			map.addMessage(this.name + " hits " + target.name + " in the " + part.descr + 
						   " and delivers a glancing blow");
		}

		// todo: wound?

		if (target.hitPoints <= 0) { 
			target.die(map);					
		}
	} else {
		map.addMessage(this.name + " swings and misses");
	}
}

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

Character.prototype.wearArmor = function(item) {
	if ("slot" in item && item.slot in this.armorSlots) {
		this.armorSlots[item.slot] = item;
	}
};

Character.prototype.canWieldTwoHanded = function() {
	var count = this.countBodyParts(this.body, "hand", function(hand) {
		var has_thumb = this.countBodyParts(hand, "thumb", null) > 0;
		var has_fingers = this.countBodyParts(hand, "finger", null) > 1;
		return has_thumb && has_fingers;
	});
	return count >= 2;
}

Character.prototype.canWieldOneHanded = function(descr) {
	var count = this.countBodyParts(this.body, "hand", function(hand) {
		if (hand.descr != descr) {
			return false;
		}
		else {
			var has_thumb = this.countBodyParts(hand, "thumb", null) > 0;
			var has_fingers = this.countBodyParts(hand, "finger", null) > 1;
			return has_thumb && has_fingers;
		}
	});
	
	return count = 1;
};

/**
 * Checks that the character has enough in-tact hands to wield the weapon
 * and if so, wields it.  If not, throws an error with message.
 */
Character.prototype.wieldWeapon = function(weapon) {
	if (weapon.two_handed) {
		if (this.canWieldTwoHanded) {
			this.weaponSlots.right_hand = weapon;
			this.weaponSlots.left_hand = weapon;
		} 
		else {
			throw this.name + " does not have two functioning hands.";
		}
	}
	else {
		// assume right-hand dominant
		if (this.canWieldOneHanded("right hand")) {
			this.weaponSlots.right_hand = weapon;
			// hack - to remove two-handed wield, just empty the other slot
			this.weaponSlots.left_hand = null;
		}
		else if (this.canWieldOneHanded("left hand")) {
			this.weaponSlots.left_hand = weapon;
			this.weaponSlots.right_hand = null;
		}
		else {
			throw this.name + " has no hands capable of wielding that.";
		}
	}
};
