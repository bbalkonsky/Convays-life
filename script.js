var canvas = document.getElementById('canvas');
canvas.width = document.documentElement.clientWidth;
canvas.height = document.documentElement.clientHeight;
ctx = canvas.getContext('2d');
canvas = document.getElementById('canvas');
ctx.strokeStyle = "#0987c3";
var width = canvas.width * 2;
var height = canvas.height * 3;

var cameraX = width / 2;
var cameraY = height / 2;
var mousePositionX = cameraX;
var mousePositionY = cameraY;

var step = 15; //unit size

var unitsValue = document.getElementById('unitsValue');
var generationPanel = document.getElementById('generation');
var benchmarkPanel = document.getElementById('benchmark');
    
function drawBackGround() {
	for (var i = step; i < width; i += step * 2) {
		ctx.strokeRect(i, 0, step, height);
		ctx.strokeRect(0, i, width, step);
	};
};
var notEmpty = 1;
var generation = 1;
var grid = [];
function generateGrid(width, height) { //generating first generation grid
	ctx.fillStyle = "#0987c3";
	notEmpty = 0;
	for (i = 0; i < (height / step); i++){
		grid[i] = [];
		for (j = 0; j < (width / step); j++){
			grid[i][j] = Math.round(Math.random());
			if (grid[i][j] == 1) { notEmpty++ };
		};
	};
	unitsValue.value = notEmpty + " : units";
	generationPanel.value = generation + " : generation";
};
function drawUnits(grid) {
  ctx.strokeStyle = "#c7edfc";
  for (i = 0; i < grid.length; i++) {
    for (j = 0; j < grid[i].length; j++) {
      if (grid[i][j] == 1) {
        ctx.fillRect( (((j + 1) * step) - step) - cameraX, (((i + 1) * step) - step) - cameraY, step , step);
      } else {
      	ctx.strokeRect( (((j + 1) * step) - step) - cameraX, (((i + 1) * step) - step) - cameraY, step , step);
      };
    };
  };
};
function refresh() {
	ctx.clearRect(0, 0, width, height);
	cameraMove();
	benchmark(drawUnits, grid);
};
canvas.onmousedown = function(c) { // manualy drawing
	ctx.strokeStyle = "#c7edfc";
	if (stopButton.disabled == true) {
		var m = Math.floor(c.pageX / step); 
		var n = Math.floor(c.pageY / step);	
		var chooseDestiny = grid[n][m];
		if (grid[n][m] == 1) { 
    	grid[n][m] = 0;	
    	ctx.clearRect(m * step, n * step, step, step);
    	ctx.strokeRect(m * step, n * step, step, step);
    } else {
    	grid[n][m] = 1;
	    ctx.fillRect(m * step, n * step, step, step);
    };
	    this.onmousemove = function(e) { // swipe
		  	var x = Math.floor(e.pageX / step);
		    var y = Math.floor(e.pageY / step);
		    if (x != m || y != n) {
		    	m = x; 
		    	n = y;
			    if (chooseDestiny == 1) { 
			    	grid[y][x] = 0;
			    	ctx.clearRect(m * step, n *step, step, step);
			    	ctx.strokeRect(m * step, n *step, step, step);
			    } else {
			    	grid[y][x] = 1;
			    	ctx.fillRect(m * step, n *step, step, step);
			    };
			};
  	};
  	this.onmouseup = function(){ this.onmousemove = function(){}; }
	};
};
canvas.onmousemove = function(e) {
	mousePositionX = e.clientX;
	mousePositionY = e.clientY;
	console.log(cameraX, cameraY);
};
function cameraMove() {
	var screenShift = 30;
	if (mousePositionX <= 50 && cameraX >= 0) {
		cameraX -= screenShift;
	} else if (mousePositionX >= (width / 2 - 50) && cameraX <= width / 2) {
		cameraX += screenShift;
	};
	if (mousePositionY <= 50 && cameraY >= 0) {
		cameraY -= screenShift;
	} else if (mousePositionY >= (height / 3 - 50) && cameraY <= height / 3) {
		cameraY += screenShift;
	};
};
var newGrid = [];
var oldGrid = [];
function getNewGrid(grid) {
	notEmpty = 0;

	for (var i = 0; i < grid.length; i++){

		newGrid[i] = [];

		for (var j = 0; j < grid[i].length; j++){
			var neig = 0; 
			var tempGrid = [];
			if (grid[i][j] == 1) { notEmpty++ };
			
			for (var m = -1; m <= 1; m++) { // moore neighborhood
				
				tempGrid[m+1] = [];
				
				if ((( i == 0 ) && ( m == -1 )) || (( i == grid.length - 1 ) && ( m == 1 ))){
					tempGrid[m+1] = [0,0,0];
					continue;
				}

				for (var n = -1; n <= 1; n++) {
					tempGrid[m+1][n+1] = grid[i+m][j+n];
				};
			};
			
			for (var n = 0; n < tempGrid.length; n++) { // neighbors value
				for (var m = 0; m < tempGrid[n].length; m++){
					if (tempGrid[n][m] == 1) { neig++ };
				};
			};
			if (grid[i][j] == 1) { neig -= 1 };
			if (grid[i][j] == 1 && (neig == 3 || neig == 2)) { // create new unnits
				newGrid[i][j] = 1;
			} else if (grid[i][j] == 0 && neig == 3) {
				newGrid[i][j] = 1;
			} else {
				newGrid[i][j] = 0;
			};
		};
	};
	unitsValue.value = notEmpty + " : units";
	generation++;
	generationPanel.value = generation + " : generation";
};
startButton = document.getElementById('start');
stopButton = document.getElementById('stop');
var cycleTimer;

startButton.onclick = function () {
  refresh();
  cycleTimer = setTimeout(function cycle() {
    getNewGrid(grid);
    if (String(grid) == newGrid || String(newGrid) == oldGrid) { notEmpty = 0 };
    oldGrid = grid;
    grid = newGrid;
    newGrid = [];
    refresh();
    cycleTimer = setTimeout(cycle, 50);
  }, 50);
  setInterval(function () {
    if (notEmpty == 0) {
      ctx.strokeStyle = "#000000";
      ctx.font = "50px Arial"
      ctx.strokeText("LIFE IS OVER", width / 2, height / 2);
      clearInterval(cycleTimer);
      startButton.disabled = false;
      stopButton.disabled = true;
    };
  }, 100);
  startButton.disabled = true;
  stopButton.disabled = false;
};
stopButton.onclick = function () {
  clearInterval(cycleTimer);
  startButton.disabled = false;
  stopButton.disabled = true;

  setInterval(function () {
    refresh();
  }, 50);
};

/* ========== request animation frame alternative ========== */
/*function repeater() {
	refresh();
  cycleTimer = setTimeout(function cycle() {
    getNewGrid(grid);
    if (String(grid) == newGrid || String(newGrid) == oldGrid) { notEmpty = 0 };
    oldGrid = grid;
    grid = newGrid;
    newGrid = [];
    refresh();
    cycleTimer = setTimeout(cycle, 50);
  }, 50);
  setInterval(function () {
    if (notEmpty == 0) {
      ctx.strokeStyle = "#000000";
      ctx.font = "50px Arial"
      ctx.strokeText("LIFE IS OVER", width / 2, height / 2);
      clearInterval(cycleTimer);
      startButton.disabled = false;
      stopButton.disabled = true;
    };
  }, 100);
  startButton.disabled = true;
  stopButton.disabled = false;

  cycleTimer = requestAnimationFrame(repeater);
};
startButton.onclick = function () {
	cycleTimer = requestAnimationFrame(repeater);
};
stopButton.onclick = function () {
  cancelAnimationFrame(cycleTimer);
  startButton.disabled = false;
  stopButton.disabled = true;
};*/
/* ========== request animation frame alternative ========== */

function benchmark(func, param){
	var startTime = Date.now();
	func(param);
	var finishTime = Date.now();
  var finalTime = finishTime - startTime;
	benchmarkPanel.value = finalTime + " : frame rate";
};

generateGrid(width, height);
refresh();