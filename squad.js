
import * as globals from './global.js';
import { Animation } from './animation.js';

export class Squad{
	//Map Space X Y
	constructor(x, y, size, ownerPlayer, type){
		this.health = 100;
		this.owner = ownerPlayer;
		this.x = x;
		this.y = y;
		this.size = size;
		this.type = type;
		if(type == globals.SQUAD_TYPE_SNIPER){
			this.attack = globals.ATTACK_SNIPER;
			this.armour = globals.ARMOUR_SNIPER;
			this.range = globals.RANGE_SNIPER;
		}
		else{
			this.attack = globals.ATTACK_INFANTRY;
			this.armour = globals.ARMOUR_INFANTRY;
			this.range = globals.RANGE_INFANTRY;	
		}
		this.anim = new Animation(0, 1, globals.SQUAD_SPAWN_TIME, undefined);
		this.shot = new Animation(1, 0, globals.SQUAD_ATTACK_LINGER_TIME, () => {
			this.shouldDrawShot = false;
		});
		this.shouldDrawShot = false;
		this.attackPoint = {x: 0, y: 0};
	}
	
	draw(pen, mapPosX, mapPosY){
		var img = (this.type == globals.SQUAD_TYPE_INFANTRY) ? globals.IMAGE_INFANTRY : globals.IMAGE_SNIPER;
		var size = this.anim.get() * img.width;
		if(this.shouldDrawShot){
			pen.beginPath();
			pen.strokeStyle = 'rgba(' + globals.SHOT_COLOR.r + ', ' + globals.SHOT_COLOR.g + ', ' + globals.SHOT_COLOR.b + ', ' + this.shot.get() + ')';
			pen.lineWidth = globals.SHOT_WIDTH;
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
		this.health -= Math.ceil(attackDealt / (this.size * this.armour));
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