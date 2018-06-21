
class Wall{
	constructor(x, y, isVertical){
		this.x = x;
		this.y = y;
		this.isVertical = isVertical;
	}
}

class Player{
	constructor(x, y, barsLeft){
		this.x = x;
		this.y = y;
		this.barsLeft = barsLeft;
	}
	
	move(dx, dy){
		this.x += dx;
		this.y += dy;
	}
}

var canvas = document.getElementById("canvas");
var pen = canvas.getContext("2d");

console.log("I generally assume that width is greater than height.");

var w = canvas.width, h = canvas.height;
var margin = (w - h)/2, overlap = h, boardSize = 10, unit = overlap/boardSize;
var walls = new Array(2 * (boardSize - 1) * boardSize);
var blockedWalls = [];
var COLOR_BACK = "#777777", COLOR_PLAYER_1 = "#ff0521", COLOR_PLAYER_2 = "#1201ff";
var MAX_BARS = 20, STARTING_AMMO = 2;

var player1 = new Player(boardSize -1, 0, MAX_BARS), player2 = new Player(0, boardSize -1, MAX_BARS);
var ammo = STARTING_AMMO;

var NULL_INDEX = -1;
var highlightIdx = NULL_INDEX;
var currentPlayer = false; //False means Player1 true means Player 2

var WALL_UNBLOCKED = 0, WALL_BLOCKED = 1;

init();
setInterval(draw, 10);

function draw(){
	
	pen.clearRect(0, 0, w, h);
	
	drawCourt();
	drawPlayers();
}

function drawCourt(){
	pen.lineWidth = 2;
	pen.strokeStyle = COLOR_BACK;
	pen.strokeRect(0, 0, w, h);
	
	pen.beginPath();
	pen.lineWidth = 0.5;
	for(var i = 0; i < boardSize + 1; i+=1){
		pen.moveTo(margin + i * overlap / boardSize, h);
		pen.lineTo(margin + i * overlap / boardSize, 0);
		pen.moveTo(margin, i * overlap / boardSize);
		pen.lineTo(w - margin, i * overlap / boardSize);
	}
	pen.stroke();
	pen.closePath();
	
	pen.beginPath();
	pen.lineWidth = 4;
	for(i = 0; i < blockedWalls.length; i++){
		var l = transformFromIndex(blockedWalls[i]);
		if(!l) continue;
		pen.moveTo(margin + unit * l.x + unit, unit * l.y + unit);
		if(l.isVertical) pen.lineTo(l.x * unit + unit + margin, unit * l.y);
		else pen.lineTo(unit * l.x + margin, unit * l.y + unit);
	}
	pen.closePath();
	pen.stroke();
	
	var t = transformFromIndex(highlightIdx);
	if(t){
		pen.beginPath();
		pen.strokeStyle = (currentPlayer)? COLOR_PLAYER_1: COLOR_PLAYER_2;
				
		pen.moveTo(margin + t.x * unit + unit, t.y * unit + unit);
		if(t.isVertical) pen.lineTo(margin + t.x * unit + unit, t.y * unit);
		else 			 pen.lineTo(margin + t.x * unit, t.y * unit + unit);
		
		pen.stroke();
		pen.closePath();
	}
}

function drawPlayers(){
	pen.beginPath();
	pen.fillStyle = COLOR_PLAYER_1;
	pen.arc(margin + player1.x*unit + unit/2, player1.y*unit + unit/2, unit/3, 0, 6.29);
	pen.fill();
	if(!currentPlayer) pen.fillStyle = COLOR_BACK;
	pen.fillRect(0, (MAX_BARS - player1.barsLeft) / (MAX_BARS) * h, margin, h);
	pen.closePath();
	pen.beginPath();
	pen.fillStyle = COLOR_PLAYER_2;
	pen.arc(margin + player2.x*unit + unit/2, player2.y*unit + unit/2, unit/3, 0, 6.29);
	pen.fill();
	if(currentPlayer) pen.fillStyle = COLOR_BACK;
	pen.fillRect(w - margin, (MAX_BARS - player2.barsLeft) / (MAX_BARS) * h, margin, h);
	pen.closePath();
}

function init(){
	canvas.addEventListener("mousemove", function(e){
		var mouseX = e.clientX - canvas.offsetLeft;
		var mouseY = e.clientY - canvas.offsetTop;
		if(mouseX < margin || mouseX > w - margin) {
			highlightIdx = NULL_INDEX;
			return;
		}
		var t = getIndexFromLocationOnBoard(mouseX - margin, mouseY);
		if(t != highlightIdx){
			highlightIdx = t;
		}
	}, false);
	
	canvas.addEventListener("click", function(e){
		var player = getCurrentPlayer();
		if(player.barsLeft == 0 || ammo == 0) return;
		var mouseX = e.clientX - canvas.offsetLeft;
		var mouseY = e.clientY - canvas.offsetTop;
		if(mouseX < margin || mouseX > w - margin) {
			highlightIdx = NULL_INDEX;
			return;
		}
		var t = getIndexFromLocationOnBoard(mouseX - margin, mouseY);
		if(t != NULL_INDEX){
			if(walls[t] == WALL_BLOCKED) return;
			player.barsLeft--;
			ammo--;
			if(ammo == 0) switchPlayer();
			blockedWalls.push(t);
			walls[t] = WALL_BLOCKED;
		}
	});
	
	window.addEventListener("keydown", function(e){
		var player = getCurrentPlayer();
		var moved = false;
		switch(e.keyCode){
			case 87:
				if(canMoveUpFrom(player.x, player.y))
				{
					player.move(0, -1);
					moved = true;
				}
				break;
			
			case 65:
				if(canMoveLeftFrom(player.x, player.y)) 
				{
					player.move(-1, 0);
					moved = true;
				}
				break;
			case 68:
				if(canMoveRightFrom(player.x, player.y)) 
				{
					player.move(1, 0);
					moved = true;
				}
				break;
				
			case 83:
				if(canMoveDownFrom(player.x, player.y)) 
				{
					player.move(0, 1);
					moved = true;
				}
				break;
		}
		if(moved){
			checkVictory(player);
			switchPlayer();
		}
	
	}, false);
	
	walls.fill(WALL_UNBLOCKED);
}

function checkVictory(player){
	if(player1.y == boardSize - 1) {
		alert("Red PLayer Wins! Refresh to play Again.");
	}
	else if(player2.y == 0){
		alert("Blue PLayer Wins! Refresh to play Again.");
	}
}

//In these functions, x and y belong to [0, 9], are in boardSpace instead of wallSpace
function transformFromIndex(idx){
	if(idx < 0 || idx >= walls.length) return undefined;
	var t = idx % (2 * boardSize);
	var isVert = t < boardSize;
	return new Wall((isVert)? t: t - boardSize, (idx - t)/ (2 * boardSize), isVert);
}

function transformToIndex(w){
	if(w.isVertical){
		if(w.x < 0 || w.x > boardSize - 1 || w.y < 0 || w.y > boardSize    ) return undefined;
		return 2 * w.y * boardSize + w.x;
	}
	else {
		if(w.x < 0 || w.x > boardSize     || w.y < 0 || w.y > boardSize - 1) return undefined;
		return (2 * w.y + 1) * boardSize + w.x;
	}
}

function getIndexFromLocationOnBoard(xs, ys){
 	var x = Math.floor(xs/unit), dx = xs/unit - x, y = Math.floor(ys/unit), dy = ys/unit - y;
	if(dy < 0.25){
		if(dx > 0.25 && dx < 0.75){ //Highlight top
			if(y == 0) return NULL_INDEX;
			return transformToIndex(new Wall(x, y - 1, false));
		}
	}
	else if(dy < 0.75){
		if(dx < 0.25){ //Highlight left
			if(x == 0) return NULL_INDEX;
			return transformToIndex(new Wall(x - 1, y, true));
		}
		else if(dx > 0.75){ //highlight right
			if(x == boardSize - 1) return NULL_INDEX;
			return transformToIndex(new Wall(x, y, true));
		}
		else return NULL_INDEX;
	}
	else if(dx > 0.25 && dx < 0.75) { //highlight bottom
		if(y == boardSize - 1) return NULL_INDEX;
		return transformToIndex(new Wall(x, y, false));
	}
	else return NULL_INDEX;
}

	function switchPlayer(){
	ammo = STARTING_AMMO;
	currentPlayer = ! currentPlayer;
}

function getCurrentPlayer(){
	return (currentPlayer)? player1: player2;
}

function canMoveUpFrom(x, y){
	if(y == 0) return false;
	var t = transformToIndex(new Wall(x, y -1, false));
	return walls[t] == WALL_UNBLOCKED;
}
function canMoveDownFrom(x, y){
	if(y == boardSize -1) return false;
	var t = transformToIndex(new Wall(x, y, false));
	return walls[t] == WALL_UNBLOCKED;
}
function canMoveLeftFrom(x, y){
	if(x == 0) return false;
	var t = transformToIndex(new Wall(x - 1, y, true));
	return walls[t] == WALL_UNBLOCKED;
}
function canMoveRightFrom(x, y){
	if(x == boardSize - 1) return false;
	var t = transformToIndex(new Wall(x, y, true));
	return walls[t] == WALL_UNBLOCKED;
}