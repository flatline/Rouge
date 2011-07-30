//--------------------------------------------------------
// Event handlers
//--------------------------------------------------------
if (!Object.prototype.addEventHandler) {
	Object.prototype.addEventHandler = function(evtName, fn) {
		if (typeof(fn) === "undefined") return;
		var propName = "__event_" + evtName;
		if (!(propName in this)) this[propName] = [];
		this[propName].push(fn);
	}
}

if (!Object.prototype.removeEventHandler) {
	Object.prototype.removeEventHandler = function(evtName, fn) {
		var propName = "__event_" + evtName;		
		if (propName in this) {
			var handlers = this[propName];
			var match = false;
			for (var i = 0; i < handlers.length; i++) {
				if (handlers[i] === fn) { 
					match = true; 
					break; 
				}
			}
			if (match) handlers = handlers.slice(i, 1);
		}
	}	
}	

if (!Object.prototype.raiseEvent) {
	Object.prototype.raiseEvent = function(evtName /*, arg1, ..., argn */) {
		var propName = "__event_" + evtName;
		if (propName in this) {
			var handlers = this[propName];
			var args = Array.prototype.slice.call(arguments).slice(1); //get rid of evtName
			for (var i = 0; i < handlers.length; i++) {
				var handler = handlers[i];
				//we're getting this==window sometimes if we mess up a this pointer, and it behaves weird
				if (typeof handler == "undefined") return;
				handler.apply(this, args);
			}
		}
	}
}

//--------------------------------------------------------
//since events are a major control mechanism in JS, this will let us chain
//a bunch together to better consolidate some of the complex chaining logic
//e.g. when we need to wait for a series of DOM events to finish.
//--------------------------------------------------------
function EventChain() {
	var events = [];
	var self = this;
	
	/**
	* @param fn - the function to invoke
	* @param responseObject - the object on which fn will raise an event when completed
	* @param responseEvent - the name of the event on the responseObject that will fire the next in the chain
	* @returns - the event chain
	*/
	this.add = function(fn, responseObject, responseEvent /*, fn args */) {
		var args = Array.prototype.slice.call(arguments).slice(3);
		events.push({action: fn, obj: responseObject, evt: responseEvent, args: args});
		return self;
	};
	
	/**
	* @param {Function} finalFn - optional, a function to execute when the chain is complete
	* @param {Array} finalFnArgs - optional, an array of arguments to pass to finalFN
	*/
	this.execute = function(/*finalFn, [finalFnArgs]*/) {
		var eventCount = events.length
		for (var i = 0; i < eventCount - 1; i++) {
			var event = events[i];
			event.obj.addEventHandler(event.evt, events[i+1].action);
		}
		var finalFn = arguments.length > 0 ? arguments[0] : null;
						
		var lastEvent = events[eventCount - 1];
		lastEvent.obj.addEventHandler(
			lastEvent.evt, 
			function() {
				//TODO: remove event handlers!
				//TODO: should we change the this pointer?
				if (finalFn) finalFn.apply(this, Array.prototype.slice.call(arguments).slice(1));
				self.raiseEvent("done");
			});
		
		var firstEvent = events[0];
		firstEvent.action.apply(this, firstEvent.args);
	};
}
