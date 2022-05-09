const {MessageEmbed} = require('discord.js');
module.exports = {
    name: 'avatar',
    aliases: [],
    description: 'Mostra o avatar do usuário',
    guildOnly: true,
    execute: (message, args) => {
        const user = message.mentions.users.first() || message.author;
        const avatar = user.displayAvatarURL( {format: 'png', dynamic: true, size: 4096});
        
        const embed = new MessageEmbed()
            .setTitle(`📷 Avatar de ${user.username}`)
            .setColor("#FFFFFF")
            .setImage(avatar)
            .setURL(`${avatar}`)
            .addField("Solicitado por:", `${message.author}`)
            .setFooter(message.author.username)
            .setTimestamp()

        message.channel.send(embed);
    } 
}