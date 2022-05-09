const fs = require('fs');
const Discord = require('discord.js');
require('dotenv').config();
require('discord-reply');
const {prefix, token} = require('./config.json');

const client = new Discord.Client( { ws: {intents: 641}} );
client.commands = new Discord.Collection();

const commandFolders = fs.readdirSync('./commands');

for (const folder of commandFolders) {
    const commandFiles = fs.readdirSync(`./commands/${folder}`).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const command = require(`./commands/${folder}/${file}`);
        client.commands.set(command.name, command);
    }
}

client.once('ready', () => {
    client.user.setPresence({
        status: "online",
        activity: {
            name: "Comendo quem ta lendo"
        }
    })
});

client.on('message', async message => {

    if (message.author.id == '666412198658310157') {
        const chance = Math.floor(Math.random() * 3);

        if (chance == 1) {
            const phrases = [/*'Cala a boca, gostosa', */'Da uma sugada aqui vaikkkkk', 'Tá achando que engana quem, vadia?', 
            'Você está devendo uma mamada para todos do Server :banana:', 'O cara usa invisívelKKKKK'];
            const index = Math.floor(Math.random() * phrases.length);

            message.lineReply(phrases[index]);
        }
    }

    if (!message.content.startsWith(prefix)|| message.author.bot) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    const command = client.commands.get(commandName)
		|| client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));


	if (!command) return;

    if (command.guildOnly && message.channel.type === 'dm') {
        return;
    }

    if (command.args && !args.length) {
        let reply = `Você não inseriu nenhum argumento, ${message.author}!`;
        
        if (command.usage) {
            reply += `\nA maneira certa de usar esse comando é: \`${prefix}${command.name} ${command.usage}\``;
        }

        return message.channel.send(reply);
    }

    try {
        command.execute(message, commandName, args);
    } catch (error) {
        console.error(error);
        message.reply('Ocorre um erro ao executar o comando!');
    }
    /*message.delete({ timeout: 1000 });*/
})

try {
    client.login(process.env.BOTTOKKEN);
} catch (error) {
    console.log(error);
}
