
class Animation{
	constructor(startX, endX, time, callback){
		this.startX = startX;
		this.endX = endX;
		this.time = time;
		this.startTime = this.getTime();
		this.callback = callback;
	}
	
	start(){
		this.startTime = this.getTime();
	}
	
	get(){
		var t = this.getTime();
		if(t > this.time + this.startTime) {
			if(this.callback) this.callback();
			return this.endX;
		}
		else return this.startX + (t - this.startTime) * (this.endX - this.startX) / this.time;
	}
	
	getTime(){
		return TIME;
	}
	
}

class Squad{
	//Map Space X Y
	constructor(x, y, size, ownerPlayer, type){
		this.health = 100;
		this.owner = ownerPlayer;
		this.x = x;
		this.y = y;
		this.size = size;
		this.type = type;
		if(type == SQUAD_TYPE_SNIPER){
			this.attack = ATTACK_SNIPER;
			this.armour = ARMOUR_SNIPER;
			this.range = RANGE_SNIPER;
		}
		else{
			this.attack = ATTACK_INFANTRY;
			this.armour = ARMOUR_INFANTRY;
			this.range = RANGE_INFANTRY;	
		}
		this.anim = new Animation(0, 1, SQUAD_SPAWN_TIME, undefined);
		this.shot = new Animation(1, 0, SQUAD_ATTACK_LINGER_TIME, () => {
			this.shouldDrawShot = false;
		});
		this.shouldDrawShot = false;
		this.attackPoint = {x: 0, y: 0};
	}
	
	draw(pen, mapPosX, mapPosY){
		var img = (this.type == SQUAD_TYPE_INFANTRY) ? IMAGE_INFANTRY : IMAGE_SNIPER;
		var size = this.anim.get() * img.width;
		if(this.shouldDrawShot){
			pen.beginPath();
			pen.strokeStyle = 'rgba(' + SHOT_COLOR.r + ', ' + SHOT_COLOR.g + ', ' + SHOT_COLOR.b + ', ' + this.shot.get() + ')';
			pen.lineWidth = SHOT_WIDTH;
			pen.moveTo(this.x + mapPosX,  this.y + mapPosY);
			pen.lineTo(this.attackPoint.x + mapPosX, this.attackPoint.y + mapPosY);
			pen.stroke();
			pen.closePath();
		}
		pen.drawImage(img, this.x - size/2 + mapPosX, this.y - size/2 + mapPosY, size, size);
		pen.globalCompositeOperation = 'source-atop';
		pen.fillRect(this.x - size/2 + mapPosX, this.y - size/2 + mapPosY, size, size);
		pen.globalCompositeOperation = 'source-over';
	}
	
	isEnemyOf(player){
		return owner !== player;
	}
	
	getAttackAt(distance){
		return this.attack * Math.exp(-distance / this.range) * this.size;
	}
	
	takeDamage(attackDealt){
		this.health -= attackDealt / (this.size * this.armour);
		if(this.health <= 0) this.died();
	}
	
	attackEnemySquad(squad){
		if(squad.owner === this.owner) return;
		squad.takeDamage(this.getAttackAt(Math.sqrt(
			(this.x - squad.x) * (this.x - squad.x) + (this.y - squad.y) * (this.y - squad.y)
			)));
		this.shouldDrawShot = true;
		this.attackPoint = {x: squad.x, y: squad.y};
		this.shot.start();
	}
	
	died(){
		console.log('Squad.died(): Todo');
	}
}

class Player{
	constructor(numSoldiers, color, squadSizeSetting){
		this.numSoldiers = numSoldiers;
		this.color = color;
		this.squadSizeSetting = squadSizeSetting;
		this.selectedSquad = undefined;
		this.squadTypeSetting = SQUAD_TYPE_INFANTRY;
		this.squads = [];
	}
	
	selectSquad(squad){
		if(squad instanceof Squad)
			if(squad.owner === this){
				this.selectedSquad = squad;
			}
	}
	
	deselectSquad(){
		this.selectedSquad = undefined;
	}
	
	deploySquadAt(x, y){
		if(this.squadSizeSetting > this.numSoldiers) return;
		var squad = new Squad(x, y, this.squadSizeSetting, this, this.squadTypeSetting);
		this.numSoldiers -= this.squadSizeSetting;
		this.squads.push(squad);
	}
	
	getSquadsAt(x, y){
		return this.squads.filter((s) => {
			return ((s.x-x)*(s.x-x) + (s.y-y)*(s.y-y) < clickRadius);
		});
	}
	
	drawSquads(pen, mapPosX, mapPosY){
		if(this.squads.length == 0) return;
		pen.fillStyle = this.color;
		this.squads.forEach((s) => { s.draw(pen, mapPosX, mapPosY); });
		var t = this.selectedSquad;
		if(t){
			var i = (t.type === SQUAD_TYPE_INFANTRY)? IMAGE_INFANTRY: IMAGE_SNIPER;
			var x = t.x - i.width/2 + mapPosX, y = t.y - i.height/2 + mapPosY;
			var fs = 3 * i.height / HUD_SIZE;
			pen.lineWidth = 5;
			pen.strokeStyle = HUD_FOREGROUND_COLOR;
			pen.strokeRect(x, y, i.width, i.height);
			pen.fillStyle = HUD_FOREGROUND_COLOR;
			pen.font = fs + "px Georgia";
			pen.fillText("Health: " + t.health, x, y + i.height + fs);
			pen.fillText("Attack: " + t.attack, x, y + i.height + 2 * fs);
			pen.fillText("Armour: " + t.armour, x, y + i.height + 3 * fs);
			pen.fillText("Soldiers: " + t.size, x, y + i.height + 4 * fs);
			pen.beginPath();
			pen.lineWidth = 1;
			pen.arc(x + i.width/2, y + i.height/2, t.range, 0, 6.284);
			pen.stroke();
			pen.closePath();
		}
	}
}


function draw(){
	TIME++;
	pen.clearRect(0, 0, w, h);
	
	player.drawSquads(pen, imageX, imageY);
	enemy.drawSquads(pen, imageX, imageY);
	
	pen.globalCompositeOperation = 'destination-over';
	pen.drawImage(image, imageX, imageY, 4 * image.width, 4 * image.height);
	pen.globalCompositeOperation = 'source-over';
	drawHUD();
}

function drawHUD() {
	pen.fillStyle = HUD_COLOR;
	pen.fillRect(0, h - h / HUD_SIZE, w, h);
	pen.fillStyle = HUD_FOREGROUND_COLOR;
	pen.font = (h / HUD_SIZE - 2*HUD_PADDING) + "px Georgia";
	pen.fillText("Soldiers Left: " + player.numSoldiers, HUD_PADDING, h - HUD_PADDING);
	pen.fillText("Squad Type To Deploy: " + player.squadTypeSetting, 2 * HUD_PADDING + w / 3, h - HUD_PADDING);
	pen.fillText("Size of Sqaud to Deploy: " + player.squadSizeSetting, 3 * HUD_PADDING + 2 * w / 3, h - HUD_PADDING);
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
							player.selectedSquad.attackEnemySquad(s[0]);
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
				player.squadTypeSetting = (player.squadTypeSetting == SQUAD_TYPE_SNIPER)? SQUAD_TYPE_INFANTRY: SQUAD_TYPE_SNIPER;
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

var w = canvas.width, h = canvas.height;
var image = document.getElementById("back"),
	IMAGE_SNIPER = document.getElementById("sniper"),
	IMAGE_INFANTRY = document.getElementById("infantry");
var imageX = 0, imageY = 0;
var preX = 0, preY = 0;
var held = false;
const clickRadius = 64*64;
const ATTACK_INFANTRY = 50, ATTACK_SNIPER = 40, ARMOUR_INFANTRY = 10, ARMOUR_SNIPER = 2, RANGE_INFANTRY = 150, RANGE_SNIPER = 500;
const SQUAD_TYPE_INFANTRY = 'Infantry', SQUAD_TYPE_SNIPER = 'Sniper';
const HUD_SIZE = 10, HUD_COLOR = '#4286a4ff', HUD_FOREGROUND_COLOR = '#f5e513ff', HUD_PADDING = h / (3 * HUD_SIZE);
const SQUAD_SPAWN_TIME = 10, SQUAD_ATTACK_LINGER_TIME = 25;
const SHOT_COLOR = {r: 0.5, g: 0.5, b: 0.5}, SHOT_WIDTH = 5;

const player = new Player(150, '#00ff0077', 10), enemy = new Player(150, '#ff000077', 10);


var TIME = 0;

enemy.deploySquadAt(160, 250);
enemy.deploySquadAt(250, 250);
enemy.deploySquadAt(560, 550);

setInterval(draw, 1000/60);
input();
