function Item() {
	this.typeName = "Item";
}

Item.prototype.copySpec = function(spec) {
	for (var i in spec) {
		this[i] = spec[i];
	}
}

function Weapon() {
	this.typeName = "Weapon";
	this.itemType = "weapon";
}
Weapon.prototype = new Item();

Weapon.prototype.dmg = function() {
	return Math.round(Math.random() * this.spec.dmg + 1);
};

var WeaponBuilder = new function weaponBuilder() {
	this.build = function(key) {
		var result = new Weapon();
		result.id = world.getID();
		result.copySpec(WeaponsTable[key]);
		return result;
	};
}

var FoodBuilder = new function foodBuilder(key) {
	this.build = function(key) {
		var result = new Item();
		result.itemType = "food";
		result.id = world.getID();
		result.copySpec(FoodTable[key]);
		return result;
	}
}

var FoodTable = {
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