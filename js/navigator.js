/**
 * A single map node. All nodes are assumed traversable and have the same costs
 * Obstructions in the map are defined with a false value in the map data
 * and do not have a node instance.
 *
 * @property {number} x - The X position on the grid
 * @property {number} y - The Y position on the grid
 * @property {number} F - The F value of this node (g+h)
 * @property {number} g - The g Score of this node, cost of getting here from the start along the best path so far
 * @property {number} h - The h Score of this node, distance to the destination in a straight line
 * @property {number} wg - g weight - the g value will be multiplied by this to tweak the algorithm to your needs
 * @property {number} wh - h weight - the h value will be multiplied by this to tweak the algorithm to your needs
 * @property {NavigatorNode} parent - The parent node based on the best available path so far
 * @property {boolean} isOpen - Is the node Open (in the open set), candidate to be looked at
 * @property {boolean} isClosed - Is the node Closed (in the closed set), finished with this node
 *
 */
class NavigatorNode {
	/**
	 * Create a new node instance, usually called by the Navigator.loadMap() method
	 *
	 * @param {number} x - The X position in the map
	 * @param {number} y - The Y position in the map
	 * @param {number} wg - g weight
	 * @param {number} wh - h weight
	 * @param {number} id - Unique number / index in array
	 */
	constructor(x, y, wg, wh, idx) {
		this.idx = idx;  
		this.x = x;
		this.y = y;
		this.g = 0;
		this.wg = wg;
		this.wh = wh;
		this.h = 0;
		this.parent = false;
		this.isOpen = false;
		this.isClosed = false;
		
		this.inPath = false;
	}
	/**
	 * Set the node to Open (add to the open set)
	 */
	open() {
		this.isOpen = true;
		this.isClosed = false;
	}
	/**
	 * Set the node to Closed (add to the closed set)
	 */
	close() {
		this.isOpen = false;
		this.isClosed = true;
	}
	/**
	 * Get the F value (g * g weight + h * h weight)
	 */
	get F() {
		return Math.round((this.g*this.wg)+(this.h*this.wh));	
	}
	/**
	 * The distance to the supplied node
	 * Calculated as a straight line between the points using Pythagoras
	 *
	 * @param {Node} dest - The destination node
	 * @returns {number} - Distance bewtween the two nodes
	 */
	distanceTo(dest) {
		let x = Math.abs(this.x - dest.x);
		let y = Math.abs(this.y - dest.y);
		let d = Math.sqrt((x*x)+(y*y));
		return d;
	}
}
/**
 * An A* path finder wrapper
 * 
 * @property {number} width - Width of the grid
 * @property {number} height - Height of the grid
 * @property {NavigatorNode[]} nodes - Array of grid nodes
 * @property {NavigatorNode[]} nodesPosition - Lookup array of grid positions [y][x]
 * @property {Object} start - The starting position in a simple x, y wrapper
 * @property {Object} destination - The destination position in a simple x, y wrapper
 * @property {number} wg - g weight - the g value will be multiplied by this to tweak the algorithm to your needs
 * @property {number} wh - h weight - the h value will be multiplied by this to tweak the algorithm to your needs
 *
 */
class Navigator {
	/**
	 * Make a new path finder navigator, you'll need to load a map and
	 * set the start and destination points, but this is a good start :)
	 *
	 * @param {number} width - Width of the grid (how many nodes across)
	 * @param {number} height - Height of the grid (how many nodes down)
	 */
	constructor(width, height) {
		this.width = width;
		this.height = height;
		this.nodes = [];
		this.nodesPosition = [];
		this.start = { x: 0, y: 0 };
		this.destination = { x: 9, y: 9 };
		this.wg = 1;
		this.wh = 30;
	}
	/**
	 * Main path finding loop - call this to get a path back. This is the main logic of the 
	 * A* algorithm. 
	 *
	 * @returns {array} Array of path nodes from start to destination or empty if no path found
	 */
	findPath(maxLoops) {
		
		/* We can restrict how many loops we'll make */
		this.maxLoops = maxLoops;
		this.loopCount = 0;
		
		/* The final path */
		let path = [];
		
		/* Get the start and destination node out of the position lookup array */
		let startNode = this.nodesPosition[this.start.y][this.start.x];
		let destNode = this.nodesPosition[this.destination.y][this.destination.x];
		
		/* Setup the start node - add to the open set */
		startNode.open();
		
		/* Set h to distance to destination */
		startNode.h = startNode.distanceTo(destNode);
		
		/* Set g to 0, no cost to get here, we started here */
		startNode.g = 0;
		
		/* Set the node we are looking at */
		let currentNode = startNode;

		/* Into the main loop - do this until there are no more open nodes or the destination is found or maxLoops reached */
		do {
			/* Get this nodes neighbours (8 possible neighbours)*/
			let neighbours = this.neighboursOf(currentNode);
			
			/* Each of the neighbours */
			neighbours.forEach((neighbour)=>{
				
				if(neighbour.isOpen) {
					/* Neighbour node already open */
					
					// is this a better path?
					
					// update the parent + vals
					
				} else {

					/* Neighbour node not open ??? closed ?? unkown */
					neighbour.open();
					/* Parent node is set to the current node */
					neighbour.parent = currentNode;
					/* Set h to distance to destination */
					neighbour.h = neighbour.distanceTo(destNode);
					/* Set g to the current node g + distance from current node */
					neighbour.g = currentNode.g + neighbour.distanceTo(currentNode)*10; // ????????? wg
				}
				
			});
			
			/* Close the current node, we're done with it and have new open candidates to look at */
			currentNode.close();

			/* Get a new current node, search in the updated nodes for the lowest F value open node */
			currentNode = this.lowestFOpenNode();
			
			/* Have we reached the destination ? */
			if(currentNode == destNode) {
				
				/* Yes, reached the destination - woohoo */
				console.log("FOUND PATH");
				
				/* Make the path */
				while(currentNode.parent) {
					path.push(currentNode);
					currentNode.inPath = true;
					currentNode = currentNode.parent;
				}
				/* Push the final node, start node with no parent */
				path.push(currentNode);
				currentNode.inPath = true;
				
				return path;
			}

			/* Keep count of how many loops we do */
			this.loopCount += 1;
			
			/* Keep going until currentNode is false (no more nodes to explore) or we exceed the maxLoops restriction */
			
		} while (currentNode && this.loopCount < this.maxLoops);

		/* Return the path we have ... */
		return path;
	}
	/**
	 * Get the open node with the lowest F value, if multiple
	 * nodes have same F last one is chosen.
	 * @todo If same F compare h / g
	 *
	 * @returns {Node} Single node with lowest F 
	 */
	lowestFOpenNode() {
		let lowestFNode = false;
		
		/* Each of the nodes in all nodes - bad for efficiency */
		this.nodes.forEach((node)=>{

			/* Only check open nodes */
			if(node.isOpen) {

				/* Lowest node hasn't been set yet or this node has a lower F */
				if(!lowestFNode || node.F < lowestFNode.F) {

					/* Set new lowest F node */
					lowestFNode = node;
				}
			}
		});
		return(lowestFNode);
	}
	/**
	 * Load the map array[y][x] 
	 * True - traversable, False - wall or obstacle
	 * Top Left is 0,0
	 *
	 * @param {array} map - The map array
	 */
	loadMap(map) {
		this.nodes = [];
		this.nodesPosition = [];

		/* Each of the grid positions - work through the grid Y then X to help with managing arrays */
		for(let y = 0; y < this.height; y++) {
			/* Have to create each array in our multi dim array */
			this.nodesPosition[y] = [];
			for(let x = 0; x < this.width; x++) {
				/* Check the map to see if True or False at position X , Y */
				if(map[y][x]) {
					/* Push a new node to the array, reference the node in the nodesPosition lookup */
					this.nodes.push(new NavigatorNode(x, y, this.wg, this.wh, this.nodes.length));
					this.nodesPosition[y][x] = this.nodes[this.nodes.length-1];
				} else {
					/* No new node, put false in the position map */
					this.nodesPosition[y][x] = false;
				}
			}
		}
		return true;
	}
	
	setStart(x, y) {
	
	}
	
	setDestination(x, y) {
	
	}
	
	/**
	 * Get all the neighbours of the parent node, all the nodes that surround
	 * this node in a 3x3 grid. X and Y loop from -1 to 1, this is added to the node.x and node.y
	 * to give the neighbour location.
	 *
	 * @param {Node} node - The starting node
	 * @returns {array} - Array of neighbour nodes
	 */
	neighboursOf(node) {
		let neighbours = [];
		let neighbour = false;
		for(let x = -1; x <= 1; x++) {
			for(let y = -1; y <= 1; y++) {
				
				/* Temporary container for the x, y - easy reading */
				neighbour = {x: node.x+x, y: node.y+y};
				
				/* Is this node in the map, or outside the map area */
				if(neighbour.x >=0 && neighbour.y >=0 && neighbour.x < this.width && neighbour.y < this.height) {
					
					/* Ignore center node, it's the one we are dealing with */
					if(!(x==0 && y==0)) {
						
						/* Is there a traversable node at neighbours position */
						if(this.nodesPosition[neighbour.y][neighbour.x]) {
							
							/* Is the node not closed */
							if(!this.nodesPosition[neighbour.y][neighbour.x].isClosed) {
								
								/* Push it onto the neighbours array to be returned when we're done */
								neighbours.push(this.nodesPosition[neighbour.y][neighbour.x]);
							}
						}
					}
				}
			}
		}
		return neighbours;
	}
	
	
	
	
	
}