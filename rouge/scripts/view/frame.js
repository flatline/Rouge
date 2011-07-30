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
};

Frame.prototype.draw = function(ctx) {
	this.fill(ctx, "#000");
};

Frame.prototype.fill = function(ctx, color) {
	ctx.fillStyle = color;
	ctx.fillRect(this.left, this.top, this.width, this.height);
};

Frame.prototype.border = function(ctx, color, thickness) {
	ctx.fillStyle = color;
	this.fill(ctx, color);
	ctx.clearRect(this.left + thickness, this.top + thickness, 
				  this.width - thickness * 2, this.height - thickness * 2);
}; 

Frame.prototype.above = function(below) {
	below.top = this.top + this.height;
	below.left = this.left;

	var res = new Frame();
	res.height = this.height + below.height;
	res.width = this.width > below.width ? this.width : below.width;
	res.top = this.top;
	res.left = this.left;
	res.draw = bind(
		this, 
		function(ctx) {
			this.draw(ctx);
			below.draw(ctx);
		});
	return res;
};

Frame.prototype.beside = function(right) {
	right.top = this.top;
	right.left = this.left + this.width;

	var res = new Frame();
	res.width = this.width + right.width;
	res.height = this.height > right.height ? this.height : right.height;
	res.top = this.top;
	res.left = this.left;
	res.draw = bind(
		this, 
		function(ctx) {
			this.draw(ctx);
			right.draw(ctx);
		});
	return res;
};
