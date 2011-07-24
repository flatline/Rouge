
// todo: remove
function debug(val) {
	$("#debug ul")
		.prepend("<li><div class='debug-time'>" +
				 new Date().toLocaleTimeString() +
				 "</div><span>" +
				 val + 
				 "</span></li>");
}

// todo: remove
function assert(val, failMsg, successMsg) {
	if (!val) {
		if (typeof failMsg != "undefined") debug("Assert failed: " + failMsg);
		else debug("Assert failed");
	} else {
		if (typeof successMsg != "undefined") debug("Assert passed: " + successMsg);
		else debug("Assert passed");
	}
}

/**
* A range function, returns an array of integers in the range
* forms:
* range(x) -> [0..x]
* range(x, y) -> [x..y]
* range(x, y, z) -> [x..y..z] (x to y in steps of z)
*/
function range(x, y, z) {
    var res = [];
    switch (arguments.length) {
        case 1:
            for (var i = 0; i <= x; i++) {
                res.push(i);     
            }
            break;
        case 2:
            for (var i = x; i <= y; i++) {
                res.push(i);
            }
            break;
        case 3:
            for (var i = x; i <= y; i+=z) {
                res.push(i);
            }
            break;   
    }
    return res;
}

//--------------------------------------------------------
// Array operations
//--------------------------------------------------------

//Compute the subtraction of members from the set
if (!Array.prototype.except) {
    Array.prototype.except = function (l2) {
        var res = [];
        for (var i = 0; i < this.length; i++)
        {
            if (l2.indexOf(this[i]) == -1)
                res.push(this[i]);            
        }        
        return res;
    }
}

//Compute the intersection of two lists as a set
if (!Array.prototype.intersect) {
    Array.prototype.intersect = function (l2) {
        var res = [];
        for (var i = 0; i < this.length; i++)
        {
            for (var j = 0; j < l2.length; j++) 
            {
                var cur = this[i];
                if (cur == l2[j] && res.indexOf(cur) == -1) res.push(cur);
            }
        }        
        return res;
    }
}

//Compute the union of two lists as a set
if (!Array.prototype.union) {
    Array.prototype.union = function (l2) {
        var res = [];
        var helper = function(l) {
            for (var i = 0; i < this.length; i++)
            {
                var cur = l[i];
                if (res.indexOf(cur) > -1) {
                    res.push(cur);
                }
            }
        }
        
        helper(this);
        helper(l2);
        return res;        
    }
}

//From MDC
if (!Array.prototype.indexOf)
{
  Array.prototype.indexOf = function(elt /*, from*/)
  {
    var len = this.length;

    var from = Number(arguments[1]) || 0;
    from = (from < 0)
         ? Math.ceil(from)
         : Math.floor(from);
    if (from < 0)
      from += len;

    for (; from < len; from++)
    {
      if (from in this &&
          this[from] === elt)
        return from;
    }
    return -1;
  };
}



//From MDC
if (!Array.prototype.filter)
{
  Array.prototype.filter = function(fun /*, thisp*/)
  {
    var len = this.length;
    if (typeof fun != "function")
      throw new TypeError();

    var res = new Array();
    var thisp = arguments[1];
    for (var i = 0; i < len; i++)
    {
      if (i in this)
      {
        var val = this[i]; // in case fun mutates this
        if (fun.call(thisp, val, i, this))
          res.push(val);
      }
    }

    return res;
  };
}

//From MDC
if (!Array.prototype.map)
{
  Array.prototype.map = function(fun /*, thisp*/)
  {
    var len = this.length;
    if (typeof fun != "function")
      throw new TypeError();

    var res = new Array(len);
    var thisp = arguments[1];
    for (var i = 0; i < len; i++)
    {
      if (i in this)
        res[i] = fun.call(thisp, this[i], i, this);
    }

    return res;
  };
}

if (!Array.prototype.fold) {

    Array.prototype.fold = function(fun, acc) {
        if (typeof fun != "function")
            throw new TypeError();
        var len = this.length;
        for (var i = 0; i < len; i++) {
            acc = fun(this[i], acc);
        }
        return acc;
    };
}

//bind for 'this' reference issues
function bind(object, fn) {
	return function() {
		return fn.apply(object, arguments);
	}
}

//--------------------------------------------------------
// Event handlers
//--------------------------------------------------------
if (!Object.prototype.addEventHandler) {
	Object.prototype.addEventHandler = function(evtName, fn) {
		var propName = "__event_" + evtName;
		if (!(propName in this)) this[propName] = []; 
		var self = this;
		this[propName].push(bind(self, fn));
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

//--------------------------------------------------------
//Some common FP patterns
//--------------------------------------------------------

//is there a proper way to only attach this to functions?  function == object so...
if (!Object.prototype.delay) {
	Object.prototype.delay = function() {				
		var c = arguments.callee;
		var f = function() {
			c.apply(this, Array.prototype.slice.call(arguments).slice(1));			
		};		
		
		return f;
	};
}


//--------------------------------------------------------
//Unit Tests
//--------------------------------------------------------
var Common = {};
Common.runTests = function(dbg) {

	dbg.info("Running Unit Tests for common.js");

	//Delay/force:
	/*dbg.run(function() {
		dbg.info("TestDelayForce");
		var f = function(name) {
			return "Hello, " + name + "!";
		}
		
		f = f.delay();
		dbg.assert(f("world") === "Hello, world!", "force/delay failed");
	});*/
	
	//Test Raise Event
	dbg.run(function() {
		dbg.info("TestRaiseEvent");
		var o = {};
		
		//test that the event fires
		var check = false;
		o.addEventHandler("test", function() {
			check = true;
		});
		dbg.assert(check === false, "Check set erroneously");
	
		o.raiseEvent("test");
		dbg.assert(check === true, "Check not set");
		
		//test that the arguments are persisted properly;
		//test that multiple events are raised
		check = false;
		var eat = null;
		o.addEventHandler("test", function(payload) {
			eat = payload;
		});
		
		o.raiseEvent("test", "sandwich");
		dbg.assert(check === true, "Check not set, second pass");
		dbg.assert(eat === "sandwich", "Failed to eat sandwich");
				
	});
};