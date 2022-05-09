const ytdl = require('ytdl-core');
const ytSearch = require('yt-search');
const { MessageEmbed } = require('discord.js');

const queue = new Map();

module.exports = {
    name: 'play',
    aliases: ['skip', 'stop'],
    execute: async (message, commandName, args) => {
        const voiceChannel = message.member.voice.channel;
        const serverQueue = queue.get(message.guild.id);

        if (commandName == 'play') {
            let song = {};
            if (ytdl.validateID(args[0])) {
                const songInfo = await ytdl.getInfo(args[0]);
                song = { title: songInfo.videoDetails.title, url: songInfo.videoDetails.url, thumbnail: songInfo.videoDetails.thumbnail, duration: songInfo.videoDetails.lengthSeconds, requiredBy: message.author };
            } else {
                const videoFinder = async (query) => {
                    const videoResult = await ytSearch(query);

                    return (videoResult.videos.length > 1) ? videoResult.videos[0] : null;
                }

                const video = await videoFinder(args.join(' '));

                if (video) {
                    song = { title: video.title, url: video.url, thumbnail: video.thumbnail, duration: video.duration.timestamp, requiredBy: message.author };
                } else {
                    message.channel.send('Error finding video.');
               }
            }

            if (!serverQueue) {

                const queueConstructor = {
                    voiceChannel: voiceChannel,
                    textChannel: message.channel,
                    connection: null,
                    songs: []
                }

                queue.set(message.guild.id, queueConstructor);
                queueConstructor.songs.push(song);

                try {
                    const connection = await voiceChannel.join();
                    queueConstructor.connection = connection;
                    audioPlayer(message.guild, queueConstructor.songs[0]);
                } catch (err) {
                    queue.delete(message.guild.id);
                    throw err;
                }
            } else {
                serverQueue.songs.push(song);
                return message.channel.send(`👍 **${song.title}** música adicionada à fila!`);
            }
        }else if (commandName == 'skip') {
            skipSong(message, serverQueue);
        }else if (commandName == 'stop') {
            stopSong(message, serverQueue);
        }

        /*const validURL = (str) => {
            var regex = /(http|https):\/\/(\w+:{0,1}\w*)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%!\-\/]))?/;
            if (!regex.test(str)) {
                return false;
            } else {
                return true;
            }
        }

        if (validURL(args[0])) {
            const connection = await voiceChannel.join();

            const stream = ytdl(args[0], {filter: 'audioonly'});

            connection.play(stream, {seek: 0, volume: 1})
            .on('finish', () => {
                voice.channel.leave();
            });

            await message.reply(`:thumbsup: Now playing ***Your link***`);

            return;
        }*/

        /*const connection = await voiceChannel.join();

        const videoFinder = async (query) => {
            const videoResult = await ytSearch(query);

            return (videoResult.videos.length > 1) ? videoResult.videos[0] : null;
        }

        const video = await videoFinder(args.join(' '));

        if (video) {
            const stream = ytdl(video.url, {filter: 'audioonly'});

            try {
                connection.play(stream, {seek: 0, volume: 1});
            } catch (err) {
                console.log(err)
            }
            

            let embed = new MessageEmbed()
            .setAuthor('Tocando agora ♪', 'https://c.tenor.com/B-pEg3SWo7kAAAAi/disk.gif', `${video.url}`)
            .setTitle(video.title)
            .setColor("#ff5517")
            .setThumbnail(video.thumbnail)
            .addField("Solicitado Por", message.author, true)
            .addField("Duração", '`' + video.duration.timestamp + '`', true);

            await message.channel.send(embed);

        } else {
            message.reply('No video results found');
        }*/
    }
}

const audioPlayer = async (guild, song) => {
    const songQueue = queue.get(guild.id);

    if(!song) {
        songQueue.voiceChannel.leave();
        queue.delete(guild.id);
        return;
    }
    const stream = ytdl(song.url, { filter: 'audioonly' });
    songQueue.connection.play(stream, { seek: 0, volume: 0.5 })
    .on('finish', () => {
        songQueue.songs.shift();
        audioPlayer(guild, songQueue.songs[0]);
    });

    const embed = new MessageEmbed()
        .setAuthor('Tocando agora ♪', 'https://c.tenor.com/B-pEg3SWo7kAAAAi/disk.gif', `${song.url}`)
        .setTitle(song.title)
        .setColor("#ff5517")
        .setThumbnail(song.thumbnail)
        .addField("Solicitado Por", song.requiredBy, true)
        .addField("Duração", '`' + song.duration + '`', true);

    await songQueue.textChannel.send(embed);
}

const skipSong = (message, serverQueue) => {
    if (!serverQueue) {
        return message.channel.send('Nenhuma música na fila!');
    }
    serverQueue.connection.dispatcher.end();
}

const stopSong = (message, serverQueue) => {
    if (!message.member.voice.channel) return message.channel.send('You need to be in a channel to execute this command!');
    serverQueue.songs = [];
    serverQueue.connection.dispatcher.end();
}