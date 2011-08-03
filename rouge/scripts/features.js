// temporary holding place for landscape features

function Wall() {
	this.typeName = "Wall";
	this.repr = "dungeon:0,0";
	this.descr = "a stone wall";
	this.static = true;
	this.opaque = true;
}

Wall.prototype.tryToPass = function() { return false; };