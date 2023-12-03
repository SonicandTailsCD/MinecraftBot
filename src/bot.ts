// Here I tell node.js mineflayer and a few other plugins are required to load
import { createBot } from 'mineflayer';
import pathfinderPkg from 'mineflayer-pathfinder';
import { botStates, values, commands, setup as setupCmds } from './lib/commands.js';
import { setup as setupMfUtils, lookAtEntity } from './lib/mineflayer-utils.js';
const { pathfinder, Movements } = pathfinderPkg;

// Here, we set up the server connection (in this case, my skin plugin server)
console.log('Registering the bot and allowing node to control it...');
export const options = {
	host: 'SonicJavaBots.aternos.me',
	port: 37867,
	username: 'SonicandTailsCDb',
	version: '1.18.2'
}
export const bot = createBot(options);
const kickMessage: string = "Hey, why'd I get kicked, bro?" 
const ownersList = ['SonicandTailsCD', 'SonicandTailsCD1', 'SonicandTailsCDt', '678435921'];
console.log('Bot client initialized!');
console.log('Node.JS can control the bot now.');
console.log('Setting up MfUtils and Cmds');
setupMfUtils(bot);
setupCmds(bot);
console.log('Done :)');

// Setup pathfinder
console.log('Setting up pathfinder...');
bot.loadPlugin(pathfinder);
const movements = new Movements(bot, bot.registry);
bot.pathfinder.setMovements(movements);
bot.pathfinder.thinkTimeout = 10000;
bot.pathfinder.tickTimeout = 22;
console.log('Done :)');

// And now, we work on the AI here!
// Here's all of the functions:
// One note tho: All functions are placeholders.
// function onPhysicsTick (): void {}

console.log('Registering function...');
function onSpawn (): void {
	console.log('Bot initialized completely :)');
	
	try {
		if (botStates.kicked == true) {
			bot.chat(kickMessage)
			botStates.kicked = false
		}
		else bot.chat("Hey! I'm working properly :D");
	}
	catch (err) {
		bot.chat("And once again I ran into an error... great.")
	}
	bot.on('chat', async (daname, msg) => {
		if (daname === 'SkinsRestorer') return;
		console.log(daname + ' said: ' + msg);
		if (botStates.ignore == true) {
			if (daname == values.ignored) {
				bot.chat("I'm not responding to that. >:(")
				return;
			}
		}
		if (msg === 'hello') {
			bot.chat('Hi! :)');
		}
		if (msg === 'Where are you, bot?') {
			console.log('Bot is giving its location to ' + daname + '!');
			commands.location(daname);
		}
		if (msg === 'Hey, bot?') {
            const player = bot.players[daname];
            try {
                if (bot.entity.position.distanceTo(player.entity.position) + 0.15 <= values.commandModeRange) {
                    bot.chat('What\'s up? :)');
                    await bot.waitForTicks(10);
                    botCommandMode(daname);
                }
                else {
                    await bot.chat('/execute as ' + daname + ' at @s run tp ' + bot.username + ' ^ ^ ^-1 facing entity ' + daname);
                    await bot.waitForTicks(20);
                    bot.chat('What\'s up? :)');
                    await bot.waitForTicks(20);
                    botCommandMode(daname);
                }
            }
            catch(err) {
                bot.chat('HAHAHAHA something went wrong! Please try again :P')
            }
        }
		if (msg === 'What\'s the current state of botStates.commandMode?') {
			if (botStates.commandMode) {
				bot.chat("It\'s set to true :)");
			} else {
				bot.chat("It\'s set to false :)");
			}
		}
		if (msg === 'hey') {
			bot.chat('what you want?');
			console.log('I said: what you want?');
		}
		if (msg === 'I farted') {
			bot.chat('That\'s great! Don\'t tell me you pooped yourself tho. That\'s GROSS');
		}
	});
	bot.on('kicked', async() => {
		const bot = createBot(options)
		botStates.kicked = true
		await onSpawn()
		return
	})
}
export async function botCommandMode (daname: string) {
	await bot.waitForTicks(20)
	botStates.commandTriggers + 1
	console.log(botStates.commandTriggers)
	botStates.commandMode = true;
	bot.once('chat', async (thename, message) => {
		botStates.commandMode = false
		if (thename == bot.username) {
			bot.chat("Seems I got stuck with my own response. Go ahead, send your request again :D")
			bot.waitForTicks(40)
			botCommandMode(daname)
			return;
		}
		if (thename != daname) {
			bot.chat('I\'m confused :(');
			return;
		}
		if (message === 'Attempt to reset botStates.commandMode to false') {
			bot.chat('Sure :)');
			try {
				botStates.commandMode = false;
			} catch (err) {
				bot.chat('I wasn\'t able to reset it. Sorry ' + thename + ' :(');
			}
			return;
		}
		if (message === 'follow me') {
			while (commands.followMe(daname)) {
				console.log('I started following ' + daname);
				return;
			}
		}
		if (message === "Ignore someone..") {
			bot.chat("Say the name of the person you'd like me to ignore. :)")
			await bot.waitForTicks(100)
			botIgnoreMode(daname, message)
			return;
		}
		if (message === "Stop ignoring someone..") {
			bot.chat("Say the name of the person you'd like me to stop ignoring. :)")
			botIgnoreMode(daname, message)
		}
		if (message === 'attack me') {
			const message = 'Alright, run while you still can!';
			bot.chat(message);
			commands.attackPlayer(daname);
			return;
		}
		if (message === 'Stop attacking me') {
			commands.stopAttacking();
			return;
		}
		if (message === 'attack any entity') {
			commands.attackEntity();
			return;
		}
		if (message === 'Who made you?') {
			bot.chat('Well, I was made by SonicandTailsCD and 678435021. It\'s awesome that SonicandTailsCD and 678435021 collaborated! I believe they\'re here, here you go: ');
			await bot.waitForTicks(200);
			bot.chat('/tp @a[tag=owner] ' + thename);
			bot.chat('Have fun :)');
			bot.whisper('@a[tag=owners]', 'Seems like ' + thename + ' wants to speak with you! :)');
			return;
		}
		if (message === 'Say hi to SonicandTailsCD') {
			bot.chat("Oh, I'm sorry! Hi SonicandTailsCD! :)");
			return;
		}
		if (message === 'Say hi to 678435021') {
			bot.chat("Oh, I'm sorry! Hi 678435021! :)");
			return;
		}
		if (message === 'stop following me') {
			commands.unFollowMe();
			console.log('I stopped following ' + daname);
			return;
		}
		if (message === 'Stop server') {
			switch (thename) {
				case 'SonicandTailsCD':
				case 'SonicandTailsCD1':
				case 'SonicandTailsCDt':
				case '678435021':
					bot.chat('Okay!');
					await bot.waitForTicks(60);
					bot.chat('/stop');
					return;
			}
			bot.chat('I\'m sorry, but I can\'t do that. Ask an admin to stop the server or ask an admin to give you permission. :(');
			return;
		}
		if (message === 'Reset your viewing location') {
			await bot.chat('Sure, I\'ll do that :)');
			await bot.waitForTicks(10);
			commands.resetViewingLocation();
			return;
		}
		if (message === "I'm going out on a trip... I want you to stop following me now.") {
			await bot.waitForTicks(20)
			bot.chat("Awe :(")
			await bot.waitForTicks(30)
			bot.chat("Stay safe, alright?")
			await commands.waitForPlayerOnTrip()
			bot.chat("I will wait for you here!")
			bot.chat("Bye :)")
			return;
		}
		if (message === 'Sleep with me :)') {
			await commands.sleep();
			return;
		}
		if (message === 'wander around.') {
			while (botStates.wander == true) {
				await commands.wander()
			}
		}
		if (message === 'Stop wandering') {
			console.log('Understood. Stopping bot...')
			bot.chat('Sure, stopping...')
			await commands.stopWander()
			return;
		}
		if (message === 'eat with me') {
			commands.eatWithPlayer(daname);
			return;
		}
		if (message === "Set your skin") {
			bot.chat('/skin set SonicandTailsCDb robot1_alextest');
			bot.chat('Applied :)')
		}
		if (message === 'What\'s the current state of botStates.commandMode?') {
			if (botStates.commandMode) {
				bot.chat("It\'s set to true :)");
			} else {
				bot.chat("It\'s set to false :)");
			}
			return;
		}
		if (message === 'CLEEANN!') {
			await commands.mineAround();
			return;
		}
		if (message === 'Stop cleaning') {
			await commands.stopMining();
			return;
		}
		if (message === 'Protect me :)') {
			try {
				commands.protectMe(daname);
			} catch (err) {
				console.log(String(err?.message));
			}
			console.log('Bot instructed to protect ' + daname + ', obeying player...');
			return;
		}
		if (message === 'Follow me in loose mode') {
			bot.chat('Sure :)');
			while (commands.followMeLooseMode(daname)) {
				console.log('I started following ' + daname + ' in loose mode');
				return;
			}
			return;
		} else {
			bot.chat('I\'m sorry, I can\'t understand your prompt :(');
			return;
		}
	});
}
export function botIgnoreMode(daname: string, message: string) {
	if (message == "Ignore someone...") {
		bot.once('chat', async (fartname, savemessage) => {
			bot.chat(savemessage + " will be ignored. :)")
			values.ignored = savemessage
			botStates.ignore = true
			return;
		})
	}
	else if (message == "Stop ignoring someone...") {
		bot.once('chat', async (fartname, savemessage) => {
			bot.chat(savemessage + " will stop being ignored. :)")
			values.ignored = ""
			botStates.ignore = false
			return;
		})
	}
}
console.log('Done :)');

// I'm unsure on how am I gonna use onPhysicsTick function but I'll leave it there in case me or @678435021 wanna use it.
// bot.on('physicsTick', onPhysicsTick);

// Next, I'm gonna set spawn actions.
console.log('Running now!');
bot.once('spawn', onSpawn);

