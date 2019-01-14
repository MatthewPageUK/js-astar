"use strict";
var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
var AStarNode = function () {
	function AStarNode(x, y, idx) {
		_classCallCheck(this, AStarNode);
		this.idx = idx;
		this.x = x;
		this.y = y;
		this.g = 0;
		this.h = 0;
		this.parent = false;
		this.isOpen = false;
		this.isClosed = false;
		this.inPath = false;
	}
	_createClass(AStarNode, [{
		key: "open",
		value: function open() {
			this.isOpen = true;
			this.isClosed = false;
		}
	}, {
		key: "close",
		value: function close() {
			this.isOpen = false;
			this.isClosed = true;
		}
	}, {
		key: "distanceTo",
		value: function distanceTo(dest) {
			var x = Math.abs(this.x - dest.x);
			var y = Math.abs(this.y - dest.y);
			var d = Math.sqrt(x * x + y * y);
			return d;
		}
	}, {
		key: "F",
		get: function get() {
			return Math.round(this.g + this.h);
		}
	}]);

	return AStarNode;
}();
var AStarPathFinder = function () {
	function AStarPathFinder(width, height) {
		_classCallCheck(this, AStarPathFinder);
		this.width = width;
		this.height = height;
		this.nodes = [];
		this.nodesPosition = [];
		this.start = false;
		this.destination = false;
		this.wg = 10;
		this.wh = 30;
	}
	_createClass(AStarPathFinder, [{
		key: "findPath",
		value: function findPath(maxLoops) {
			var _this = this;
			this.maxLoops = maxLoops;
			this.loopCount = 0;
			var path = [];
			var startNode = this.nodesPosition[this.start.y][this.start.x];
			var destNode = this.nodesPosition[this.destination.y][this.destination.x];
			startNode.open();
			startNode.h = this.wh * startNode.distanceTo(destNode);
			startNode.g = 0;
			var currentNode = startNode;
			do {
				var neighbours = this.neighboursOf(currentNode);
				neighbours.forEach(function (neighbour) {
					if (neighbour.isOpen) {
						if (neighbour.g > currentNode.g + currentNode.distanceTo(neighbour) * _this.wg) {
							neighbour.g = currentNode.g + currentNode.distanceTo(neighbour) * _this.wg;
							neighbour.parent = currentNode;
						}
					} else {
						neighbour.open();
						neighbour.h = neighbour.distanceTo(destNode) * _this.wh;
						neighbour.g = currentNode.g + neighbour.distanceTo(currentNode) * _this.wg;
						neighbour.parent = currentNode;
					}
				});
				currentNode.close();
				currentNode = this.lowestFOpenNode();
				if (currentNode == destNode) {
					while (currentNode.parent) {
						path.push(currentNode);
						currentNode.inPath = true;
						currentNode = currentNode.parent;
					}
					path.push(currentNode);
					currentNode.inPath = true;
					return path;
				}
				this.loopCount += 1;
			} while (currentNode && this.loopCount < this.maxLoops);
			return path;
		}
	}, {
		key: "lowestFOpenNode",
		value: function lowestFOpenNode() {
			var lowestFNode = false;
			this.nodes.forEach(function (node) {
				if (node.isOpen) {
					if (!lowestFNode) {
						lowestFNode = node;
					} else if (node.F < lowestFNode.F) {
						lowestFNode = node;
					} else if (node.F == lowestFNode.F) {
						if (node.h <= lowestFNode.h) {
							lowestFNode = node;
						}
					}
				}
			});
			return lowestFNode;
		}
	}, {
		key: "loadMap",
		value: function loadMap(map) {
			this.nodes = [];
			this.nodesPosition = [];
			for (var y = 0; y < this.height; y++) {
				this.nodesPosition[y] = [];
				for (var x = 0; x < this.width; x++) {
					if (map[y][x]) {
						this.nodes.push(new AStarNode(x, y, this.nodes.length));
						this.nodesPosition[y][x] = this.nodes[this.nodes.length - 1];
					} else {
						this.nodesPosition[y][x] = false;
					}
				}
			}
			return true;
		}
	}, {
		key: "setStart",
		value: function setStart(x, y) {
			this.start = { x: x, y: y };
		}
	}, {
		key: "setDestination",
		value: function setDestination(x, y) {
			this.destination = { x: x, y: y };
		}
	}, {
		key: "neighboursOf",
		value: function neighboursOf(node) {
			var neighbours = [];
			var neighbour = false;
			for (var x = -1; x <= 1; x++) {
				for (var y = -1; y <= 1; y++) {
					neighbour = { x: node.x + x, y: node.y + y };
					if (neighbour.x >= 0 && neighbour.y >= 0 && neighbour.x < this.width && neighbour.y < this.height) {
						if (!(x == 0 && y == 0)) {
							if (this.nodesPosition[neighbour.y][neighbour.x]) {
								if (!this.nodesPosition[neighbour.y][neighbour.x].isClosed) {
									neighbours.push(this.nodesPosition[neighbour.y][neighbour.x]);
								}
							}
						}
					}
				}
			}
			return neighbours;
		}
	}]);
	return AStarPathFinder;
}();