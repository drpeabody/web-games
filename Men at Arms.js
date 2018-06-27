
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
	}
	
	isEnemyOf(player){
		return owner !== player;
	}
	
	getAttackAt(distance){
		return attack * Math.exp(-distance / range) * size;
	}
	
	takeDamage(attackDealt){
		health -= attackDealt / (size * armour);
		if(health <= 0) died();
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
		if(this.selectedSquad) {
			this.selectedSquad = undefined;
		}
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
	
	drawSquads(pen, sniperImage, infantryImage, squadFillStyle, mapPosX, mapPosY){
		if(this.squads.length == 0) return;
		//pen.fillStyle = squadFillStyle;
		this.squads.forEach((s) => {
			switch(s.type){
				case SQUAD_TYPE_INFANTRY:
					pen.drawImage(infantryImage, s.x - infantryImage.width/2 + mapPosX, s.y - infantryImage.height/2 + mapPosY);
					break;
				case SQUAD_TYPE_SNIPER:
					pen.drawImage(sniperImage, s.x - sniperImage.width/2 + mapPosX, s.y - sniperImage.height/2 + mapPosY);
					break;
			}
		});
		var t = this.selectedSquad;
		if(t){
			var i = (t.type === SQUAD_TYPE_INFANTRY)? infantryImage: sniperImage;
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
		}
	}
}


function draw(){
	pen.clearRect(0, 0, w, h);
	if(image) pen.drawImage(image, imageX, imageY, 4 * image.width, 4 * image.height);
	drawHUD();
	player.drawSquads(pen, image_sniper, image_infantry, "#ff0000", imageX, imageY);
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
				if(t.length == 0) player.deploySquadAt(x, y);
				else player.selectSquad(t[0]);
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
	image_sniper = document.getElementById("sniper"),
	image_infantry = document.getElementById("infantry");
var imageX = 0, imageY = 0;
var preX = 0, preY = 0;
var held = false;
const clickRadius = 64*64;
const ATTACK_INFANTRY = 5, ATTACK_SNIPER = 40, ARMOUR_INFANTRY = 10, ARMOUR_SNIPER = 2, RANGE_INFANTRY = 50, RANGE_SNIPER = 500;
const SQUAD_TYPE_INFANTRY = 'Infantry', SQUAD_TYPE_SNIPER = 'Sniper';
const HUD_SIZE = 10, HUD_COLOR = '#4286a4', HUD_FOREGROUND_COLOR = '#f5e513', HUD_PADDING = h / (3 * HUD_SIZE);
var player = new Player(1500, '#ff0000', 10);



setInterval(draw, 1000/60);
input();
