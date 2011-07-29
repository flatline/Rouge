/**
 * Serialization routine for game state.  See comments on pickle and 
 * unpickle routines.  Relies on a traversal of the object graph to build
 * a JSON-formatted string that may be used to recreate the full game state,
 * including the controller, maps, player status, etc.
 */
function Pickler() {
	this.queue = [];
	this.lastId = 0;	   
}

Pickler.prototype._search = function(obj) {
	for (var i = 0; i < this.queue.length; i++) {
		if (this.queue[i].source === obj) return i;
	}
	return -1;
};

Pickler.prototype._dequeue = function() {
	// use this rather than pop so we only retrieve the next unexplored 
	// node, not remove it from the queue
	for (var i = 0; i < this.queue.length; i++) {
		if (this.queue[i].state != "explored") return this.queue[i];
	}
	return null;
};

Pickler.prototype._iterate = function(f) {
	for (var i = 0; i < this.queue.length; i++) {
		f.call(this, this.queue[i]);
	}
};	 

Pickler.prototype._isScalar = function(x) {
	var currentType = typeof(x);
	return currentType == "undefined" || currentType == "number" ||
		currentType == "string" || currentType == "boolean";
};	  

Pickler.prototype._buildWrapper = function(obj) {
	var typeName;
	if (obj instanceof Array) {
		typeName = "array";
	}
	else {
		typeName = (obj && obj.typeName ? obj.typeName : typeof(obj));
	}
	
	return { 
		"id" : ++this.lastId,
		"state" : "discovered",
		"objectType" : typeName,
		"source" : obj,
		"objectData" : {}
	};
};

Pickler.prototype._buildReference = function(targetId) {
	return {
		"typeName" : "PRef",
		"targetId" : targetId
	};
};

/*	Do a BFS on the object graph, with the object passed in as the 
	root node.	An object is wrapped in a container to which the 
	object's properties and some metadata are copied.
	
	Scalar values are copied directly from the source, object references
	are counted as new nodes.  Another container, a reference object,
	is created with a pointer to the id value of the target's container.
	
	Relies partly on game objects supplying a "typeName" property so
	they can be reconstituted later at runtime.
*/	   
Pickler.prototype.pickle = function(root) {
	var wrappedRoot = this._buildWrapper(root);
	this.queue.push(wrappedRoot);
	
	var target, source;
	
	while (current = this._dequeue()) {
		source = current.source;
		target = current.objectData;
		
		if (this._isScalar(source)) {
			// scalar types
			current.objectData = source;
		}
		else { // complex types
			for (var attr in source) {
				var idx;					
				if (this._isScalar(source[attr])) {
					target[attr] = source[attr];
				}					 
				else if (source[attr] instanceof Function) {
					// ignore - must be provided during unpickle by ctor
				}
				else if (source[attr] === null) {
					//avoid empty object reference here
					source[attr] = null;
				}
				else if ((idx = this._search(source[attr])) == -1) {
					// discovered item, add to queue
					var targetItem = this._buildWrapper(source[attr]);
					this.queue.push(targetItem);
					target[attr] = this._buildReference(targetItem.id);
				} 
				else {
					// link to item; removes cycles from the resulting tree
					target[attr] = this._buildReference(this.queue[idx].id);
				}
			}
		}
		current.state = "explored";
	}
	
	// delete source attrs then call toJSON on root wrapper
	this._iterate(function(o) { 
		delete(o.source);
		delete(o.state);
	});
	return $.toJSON(this.queue);
};

/* resolves a reference during the unpickle operation.
 * @param refID - the id value of the container in the queue
 * @return - the object the container wraps, or null if not found
 */
Pickler.prototype._resolve = function(refID) {
	for (var i = 0; i < this.queue.length; i++) {
		if (this.queue[i].id === refID) return this.queue[i].target;
	}
	return null;
};

/* Creates a new object of type typeName.  Handles
 * e.g. "object" -> "Object" for builtin types
 */
Pickler.prototype._restore = function(typeName) {
	switch (typeName) {
	case "function":
	case "object":
	case "array":
		return eval(
			"new " + 
			typeName[0].toUpperCase() + 
			typeName.slice(1, typeName.length) + 
			"()");			   
	default:
		return eval("new " + typeName + "()");
	}
};

Pickler.prototype.unpickle = function(p /* JSON string of a pickled object graph */) {
	this.queue = $.evalJSON(p);
	
	// restore original objects
	this._iterate(function(current) {			   
		var source = current.objectData;
		if (this._isScalar(source)) {
			current.target = source;
		}
		else {
			current.target = this._restore(current.objectType);
			for (var attr in source) {
				// it's either a scalar or a reference, leave them 
				// and resolve later.
				current.target[attr] = source[attr];
			}
		}
	});
	
	// resolve references
	this._iterate(function(o) {
		for (var attr in o.target) {
			var x = o.target[attr];
			if (x && x.typeName && x.typeName == "PRef") {
				o.target[attr] = this._resolve(x.targetId);
			}
		}
	});
	
	return this.queue[0].target;
};
