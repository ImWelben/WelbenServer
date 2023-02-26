const Discord = require('discord.js');
module.exports = {
    name: "skip",
    aliases: ["saltar"],
    desc: "Sirve para saltar una canción",
    run: async (client, message, args, prefix) => {
        //comprobaciones previas
        const queue = client.distube.getQueue(message);
        if(!queue) return message.reply({
            embeds: [new Discord.EmbedBuilder()
                .setTitle(`No hay ninguna canción reproduciéndose`)
                
                .setThumbnail('https://imgur.com/sjQTlh9.png')
                .setColor("#E24C4B")
                .setFooter({ text: 'Powered By Welben', iconURL: 'https://imgur.com/TsKFaHl.png' })
            ], ephemeral: true
        });
        if(!message.member.voice?.channel) return message.reply({
            embeds: [new Discord.EmbedBuilder()
                .setTitle(`Tienes que estar en un canal de voz para poder ver la lista de canciones`)
                
                .setThumbnail('https://imgur.com/sjQTlh9.png')
                .setColor("#E24C4B")
                .setFooter({ text: 'Powered By Welben', iconURL: 'https://imgur.com/TsKFaHl.png' })
            ], ephemeral: true
        });
        if(message.guild.members.me.voice?.channel && message.member.voice?.channel.id != message.guild.members.me.voice?.channel.id) return message.reply({
            embeds: [new Discord.EmbedBuilder()
                .setTitle(`Tienes que estar mi mismo canal para poder ver la lista de canciones`)
                
                .setThumbnail('https://imgur.com/sjQTlh9.png')
                .setColor("#E24C4B")
                .setFooter({ text: 'Powered By Welben', iconURL: 'https://imgur.com/TsKFaHl.png' })
            ], ephemeral: true
        });
        client.distube.skip(message);
        message.reply({
            embeds: [new Discord.EmbedBuilder()
                .setTitle(`⏭ Saltando a la siguiente canción`)
                
                .setThumbnail('https://imgur.com/sjQTlh9.png')
                .setColor("#4EF5BD")
                .setFooter({ text: 'Powered By Welben', iconURL: 'https://imgur.com/TsKFaHl.png' })
            ]
        })
    }
}

