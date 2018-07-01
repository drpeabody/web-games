
export class Animation{
	constructor(startX, endX, time, callback){
		this.startX = startX;
		this.endX = endX;
		this.time = time;
		this.startTime = Date.now();
		this.callback = callback;
	}
	
	start(){
		this.startTime = Date.now();
	}
	
	get(){
		var t = Date.now();
		if(t > this.time + this.startTime) {
			if(this.callback) this.callback();
			return this.endX;
		}
		else return this.startX + (t - this.startTime) * (this.endX - this.startX) / this.time;
	}
	
}
