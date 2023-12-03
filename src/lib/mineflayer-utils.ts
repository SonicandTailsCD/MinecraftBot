let bot: any;
export function setup (_bot: any) {
	bot = _bot;
}

export async function lookAtEntity (entity: any, force = false) {
	await bot.lookAt(entity.position.offset(0, entity.height, 0), force);
}
