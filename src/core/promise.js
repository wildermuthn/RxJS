	
	var Promise = Rx.Promise = (function () {

		function Promise (init) {
			this.handlers = {};
		}

		var promisePrototype = Promise.prototype;

		promisePrototype.on = function (event, handler) {

		};

		promisePrototype.off = function (event, handler) {

		};

		promisePrototype.emit = function (event) {

		};

		return Promise;

	}());