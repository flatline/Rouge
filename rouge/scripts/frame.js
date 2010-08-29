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
 * 
 * @attrs {Object} - A list of properties to initialize the frame, incl. top, 
 *		left, height, width, and draw function override.
 */
var Frame = function(attrs) {
	if (!attrs) attrs = {};

	this.top = attrs.top ? attrs.top : 0;
	this.left = attrs.left ? attrs.left : 0;
	this.height = attrs.height ? attrs.height : 0;
	this.width = attrs.width ? attrs.width : 0;
	
	this.draw = attrs.draw ? attrs.draw : function(ctx) {
		this.fill(ctx, "#000");
	}
	
	this.fill = function(ctx, color) {
		ctx.fillStyle = color;
		ctx.fillRect(this.left, this.top, this.width, this.height);
	}
	
	this.border = function(ctx, color, thickness) {
		ctx.fillStyle = color;
		this.fill(ctx, color);
		ctx.clearRect(this.left + thickness, this.top + thickness, 
					  this.width - thickness * 2, this.height - thickness * 2);
	}
  
	this.above = function(below) {
		var self = this;
		below.top = self.top + self.height;
		below.left = self.left;

		var res = new Frame();
		res.height = self.height + below.height;
		res.width = self.width > below.width ? self.width : below.width;
		res.top = self.top;
		res.left = self.left;
		res.draw = function(ctx) {
			self.draw(ctx);
			below.draw(ctx);
		}
		return res;
	}
  
	this.beside = function(right) {
		var self = this;
		right.top = self.top;
		right.left = self.left + self.width;

		var res = new Frame();
		res.width = self.width + right.width;
		res.height = self.height > right.height ? self.height : right.height;
		res.top = self.top;
		res.left = self.left;
		res.draw = function(ctx) {
			self.draw(ctx);
			right.draw(ctx);
		}
		return res;
	}
}