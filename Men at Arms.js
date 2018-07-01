import { Animation } from './animation.js';
import * as globals from './global.js';
import { Squad } from './squad.js';
import { Player } from './player.js';

function draw(){
	pen.clearRect(0, 0, w, h);
	
	enemy.drawSquads(pen, imageX, imageY);
	player.drawSquads(pen, imageX, imageY);
	
	pen.globalCompositeOperation = 'destination-over';
	pen.drawImage(image, imageX, imageY, image.width, image.height);
	pen.globalCompositeOperation = 'source-over';
	globals.drawHUD(pen, w, h, player);
}



function input(){
	document.addEventListener("mousedown", (e) => {
		switch(e.button){
			case 0: //Left Click
				held = true;
				preX = (e.clientX - canvas.offsetLeft) - imageX;
				preY = (e.clientY - canvas.offsetTop) - imageY;
				break;
			case 2: //Right Click
				var x = e.pageX - canvas.offsetLeft - imageX, y = e.pageY - canvas.offsetTop - imageY;
				var t = player.getSquadsAt(x, y);
								
				if(t.length == 0) {
					var s = enemy.getSquadsAt(x, y);
					if(s.length == 0){
						if(player.selectedSquad) player.deselectSquad();
						else player.deploySquadAt(x, y);
					}
					else{
						if(player.selectedSquad){
							if(player.selectedSquad.owner === player){
								player.selectedSquad.attackEnemySquad(s[0]);
							}
							else if(player.selectedSquad === s[0]){
								player.deselectSquad();
							}
							else player.selectedSquad = s[0];
						}
						else player.selectedSquad = s[0];
					}
				}
				else{
					if(player.selectedSquad === t[0]) player.deselectSquad();
					else player.selectedSquad = t[0];
				}
				break;
		}
	}, false);

	document.addEventListener("mouseup", () => {
		held = false;
	}, false);

	document.addEventListener("mousemove", (e) => {
		if(held){
			imageX = (e.clientX - canvas.offsetLeft) - preX;
			imageY = (e.clientY - canvas.offsetTop) - preY;
		}
	}, false);
	
	document.addEventListener("keydown", (e) => {
		switch(e.keyCode){
			case 65: //a
				player.squadTypeSetting = (player.squadTypeSetting == globals.SQUAD_TYPE_SNIPER)? globals.SQUAD_TYPE_INFANTRY: globals.SQUAD_TYPE_SNIPER;
				break;
			case 81: //q
				player.squadSizeSetting++;
				break;
			case 87: //w
				if(player.squadSizeSetting > 1) player.squadSizeSetting--;
				break;
			case 27: //Esc
				player.deselectSquad();
				break;
		}
	}, false);
}

var canvas = document.getElementById("canvas");
var pen = canvas.getContext("2d");

var image = document.getElementById("back");

var w = canvas.width, h = canvas.height;


var imageX = 0, imageY = 0;
var preX = 0, preY = 0;
var held = false;

const player = new Player(150, '#14F06Fff', 10), enemy = new Player(150, '#DB3832ff', 10);

enemy.deploySquadAt(250, 314);
enemy.squadTypeSetting = globals.SQUAD_TYPE_SNIPER;
enemy.deploySquadAt(250, 250);
enemy.deploySquadAt(560, 550);

input();
setInterval(draw, 1000/60);
