const fetch = require('node-fetch');
const {MessageEmbed} = require('discord.js');
module.exports = {
    name: 'gif',
    aliases: [],
    description: 'Pesquisa gifs com base no que foi pedido',
    args: true,
    usage: '<nome do gif>',
    guildOnly: true,
    execute: (message, args) => {
        const search = args[0];
        
        async function gif() {
            let url = `https://g.tenor.com/v1/search?q=${search}&key=${process.env.TENORKEY}&limit=32`;
            let response = await fetch(url);
            let json = await response.json();

            let index = Math.floor(Math.random() * json.results.length);
            message.channel.send(`${json.results[index].itemurl}`);
        }
        gif();
    }
}