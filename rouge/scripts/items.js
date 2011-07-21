function Item() {
	this.typeName = "Item";
}

Item.prototype.copySpec = function(spec) {
	for (var i in spec) {
		this[i] = spec[i];
	}
}

function Weapon() {
	this.type = "Weapon";
	this.itemType = "weapon";
	this.id = world.getID();
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
		"name" : "orange shroom",
		"repr" : "food:2,0",
		"weight" : .1
	},
	"shroom_red" : {
		"name" : "red shroom",
		"repr" : "food:2,1",
		"weight" : .1
	},
	"shroom_green" : {
		"name" : "green shroom",
		"repr" : "food:2,2",
		"weight" : .1
	},
	"shroom_blue" : {
		"name" : "blue shroom",
		"repr" : "food:2,3",
		"weight" : .1
	},
	"shroom_brown" : {
		"name" : "brown shroom",
		"repr" : "food:2,4",
		"weight" : .1
	}
};

var WeaponsTable = {
	"shortsword" : {
		"name" : "shortsword",
		"skill" : "sword",
		"repr" : "weapons:1,0",
		"dmg" : 6,
		"weight" : 2
	},
	"longsword" : {
		"name" : "longsword",
		"skill" : "longsword",
		"repr" : "weapons:1,2",
		"dmg" : 8,
		"weight" : 3
	},
	"broadsword" : {
		"name" : "broadsword",
		"skill" : "longsword",
		"repr" : "weapons:1,3",
		"dmg" : 7,
		"weight" : 2.5
	},
	"greatsword" : {
		"name" : "greatsword",
		"skill" : "greatsword",
		"repr" : "weapons:1,6",
		"dmg" : 12,
		"weight" : 6,
		"two_handed" : true
	}
};