
var canvas = document.getElementById("canvas");
var pen = canvas.getContext("2d");

console.log("I generally assume that width is greater than height.");

var w = canvas.width, h = canvas.height;
var margin = (w - h)/2, overlap = h, boardSize = 10, unit = overlap/boardSize;
var walls = new Array((boardSize - 1) * (boardSize - 1));
var color_back = "#000000", color_player1 = "#ff0521", color_player2 = "#1201ff";

var highlight, highlightIdx = -1;
var currentPlayer = false; //False means Player1 true means Player 2

init();
setInterval(draw, 10);

function draw(){
	
	pen.clearRect(0, 0, w, h);
	
	drawCourt();
		
	if(highlightIdx != -1){
		pen.fillStyle = (currentPlayer)? color_player1: color_player2;
		pen.fillRect(highlight[0], highlight[1], highlight[2], highlight[3]);
	}
}

function drawCourt(){
	pen.lineWidth = 2;
	pen.strokeStyle = color_back;
	pen.strokeRect(0, 0, w, h);
	
	pen.beginPath();
	pen.linewidth = 0.5;
	for(i = 0; i < boardSize + 1; i+=1){
		pen.moveTo(margin + i * overlap / boardSize, h);
		pen.lineTo(margin + i * overlap / boardSize, 0);
		pen.moveTo(margin, i * overlap / boardSize);
		pen.lineTo(w - margin, i * overlap / boardSize);
	}
	pen.stroke();
	pen.closePath();
	
}

function init(){
	canvas.addEventListener("mousemove", function(e){
		mouseX = e.clientX - canvas.offsetLeft;
		mouseY = e.clientY - canvas.offsetTop;
		if(mouseX < margin || mouseX > w - margin) return;
 		xs = (mouseX - margin) / unit; x = Math.floor(xs); dx = xs - x;
		ys = mouseY / unit; y = Math.floor(ys); dy = ys - y;
		if(dy < 0.25){
			if(dx > 0.25 && dx < 0.75){ //Highlight top
				if(y == 0) return;
				a = x + 0.25; b = y - 0.125; c = 0.5; d = 0.25;
				highlightIdx = y * (boardSize - 1) + x;
			}
		}
		else if(dy < 0.75){
			if(dx < 0.25){ //Highlight left
				if(x == 0 || x == boardSize) return;
				a = x - 0.125; b = y + 0.25; c = 0.25; d = 0.5;
				highlightIdx = (y + 1) * (boardSize - 1) + x + 1;
			}
			else if(dx > 0.75){ //highlight right
				if(x == (boardSize - 1)) return;
				a = x + 0.875; b = y + 0.25; c = 0.25; d = 0.5;
				highlightIdx = (y + 1) * (boardSize - 1) + x;
			}
			else highlightIdx = -1;
		}
		else if(dx > 0.25 && dx < 0.75) { //highlight bottom
			if(y == boardSize - 1) return;
			a = x + 0.25; b = y + 0.875; c = 0.5; d = 0.25;
			highlightIdx = (y + 2) * (boardSize - 1) + x;
		}
		if(highlightIdx != -1){
			highlight = [(margin + a*unit), (b*unit), (c*unit), (d*unit)];
		} else {
			highlight = undefined;
			highlightIdx = -1;
		}
	}, false);
	
	canvas.addEventListener("click", function(e){
		if(highlight){
			walls[highlightIdx] = 1;
			console.log("Todo");
			currentPlayer = ! currentPlayer;
		}
	});
	
	walls.fill(0);
	console.log(walls);
}

//In these functions, x and y belong to [0, 9], are in boardSpace instead of wallSpace
function canGoUpFromTile(x, y){
	if(y == 0) return false;
	return walls[y * (boardSize - 1) + x] == 0;
}

function canGoDownFromTile(x, y){
	if(y == boardSize - 1) return false;
	return walls[(y + 2) * (boardSize - 1) + x] == 0;
}

function canGoRightFromHere(x, y){
	if(x == 0) return false;
	return walls[(y + 1) * (boardSize - 1) + x] == 0;
}

function canGoLeftFromHere(x, y){
	if(x == boardSize - 1) return false;
	return walls[(y + 1) * (boardSize - 1) + x + 1] == 0;
}