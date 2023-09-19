class Player {
    constructor(game) {
        this.game = game;
        this.x = this.game.width-5;
        this.y = this.game.height-5;
    }
    moveTo(x, y) {
        let scale = window.innerWidth / this.game.width;
        x = Math.floor(x / scale);
        y = Math.floor(y / scale);
        if(this.game.map[y][x]) {
            this.x = x;
            this.y = y;
        }
    }
}
class Zombie {
    constructor(game, player, x, y) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.target = player;
        this.lastTargetX = this.target.x;
        this.lastTargetY = this.target.y;
        this.positionOnPath = 0;
        this.path = [];
        this.pathFinder = new AStarPathFinder(this.game.width, this.game.height);
        this.pathFinder.loadMap(this.game.map);
        this.getPath();
        this.move();
    }
    move() {
        if(this.target.x != this.lastTargetX || this.target.y != this.lastTargetY) {
            this.positionOnPath = 0;
            this.lastTargetX = this.target.x;
            this.lastTargetY = this.target.y;
            this.getPath();
        }
        if(this.path.length > 0) {
            this.positionOnPath = Math.min(this.positionOnPath+10, this.path.length-1);
            this.x = this.path[this.positionOnPath].x;
            this.y = this.path[this.positionOnPath].y;
        }
    }
    getPath() {
        this.game.timer1 = performance.now();
        this.path = [];
        this.pathFinder.reset();
        this.pathFinder.setStart(this.x, this.y);
        this.pathFinder.setDestination(this.target.x, this.target.y );
        this.pathFinder.wh = 40;
        this.path=this.pathFinder.findPath(999999);
        this.path = this.path.reverse();
        this.game.timer2 = performance.now();
    }
}
class Game {
    constructor() {
        this.width = mapWidth;
        this.height = mapHeight;
        this.map = [];
        this.makeMap();
        this.timer1 = 0;
        this.timer2 = 0;
        this.player = new Player(this);
        this.zombie = new Zombie(this, this.player, mapStartX, mapStartY);
        this.mapCanvas = document.getElementById("mapCanvas");
        this.pathCanvas = document.getElementById("pathCanvas");
        this.mapCanvas.width = window.innerWidth;
        this.mapCanvas.height = window.innerHeight;
        this.mapCtx = this.mapCanvas.getContext("2d");
        this.pathCanvas.width = window.innerWidth;
        this.pathCanvas.height = window.innerHeight;
        this.pathCtx = this.pathCanvas.getContext("2d");
        this.drawMap()
    }
    drawPath() {
        let scale = window.innerWidth / this.width;

        this.pathCtx.clearRect(0, 0, this.width * scale, this.height * scale);
        let stepCount = 0;
        this.zombie.path.forEach((step)=>{

            if (this.zombie.positionOnPath > stepCount) {
                this.pathCtx.fillStyle = "rgba(255, 0, 255, 0.2)";
                stepCount += 1;
            } else {
                this.pathCtx.fillStyle = "rgba(255, 0, 255, 1)";
            }

            this.pathCtx.fillRect(step.x * scale, step.y * scale, 1 * scale, 1 * scale);
        });
        this.pathCtx.fillStyle = "red";
        this.pathCtx.fillRect((this.zombie.x * scale) - 10, (this.zombie.y * scale) - 10, 20, 20);
        this.pathCtx.fillStyle = "white";
        this.pathCtx.fillRect((this.player.x * scale) - 10, (this.player.y * scale) - 10, 20, 20);
    }
    update() {
        this.zombie.move();
        this.drawPath();
        this.updateInfo();
        setTimeout(() => this.update(), 100);
    }
    drawMap() {
        let scale = window.innerWidth / this.width;

        this.mapCtx.clearRect(0, 0, this.width * scale, this.height * scale);
        for(let y = 0; y < this.height; y++) {
            for(let x = 0; x < this.width; x++) {
                if (! this.map[y][x]) {
                    this.mapCtx.fillStyle = "#fbbf24";
                    this.mapCtx.fillRect(x * scale, y * scale, 1 * scale, 1 * scale);
                }
            }
        }
    }
    makeMap() {
        this.map = imageArray;
    }
    updateInfo() {
        let nodesExplored = 0;
        this.zombie.pathFinder.nodes.forEach((node)=>{
            if(node.isOpen || node.isClosed) nodesExplored += 1;
        });
        let totalNodes = this.zombie.pathFinder.nodes.length;
        let resultsHTML = document.getElementById('results1');
        if(this.zombie.path.length>0) resultsHTML.classList.add('hasPath');
        else resultsHTML.classList.remove('hasPath');
        resultsHTML.innerHTML = `<table>
            <tr><td class="col1">Map size</td><td>${this.width} x ${this.height}</td></tr>
            <tr><td class="col1">Nodes</td><td>${this.width*this.height}</td></tr>
            <tr><td class="col1">Loops</td><td>${this.zombie.pathFinder.loopCount}</td></tr>
            <tr><td class="col1">Path length</td><td>${this.zombie.path.length} nodes.</td></tr>
            <tr><td class="col1">Explored</td><td>${nodesExplored} / ${totalNodes}.</td></tr>
            <tr><td class="col1">Explored %</td><td>${((100/totalNodes)*nodesExplored).toFixed(2)}%</td></tr>
            <tr><td class="col1">Time</td><td>${Math.floor(this.timer2-this.timer1)}ms.</td></tr>
            <tr><td class="col1">Nodes p/s</td><td>${Math.ceil((nodesExplored/(this.timer2-this.timer1))*1000)}</td></tr>
            </table>`;
    }
}

const myGame = new Game();
document.addEventListener("mousemove", (e)=>{ myGame.player.moveTo(e.offsetX, e.offsetY); });
myGame.update();