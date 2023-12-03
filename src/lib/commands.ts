import { lookAtEntity } from './mineflayer-utils.js';
import { sleep } from './sleep.js';
import pathfinderPkg from 'mineflayer-pathfinder';
import { type Bot } from 'mineflayer';
import Vec3 from 'vec3';
const { goals } = pathfinderPkg;
let bot: Bot;
export function setup (_bot: Bot): void {
	bot = _bot;
}
let target: any = null;
let player = null;
export const protectUser = null;
// 678435021: Add more here when needed
// SonicandTailsCD: Alright, I will :P
export const botStates = {
	moving: false,
	looking: false,
	mining: false,
	following: false,
	mentionedEatingWithPlayerAlready: false,
	attacking: false,
	guarding: false,
	commandMode: false,
	happy: false,
	ignore: false,
	commandTriggers: 0,
	wander: false,
	kicked: false
};

// Add here any values when needed.
export const values = {
	range: 2,
	BlocksAwayFromTarget: 3,
	entities: [],
	commandModeRange: 10,
	ignored: ""
};

export const commands = {
	async sleep () {
		try {
			console.log('Sleeping!');
			bot.chat("I'm coming :D");
			const bed = bot.findBlock({ matching: block => bot.isABed(block) });
			if (!bed) {
				console.log("Sorry, I can't find a bed!");
				return;
			}
			await bot.sleep(bed);
		} catch (err) {
			bot.chat('Sorry, I couldn\'t sleep! Please check the console log.');
			console.log(String(err?.message));
		}
	},
	async wander() {
		try {
			const maxX = 64
			const minX = -35
			const maxZ = 99
			const minZ = 1
			const locationX = Math.floor(Math.random() * (maxX - minX) + minX)
			const locationZ = Math.floor(Math.random() * (maxZ - minZ) + minZ)
			const goal = new goals.GoalGetToBlock(locationX, 205, locationZ)
			await bot.pathfinder.goto(goal)
			console.log('Gone to ' + locationX + ', 205, ' + locationZ + '. Waiting for 100 ticks...')
		}
		catch(err) {
			console.log('Error wandering, stopping wandering to avoid glitches.')
			botStates.wander = false
			return "Cannot wander."
		}
	},
	async stopWander() {
		botStates.wander = false
		bot.pathfinder.stop()
		console.warn("[WARN] Wandering stopped, pathfinding may glitch")
	},
	async location (daname: string) {
		bot.chat(daname + ", I\'m at " + bot.entity.position);
	},
	async waitForPlayerOnTrip () {
		try {
			const goal = new goals.GoalGetToBlock(-33, 205, 46)
			await bot.pathfinder.goto(goal)
			const blockPos: Vec3 = new Vec3(-37, 205, 47)
			bot.lookAt(blockPos, true)
			botStates.happy = true
			await this.happy()
		}
		catch(err) {
			bot.chat("Sorry, an error occured: " + String(err?.message))
		}
	},
	async stopMining () {
		bot.chat('Okay! I\'ll stop.');
		botStates.mining = false;
	},
	async attackPlayer (daname: string) {
		try {
			const player = bot.players[daname];
			if (!player || !player.entity) {
				bot.chat('I can\'t see you');
			} else {
				bot.chat(`Attacking ${player.username}`);
				botStates.attacking = true;
				while (botStates.attacking == true) {
					await bot.waitForTicks(5);
					bot.attack(player.entity);
				}
			}
		} catch (err) {
			bot.chat('Seems like I ran into a problem trying to attack you. I\'ll get you when I can! :)');
		}
	},
	async stopAttacking () {
		botStates.attacking = false;
		bot.chat('Okay, I won\'t attack you anymore.');
	},
	async attackEntity () {
		const entity = bot.nearestEntity();
		if (!entity) {
		  bot.chat('No nearby entities');
		} else {
		  bot.chat('Attacking ${entity.name ?? entity.username}');
		  bot.attack(entity);
		}
	},
	async eatWithPlayer (daname: string) {
		this.followMe(daname);
		if (botStates.mentionedEatingWithPlayerAlready = true) {
			console.log('Already mentioned coming to player!');
		} else {
			bot.chat('Let me come to you first! :D');
			botStates.mentionedEatingWithPlayerAlready = true;
		}
		if (botStates.looking = true) {
			const eatitem: any = bot.inventory.items().find(item => item.name === 'Suspicious Stew');
			const eatTime = 1500;
			try {
				await bot.equip(eatitem, 'hand');
				bot.chat("Sorry, I'm still being worked on. I cannot eat yet.");
			} catch (err) {
				bot.chat(String(err?.message));
			}
			bot.activateItem();
			await sleep(eatTime);
			bot.deactivateItem();
			botStates.mentionedEatingWithPlayerAlready = false;
		} else {
			bot.waitForTicks(200);
			botStates.mentionedEatingWithPlayerAlready = true;
			this.eatWithPlayer(daname);
		}
	},
	async mineAround () {
		if (botStates.mining) {
			return;
		}

		bot.chat('Anything for you! :)');

		botStates.mining = true;
		while (botStates.mining) {
			await bot.waitForTicks(1);
			const grassBlock = bot.findBlock({
				matching: block => {
					return block.name === 'grass' || block.name === 'tall_grass';
				}
			});

			if (!grassBlock) {
				console.log("Couldn't find grass.");
				await sleep(100);
				continue;
			}

			try {
				await bot.pathfinder.goto(
					new goals.GoalLookAtBlock(
						grassBlock.position, bot.world, {
							reach: 2.5,
							entityHeight: bot.player.entity.height
						}
					)
				);
			} catch (e) {
				continue;
			}

			await bot.dig(grassBlock, true);
		}
	},
	async speakProtect () {
		bot.chat('Coming now :D');
	},
	async resetViewingLocation () {
		console.log(bot.entity.height);
		const location1 = new Vec3(~360, ~5, ~0);
		const location2 = new Vec3(~0, ~5, ~-360);
		await bot.lookAt(location1, true);
		await bot.waitForTicks(40);
		await bot.lookAt(location2, true);
		bot.setControlState('forward', true);
		await bot.waitForTicks(20);
		bot.setControlState('forward', false);
	},
	async protectMe (daname: string) {
		botStates.guarding = true;
		if (botStates.following = true) {
			console.log('Already following a player, skipping follow activation!');
			if (player = !daname) {
				bot.chat('You\'re not the one I\'m following! I\'m not obeying you. >:(');
				return;
			}
			const protectUser = daname;
			this.speakProtect();
		} else {
			console.log('Since the bot isn\'t following anything, the bot will begin following ' + daname);
			this.followMe(daname);
			this.speakProtect();
			const player = bot.players[daname];
			const protectUser = player;
		}
		bot.on('entityHurt', async (entity) => {
			target = entity;
			try {
				if (botStates.attacking == true) return;
				if (target.username !== protectUser) return;
				botStates.attacking = true;
				await bot.setControlState('forward', true);
				await bot.setControlState('sprint', true);
				const location = target.position;
				botStates.guarding = false;
				while (botStates.attacking == true) {
					botStates.following = false;
					await bot.waitForTicks(5);
					let distance = bot.entity.position.xzDistanceTo(location);
					while (distance = values.BlocksAwayFromTarget) {
						await bot.attack(target);
						bot.lookAt(location);
					}
				}
			} catch (err) {
				console.log('The bot wasn\'t able to help ' + protectUser + ' fight! :(');
			}
		});
		bot.on('entityGone', async (entity) => {
			if (entity == target) {
				botStates.attacking = false;
				botStates.guarding = true;
				botStates.following = true;
			} else return;
		});
	},
	async happy () {
		if (botStates.happy == true) {
			bot.setControlState('sneak', true);
			await bot.waitForTicks(4);
			bot.swingArm('right');
			await bot.waitForTicks(4);
			bot.setControlState('sneak', false);
			await bot.waitForTicks(4);
			bot.swingArm('right');
			await bot.waitForTicks(4);
			bot.setControlState('sneak', true);
			await bot.waitForTicks(4);
			bot.swingArm('right');
			await bot.waitForTicks(4);
			bot.setControlState('sneak', false);
			await bot.waitForTicks(4);
			bot.swingArm('right');
			await bot.waitForTicks(4);
			bot.setControlState('sneak', true);
			await bot.waitForTicks(4);
			bot.swingArm('right');
			await bot.waitForTicks(4);
			bot.setControlState('sneak', false);
			await bot.waitForTicks(4);
			bot.swingArm('right');
			await bot.waitForTicks(4);
			bot.setControlState('sneak', true);
			await bot.waitForTicks(4);
			bot.swingArm('right');
			await bot.waitForTicks(4);
			bot.setControlState('sneak', false);
			await bot.waitForTicks(4);
			bot.swingArm('right');
			await bot.waitForTicks(4);
			bot.setControlState('sneak', false);
			await bot.waitForTicks(4);
			bot.swingArm('right');
			await bot.waitForTicks(4);
			bot.setControlState('sneak', true);
			await bot.waitForTicks(4);
			bot.setControlState('sneak', false);
			await bot.waitForTicks(4);
			bot.swingArm('right');
			await bot.waitForTicks(4);
			bot.setControlState('sneak', true);
			await bot.waitForTicks(4);
			bot.swingArm('right');
			bot.setControlState('sneak', false);
		}
		botStates.happy = false;
	},
	async followMe (daname: string) {
		botStates.happy = true;
		await this.happy();
		botStates.following = true;

		const player = bot.players[daname];
		if (botStates.moving) {
			bot.chat("Sorry, can't run this command more than once!");
		}
		botStates.moving = true;

		if (!player?.entity) {
			bot.chat("I can't see you, " + daname);
			botStates.moving = false;
			return;
		}

		bot.chat('Sure, I\'d be glad to follow you, ' + daname + '! :)');

		while (botStates.following) {
			try {
				if (bot.entity.position.distanceTo(player.entity.position) + 0.15 <= values.range) {
					await lookAtEntity(player.entity, true);
					botStates.looking = true;
					bot.setControlState('sprint', false);
				} else {
					botStates.looking = false;
					bot.setControlState('sprint', true);
				}
				await sleep(200);
				const goal = new goals.GoalFollow(player.entity, values.range);
				await bot.pathfinder.goto(goal);
			} catch (err) {
				console.log(String(err?.message));
				bot.chat('Sorry, I\'ve ran into an error. I can\'t keep following you. Please run that command again :)');
				return;
			}
		}
	},
	async followMeLooseMode (daname: string) {
		botStates.following = true;

		const target = bot.players[daname]?.entity;
		if (botStates.moving) {
			bot.chat("Sorry, can't run this command more than once!");
		}
		botStates.moving = true;
		const {x: playerX, y: playerY, z: playerZ } = target.position;
		if (!target) {
			bot.chat("I can't see you, " + daname);
			botStates.moving = false;
			return;
		}
		bot.chat('Okay ' + daname);
		while (botStates.following) {
			try {
				bot.lookAt(target.position.offset(0, bot.entity.height, 0), true);
				await sleep(200);
				if (bot.entity.position.distanceTo(target.position) + 0.15 <= values.range) {
					bot.setControlState('forward', false);
					bot.setControlState('sprint', false);
					bot.setControlState('jump', false);
				} else {
					bot.setControlState('forward', true);
					bot.setControlState('sprint', true);
					bot.setControlState('jump', true);
				}
			} catch (err) {
				console.log(String(err?.message));
			}
		}
	},
	unFollowMe () {
		if (!botStates.moving) {
			return;
		}
		botStates.moving = false;
		botStates.following = false;
		bot.pathfinder.stop();
	}
};
