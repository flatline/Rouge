/*
 * Displays the player's statistics in short form
 */
function StatsFrame(player) {
	this.player = player;
}
StatsFrame.prototype = new Frame();

StatsFrame.prototype.draw = function(ctx) {
	this.fill(ctx, "#000");
	ctx.strokeStyle = "#888";
	// overlap border with message frame to right
	ctx.strokeRect(this.left,
				   this.top,
				   this.width,
				   this.height - 1);

	var player = this.player;
	var xOffset = this.left + 5;
	var yOffset = this.top + 5;

	// bg health bar
	ctx.fillStyle = "#666";
	ctx.fillRect(xOffset,
				 yOffset,
				 118,
				 10);

	// active health bar
	ctx.fillStyle = "#911";
	ctx.fillRect(xOffset,
				 yOffset,
				 (player.hitPoints / player.maxHitPoints) * 118,
				 10);

	// health printout
	yOffset += 20;
	ctx.fillStyle = "#fff";
	ctx.fillText("HP: " + player.hitPoints + " / " + player.maxHitPoints,
				 xOffset,
				 yOffset,
				 this.width - 10);
};