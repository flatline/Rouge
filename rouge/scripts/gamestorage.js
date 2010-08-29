/**
 * Currently uses localStorage to manage saved games.
 */
var gameStorage = new function GameStorage() {
	
	this.saveGame = function(gameId, ctrl) {
		var p = new Pickler();
		localStorage.setItem("rouge.game." + gameId, p.pickle(ctrl));		 
	}
	
	this.loadGame = function(gameId) {
		var saved = localStorage.getItem("rouge.game." + gameId);
		if (typeof(saved) !== "undefined" && saved != null) {
			var p = new Pickler();
			return p.unpickle(saved);
		}
	}
	
	this.listGames = function() {
		var list = [];
		for (var i = 0; i < localStorage.length; i++) {
			var key = localStorage.key(i);
			var rx = /^rouge\.game\.(.*)/;
			if (rx.test(key)) list.push(rx.exec(key)[1]);
		}
		return list;
	}
}