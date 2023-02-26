const Discord = require('discord.js');
module.exports = {
    name: "play",
    aliases: ["reproducir", "p"],
    desc: "Sirve para reproducir una canción",
    run: async (client, message, args, prefix) => {
        //comprobaciones previas
        if(!args.length) return message.reply({
            embeds: [new Discord.EmbedBuilder()
                .setTitle(`Tienes que especificar el nombre de la canción`)
                
                .setThumbnail('https://imgur.com/sjQTlh9.png')
                .setColor("#E24C4B")
                .setFooter({ text: 'Powered By Welben', iconURL: 'https://imgur.com/TsKFaHl.png' })
            ], ephemeral: true
        });
        if(!message.member.voice?.channel) return message.reply({
            embeds: [new Discord.EmbedBuilder()
                .setTitle(`Tienes que estar en un canal de voz para poder escuchar música`)
                
                .setThumbnail('https://imgur.com/sjQTlh9.png')
                .setColor("#E24C4B")
                .setFooter({ text: 'Powered By Welben', iconURL: 'https://imgur.com/TsKFaHl.png' })
            ], ephemeral: true
        });
        if(message.guild.members.me.voice?.channel && message.member.voice?.channel.id != message.guild.members.me.voice?.channel.id) return message.reply({
            embeds: [new Discord.EmbedBuilder()
                .setTitle(`Tienes que estar en mi mismo canal para ejecutar este comando!`)
                
                .setThumbnail('https://imgur.com/sjQTlh9.png')
                .setColor("#E24C4B")
                .setFooter({ text: 'Powered By Welben', iconURL: 'https://imgur.com/TsKFaHl.png' })
            ], ephemeral: true
        });
        client.distube.play(message.member.voice?.channel, args.join(" "), {
            member: message.member,
            textChannel: message.channel,
            message
        });
        message.reply({
            embeds: [new Discord.EmbedBuilder()
                .setTitle(`🔎 Buscando...`)
                
                .addFields([
                    {name: `Canción`, value: `\`${args.join(" ")}\``}
                ])
                .setThumbnail('https://imgur.com/sjQTlh9.png')
                .setColor("#4EF5BD")
                .setFooter({ text: 'Powered By Welben', iconURL: 'https://imgur.com/TsKFaHl.png' })
            ], ephemeral: true
        });
    }
}

