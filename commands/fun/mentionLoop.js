module.exports = {
    name: 'marcar',
    aliases: [],
    description: `Marca os amiguinhos de forma bem serelepe (As mensagens possuem um delay de 5s)`,
    args: true,
    usage: '<@ do usuário> <Quantidade de mensagens> <Mensagem>(opcional)',
    guildOnly: true,
    execute: (message, commandName, args) => {
        const user = message.mentions.users.first();
        const qtd = parseInt(args[1]);
        const msg = args.splice(2, args.length);
        const finalMsg = msg.join(' ');

        if (isNaN(qtd)) {
            return message.channel.send('Insira um número válido');
        }

        let i = 0;
        const interval = setInterval(function() {
            message.channel.send(`${user} ${finalMsg}`);
            i++;
            
            if (i == qtd) {
                clearInterval(interval);
            }
            
        }, 5000);

    }
}