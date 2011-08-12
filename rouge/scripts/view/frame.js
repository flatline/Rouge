/**
 * {@link common.js}
 * {@link main.js}
 * {@link actions.js}
 */

/**
 * A logical division of a canvas element.	The frame's internal logic is 
 * responsible for adhering to its boundaries as multiple frames may live on 
 * a single canvas and nothing prevents them from running all over each other.	
 *
 * The primary purpose of the frame is to provide partitioning of the canvas 
 * by means of the frame's top and left coordinates and to provide composition 
 * of display regions via the above and beside methods.
 */ 
function Frame() {
	this.top = this.left = this.height = this.width = 0;
}

/**
 * @attrs {Object} - A list of properties to initialize the frame, incl. top, 
 *		left, height, width
 */
Frame.prototype.init = function(attrs) {
	this.top = attrs.top ? attrs.top : 0;
	this.left = attrs.left ? attrs.left : 0;
	this.height = attrs.height ? attrs.height : 0;
	this.width = attrs.width ? attrs.width : 0;	
	this.below = null;
	this.right = null;
};

Frame.prototype.draw = function(ctx) {
	this.fill(ctx, "#000");
};

Frame.prototype.fill = function(ctx, color) {
	ctx.fillStyle = color;
	ctx.fillRect(this.left, this.top, this.width, this.height);
};

Frame.prototype.border = function(ctx, color, thickness) {
	ctx.strokeStyle = color;
	ctx.strokeRect(this.left, 
				   this.top, 
				   this.width - 1, 
				   this.height - 1);
}; 

/**
 * Recursively resets the coordinates for any child frames
 */
Frame.prototype.setTop = function(top) {
	this.top = top;
	if (this.right) this.right.setTop(top);
	if (this.below) this.below.setTop(top + this.height);
};

/**
 * Recursively resets the coordinates for any child frames
 */
Frame.prototype.setLeft = function(left) {
	this.left = left;
	if (this.right) this.right.setLeft(left + this.width);
	if (this.below) this.below.setLeft(left);
}

Frame.prototype.above = function(below) {
	var res = new Frame();
	this.below = below;
	below.setTop(this.top + this.height);
	var draw = bind(this, this.draw);
	this.draw = function(ctx) {
		draw(ctx);
		below.draw(ctx);
	}
	return this;
};

Frame.prototype.beside = function(right) {
	this.right = right;
	right.setLeft(this.width);
	var draw = bind(this, this.draw);
	this.draw = function(ctx) {
		draw(ctx);
		right.draw(ctx);
	}
	return this;
};
