
import * as globals from './global.js';
import { Squad } from './squad.js';

export class Player{
	constructor(numSoldiers, color, squadSizeSetting){
		this.numSoldiers = numSoldiers;
		this.color = color;
		this.squadSizeSetting = squadSizeSetting;
		this.selectedSquad = undefined;
		this.squadTypeSetting = globals.SQUAD_TYPE_INFANTRY;
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
	
	deploySquadAt(x, y, time){
		if(this.squadSizeSetting > this.numSoldiers) return;
		var squad = new Squad(x, y, this.squadSizeSetting, this, this.squadTypeSetting, time);
		this.numSoldiers -= this.squadSizeSetting;
		this.squads.push(squad);
	}
	
	getSquadsAt(x, y){
		return this.squads.filter((s) => {
			return ((s.x-x)*(s.x-x) + (s.y-y)*(s.y-y) < globals.CLICK_RADIUS);
		});
	}
	
	drawSquads(pen, mapPosX, mapPosY, time){
		if(this.squads.length == 0) return;
		pen.fillStyle = this.color;
		this.squads.forEach((s) => { s.draw(pen, mapPosX, mapPosY, time); });
		var t = this.selectedSquad;
		if(t){
			var i = (t.type === globals.SQUAD_TYPE_INFANTRY)? globals.IMAGE_INFANTRY: globals.IMAGE_SNIPER;
			var x = t.x - i.width/2 + mapPosX, y = t.y - i.height/2 + mapPosY;
			var fs = 3 * i.height / globals.HUD_SIZE;
			pen.lineWidth = 5;
			pen.strokeStyle = globals.HUD_FOREGROUND_COLOR;
			pen.strokeRect(x, y, i.width, i.height);
			pen.fillStyle = globals.HUD_FOREGROUND_COLOR;
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