function Item() {
	this.typeName = "Item";
	this.stackable = false;
	this.qty = 1;
	this.itemCategory = "Miscellaneous";
}

/**
 * Use the weaponBuilder object to construct
 */
function Weapon() {
	this.typeName = "Weapon";
	this.itemCategory = "Weapons";
	this.two_handed = false;
}
Weapon.prototype = new Item();

// todo: probably move to character prototype
Weapon.prototype.dmg = function() {
	return Math.round(Math.random() * this.spec.dmg + 1);
};

/**
 * Use the armorBuilder prototype to construct
 */
function Armor() {
	this.typeName = "Armor";
	this.itemCategory = "Armor";
	this.slot = "unknown";
}
Armor.prototype = new Item();

var WeaponBuilder = new function weaponBuilder() {
	this.build = function(key) {
		var result = new Weapon();
		result.id = world.getID();
		result.merge(WeaponsTable[key]);
		result.stackable = false;
		return result;
	};
}

var ArmorBuilder = new function armorBuilder(key) {
	this.build = function(key) {
		var result = new Armor();
		result.id = world.getID();
		result.merge(ArmorTable[key]);
		result.stackable = false;
		return result;
	}
}

var FoodBuilder = new function foodBuilder(key) {
	this.build = function(key) {
		var result = new Item();
		result.itemCategory = "Food";
		result.id = world.getID();
		result.merge(FoodTable[key]);
		result.stackable = true;
		return result;
	}
}

var FoodTable = {
	// all are set to be stackable in foodbuilder
	"shroom_orange" : {
		"descr" : "an orange shroom",
		"repr" : "food:2,0",
		"weight" : .1
	},
	"shroom_red" : {
		"descr" : "a red shroom",
		"repr" : "food:2,1",
		"weight" : .1
	},
	"shroom_green" : {
		"descr" : "a green shroom",
		"repr" : "food:2,2",
		"weight" : .1
	},
	"shroom_blue" : {
		"descr" : "a blue shroom",
		"repr" : "food:2,3",
		"weight" : .1
	},
	"shroom_brown" : {
		"descr" : "a brown shroom",
		"repr" : "food:2,4",
		"weight" : .1
	}
};

var WeaponsTable = {
	"shortsword" : {
		"descr" : "a shortsword",
		"skill" : "sword",
		"repr" : "weapons:1,0",
		"dmg" : 6,
		"weight" : 2
	},
	"longsword" : {
		"descr" : "a longsword",
		"skill" : "longsword",
		"repr" : "weapons:1,2",
		"dmg" : 8,
		"weight" : 3
	},
	"broadsword" : {
		"descr" : "a broadsword",
		"skill" : "longsword",
		"repr" : "weapons:1,3",
		"dmg" : 7,
		"weight" : 2.5
	},
	"greatsword" : {
		"descr" : "greatsword",
		"skill" : "greatsword",
		"repr" : "weapons:1,6",
		"dmg" : 12,
		"weight" : 6,
		"two_handed" : true
	}
};

var ArmorTable = {
	"leather_helm" : {
		descr: "a leather helm",
		repr: "armor:1,0",
		slot: "head",
		weight: 1
	},
	"leather_armor" : {
		descr: "a set of leather armor",
		repr: "armor:4,0",
		slot: "armor",
		weight: 15
	},
	"leather_boots" : {
		descr: "a pair of leather boots",
		repr: "armor:2,1",
		slot: "feet",
		weight: 2
	}
};