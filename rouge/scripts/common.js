// binds an object to a function application
function bind(object, fn) {
	return function() {
		return fn.apply(object, arguments);
	}
}

/**
 * copies the properties from source to target
 */
if (!Object.prototype.merge) {
	Object.prototype.merge = function(source) {
		for (var i in source) {
			this[i] = source[i];
		}
	}
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