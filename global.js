
export const 
 ATTACK_INFANTRY = 50, ATTACK_SNIPER = 40, ARMOUR_INFANTRY = 10, ARMOUR_SNIPER = 2, RANGE_INFANTRY = 150, RANGE_SNIPER = 500,

 SQUAD_TYPE_INFANTRY = 'Infantry', SQUAD_TYPE_SNIPER = 'Sniper',

 SQUAD_SPAWN_TIME = 100, SQUAD_ATTACK_LINGER_TIME = 1000,

 SHOT_COLOR = {r: 0.5, g: 0.5, b: 0.5}, SHOT_WIDTH = 5,

 CLICK_RADIUS = 64*64,

 HUD_SIZE = 10, HUD_COLOR = '#4286a4ff', HUD_FOREGROUND_COLOR = '#f5e513ff', HUD_PADDING = 1 / (3 * HUD_SIZE),

 IMAGE_SNIPER = document.getElementById("sniper"),
 IMAGE_INFANTRY = document.getElementById("infantry");

export function drawHUD(pen, w, h, player) {
	var pad = h * HUD_PADDING;
	pen.fillStyle = HUD_COLOR;
	pen.fillRect(0, h - h / HUD_SIZE, w, h);
	pen.fillStyle = HUD_FOREGROUND_COLOR;
	pen.font = (h / HUD_SIZE - 2*pad) + "px Georgia";
	pen.fillText("Soldiers Left: " + player.numSoldiers, pad, h - pad);
	pen.fillText("Squad Type To Deploy: " + player.squadTypeSetting, 2 * pad + w / 3, h - pad);
	pen.fillText("Size of Sqaud to Deploy: " + player.squadSizeSetting, 3 * pad + 2 * w / 3, h - pad);
}