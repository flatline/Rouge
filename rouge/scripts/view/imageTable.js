/**
 * Loads and prepares the images specified in sourceList.  This is currently a hard-coded list of 
 * images, all presumed to have a .png file extension.
 *
 * Usage: 
 *  - call init() on the instance of the ImageTable, and respond to the "ready" event.
 *  - reference an image as a canvas element via [filename]:[row],[col], 0-indexed.  
 *    for example: 
 *      "dungeon:0,0" for the top-left image in dungeon.png, 
 *      "misc:2,1" for the second image in the third row of misc.png
 */
function ImageTable() {
	var self = this;

	//wait to preload all images, then populate this as a hashtable	
	self.sourceList = [
		"classm",
		"dungeon",
		"edging1",
		"edging2",
		"edging3",
		"food",
		"grounds",
		"humans",
		"jewels",
		"misc",
		"monster1",
		"monster2",
		"monster3",
		"monster4",
		"monster5",
		"monster6",
		"people",
		"weapons"
	];

	// temporary storage for the source images once loaded
	self.imgList = [];
	self.ready = false;
	self.loaded = 0;

	self.make_sprites = function() {
		// split each image into 32x32 sprites and add draw each one individually
		// then add to the final table
		
		for (var i = 0; i < self.imgList.length; i++) {
			var image = self.imgList[i];
			for (var row = 0; row < image.height; row += vc.tileHeight) {
				for (var col = 0; col < image.width; col += vc.tileWidth) {
					// todo - can we keep each canvas by itself in the list, or do we need to 
					// copy to an image via the src?  Is the extra image data actually truncated?
					var canvas = document.createElement("canvas");
					canvas.height = vc.tileHeight;
					canvas.width = vc.tileWidth;
					var ctx = canvas.getContext("2d");
					
					//var sprite = new Image();
					var key = self.sourceList[i] + ":" + (row/vc.tileHeight).toString() + "," + 
						(col/vc.tileWidth).toString();
					ctx.drawImage(image, - col, - row);
					//sprite.src = canvas.toDataUrl("image/png");
					self[key] = canvas; // sprite;
				}
			}
		}
		
		self.raiseEvent("ready", this);
		self.imgList = null;
	}
	
	self.init = function() {
		var loadHandler = function() {
			if (++self.loaded >= self.sourceList.length) {
				self.raiseEvent("imagesLoaded", self);
			}
		};
		
		self.addEventHandler("imagesLoaded", self.make_sprites);
		
		for (var i = 0; i < self.sourceList.length; i++) {
			var img = new Image();
			img.onload = loadHandler;
			img.src = "images/" + self.sourceList[i] + ".png";
			self.imgList[i] = img;
		}
	}
};
	