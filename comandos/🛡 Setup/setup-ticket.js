const Discord = require('discord.js');
const setupSchema = require(`${process.cwd()}/modelos/setups.js`);

module.exports = {
    name: "setup-ticket",
    aliases: ["ticket-setup", "setupticket", "ticketsetup"],
    desc: "Sirve para crear un sistema de Tickets",
    permisos: ["Administrator"],
    permisos_bot: ["ManageRoles", "ManageChannels"],
    run: async (client, message, args, prefix) => {
        var objeto = {
            canal: "",
            mensaje: "",
        };

        const quecanal = await message.reply({
            embeds: [new Discord.EmbedBuilder()
                .setTitle(`¿Qué canal quieres usar para el sistema de tickets?`)
                
                .setThumbnail('https://imgur.com/sjQTlh9.png')
                .setDescription(`*Menciona el canal o envia su ID.*`)
                .setColor("#4EF5BD")
                .setFooter({ text: 'Powered By Welben', iconURL: 'https://imgur.com/TsKFaHl.png' })
                ]
        });

        await quecanal.channel.awaitMessages({
            filter: m=> m.author.id === message.author.id,
            max: 1,
            errors: ["time"],
            time: 180e3
        }).then(async collected => {
            var message = collected.first();
            const channel = message.guild.channels.cache.get(message.content) || message.mentions.channels.filter(c => c.guild.id == message.guild.id).first()
            if(channel) {
                objeto.canal = channel.id;

                    const msg = await message.guild.channels.cache.get(objeto.canal).send({
                        embeds: [new Discord.EmbedBuilder()
                            .setTitle(`[GTAHub - LSPD > GDD] Solicitud de Diseño`)
                            
                            .addFields(
                                { name:"‪‪", value: "> Abre un ticket por este medio para poder comunicarte directamente con los **diseñadores de la** __**Graphic Design Division**__"},
                                { name:"‪‪", value: "Para crear un ticket haz clic en el boton que dice \`🎨 Solicitar diseño\`"}
                            )
                            .setColor("#5865F2")
                            
                            .setFooter({ text: 'Powered By Welben', iconURL: 'https://imgur.com/TsKFaHl.png' })
                            ],
                        components: [new Discord.ActionRowBuilder().addComponents(new Discord.ButtonBuilder().setLabel("Solicitar diseño").setEmoji("🎨").setCustomId("crear_ticket").setStyle("Primary"))]
                    })
                    objeto.mensaje = msg.id
                    await setupSchema.findOneAndUpdate({guildID: message.guild.id}, {
                        sistema_tickets: objeto
                    });
                    return message.reply({
                        embeds: [new Discord.EmbedBuilder()
                        .setTitle(`Configurado correctamente en:`)
                            
                            .setThumbnail('https://imgur.com/sjQTlh9.png')
                            .setDescription(`<#${objeto.canal}>`)
                            .setColor("#77B255")
                            .setFooter({ text: 'Powered By Welben', iconURL: 'https://imgur.com/TsKFaHl.png' })
                        ]
                    })
            } else {
                return message.reply({
                    embeds: [new Discord.EmbedBuilder()
                        .setTitle(`No se ha encontrado el canal que has especificado!`)
                            
                            .setThumbnail('https://imgur.com/sjQTlh9.png')
                            .setColor("#E24C4B")
                            .setFooter({ text: 'Powered By Welben', iconURL: 'https://imgur.com/TsKFaHl.png' })
                        ]
                })
            }
        }).catch((e) => {
            return message.reply({
                embeds: [new Discord.EmbedBuilder()
                    .setTitle(`El tiempo ha expirado!`)
                        
                        .setThumbnail('https://imgur.com/sjQTlh9.png')
                        .setColor("#E24C4B")
                        .setFooter({ text: 'Powered By Welben', iconURL: 'https://imgur.com/TsKFaHl.png' })
                    ]
            })
        })

    }
}

