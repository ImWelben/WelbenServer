const Discord = require('discord.js');
const setupSchema = require(`${process.cwd()}/modelos/setups.js`);

module.exports = {
    name: "setup-suggestion",
    aliases: ["suggestion-setup", "setup-sugerencias", "setup-sugerencia", "setupsugerencias"],
    desc: "Sirve para crear un sistema de Sugerencias",
    permisos: ["Administrator"],
    permisos_bot: ["ManageRoles", "ManageChannels"],
    run: async (client, message, args, prefix) => {
        if(!args.length) return message.reply({
            embeds: [new Discord.EmbedBuilder()
                    .setTitle(`Tienes que especificar el canal de sugerencias!`)
                    
                    .setThumbnail('https://imgur.com/sjQTlh9.png')
                    .setColor("#E24C4B")
                    .setFooter({ text: 'Powered By Welben', iconURL: 'https://imgur.com/TsKFaHl.png' })
                ]
        })
        const channel = message.guild.channels.cache.get(args[0]) || message.mentions.channels.filter(c => c.guild.id == message.guild.id).first()
        if(!channel || channel.type !== 0) return message.reply({
            embeds: [new Discord.EmbedBuilder()
                    .setTitle(`No se ha encontrado el canal que has especificado!`)
                    
                    .setThumbnail('https://imgur.com/sjQTlh9.png')
                    .setColor("#E24C4B")
                    .setFooter({ text: 'Powered By Welben', iconURL: 'https://imgur.com/TsKFaHl.png' })
                ]
        });
        await setupSchema.findOneAndUpdate({guildID: message.guild.id}, {
            sugerencias: channel.id
        })
        return message.reply({
            embeds: [new Discord.EmbedBuilder()
                .setTitle(`Configurado correctamente en \`${channel.name}\``)
                    
                    .setThumbnail('https://imgur.com/sjQTlh9.png')
                    .setDescription(`*Cada vez que una persona envíe un mensaje en ${channel}, se convertirá en sugerencia!*`)
                    .setColor("#77B255")
                    .setFooter({ text: 'Powered By Welben', iconURL: 'https://imgur.com/TsKFaHl.png' })
                ]
        })
    }
}
