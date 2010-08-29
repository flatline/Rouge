/**
 * @link jquery-json.min.js
 */

var Pickler = function () {
    var self = this;        
    var queue = [];
    var lastId = 0;    
    
    this._search = function(obj) {
        for (var i = 0; i < queue.length; i++) {
            if (queue[i].source === obj) return i;
        }
        return -1;
    };
    
    this._dequeue = function() {
        // use this rather than pop so we only retrieve the next unexplored node, not remove it from the queue
        for (var i = 0; i < queue.length; i++) {
            if (queue[i].state != "explored") return queue[i];
        }
        return null;
    };
    
    this._iterate = function(f) {
        for (var i = 0; i < queue.length; i++) {
            f(queue[i]);
        }
    };   
    
    this._isScalar = function(x) {
        var currentType = typeof(x);
        return currentType == "undefined" || currentType == "number" ||
               currentType == "string" || currentType == "boolean";
    };    
    
    this._buildWrapper = function(obj) {
        var typeName;
        if (obj instanceof Array) {
            typeName = "array";
        }
        else {
            typeName = (obj && obj.typeName ? obj.typeName : typeof(obj));
        }
        
        return { 
            "id" : ++lastId,
            "state" : "discovered",
            "objectType" : typeName,
            "source" : obj,
            "objectData" : {}
        };
    };
    
    this._buildReference = function(targetId) {
        return {
            "typeName" : "PRef",
            "targetId" : targetId
        };
    };
    
    /*  Do a BFS on the object graph, with the object passed in as the 
        root node.  An object is wrapped in a container to which the 
        object's properties and some metadata are copied.
        
        Scalar values are copied directly from the source, object references
        are counted as new nodes.  Another container, a reference object,
        is created with a pointer to the id value of the target's container.
        
        Relies partly on game objects supplying a "typeName" property so
        they can be reconstituted later at runtime.
     */    
    this.pickle = function(root) {
        var wrappedRoot = self._buildWrapper(root);
        queue.push(wrappedRoot);
        
        var target, source;

        while (current = self._dequeue()) {
            source = current.source;
            target = current.objectData;
            
            if (self._isScalar(source)) {
                // scalar types
                current.objectData = source;
            }
            else { // complex types
                for (var attr in source) {
                    var idx;                    
                    if (self._isScalar(source[attr])) {
                        target[attr] = source[attr];
                    }                    
                    else if (source[attr] instanceof Function) {
                        // ignore - must be provided during unpickle by ctor
                    }
                    else if (source[attr] === null) {
                        //avoid empty object reference here
                        source[attr] = null;
                    }
                    else if ((idx = self._search(source[attr])) == -1) {
                        // discovered item, add to queue
                        var targetItem = self._buildWrapper(source[attr]);
                        queue.push(targetItem);
                        target[attr] = self._buildReference(targetItem.id);
                    } 
                    else {
                        // link to item; will effectively remove cycles from the resulting tree
                        target[attr] = self._buildReference(queue[idx].id);
                    }
                }
            }
            current.state = "explored";
        }
        
        // delete source attrs then call toJSON on root wrapper
        self._iterate(function(o) { 
            delete(o.source);
            delete(o.state);
        });
        return $.toJSON(queue);
    }
    
    /* resolves a reference during the unpickle operation.
     * @param refID - the id value of the container in the queue
     * @return - the object the container wraps, or null if not found
     */
    this._resolve = function(refID) {
        for (var i = 0; i < queue.length; i++) {
            if (queue[i].id === refID) return queue[i].target;
        }
        return null;
    }
    
    /* Creates a new object of type typeName.  Handles
     * e.g. "object" -> "Object" for builtin types
     */
    this._restore = function(typeName) {
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
    }

    this.unpickle = function(p /* JSON string of a pickled object graph */) {
        queue = $.evalJSON(p);
        
        // restore original objects
        self._iterate(function(current) {            
            var source = current.objectData;
            if (self._isScalar(source)) {
                current.target = source;
            }
            else {
                current.target = self._restore(current.objectType);
                for (var attr in source) {
                    // it's either a scalar or a reference, leave them there and resolve later.
                    current.target[attr] = source[attr];
                }
            }
        });
        
        // resolve references
        self._iterate(function(o) {
            for (var attr in o.target) {
                var x = o.target[attr];
                if (x && x.typeName && x.typeName == "PRef") {
                    o.target[attr] = self._resolve(x.targetId);
                }
            }
        });
        
        return queue[0].target;
    }
}