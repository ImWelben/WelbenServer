const { asegurar_todo } = require("../utils/funciones.js");
const setupSchema = require(`${process.cwd()}/modelos/setups`);
const ticketSchema = require(`${process.cwd()}/modelos/tickets`);
const Discord = require('discord.js');
const html = require('discord-html-transcripts')

module.exports = client => {

    //CREACIÓN DE TICKETS
    client.on("interactionCreate", async interaction => {
        try {

            //comprobaciones previas
            if (!interaction.guild || !interaction.channel || !interaction.isButton() || interaction.message.author.id !== client.user.id || interaction.customId !== "crear_ticket") return;
            //aseguramos la base de datos para evitar errores
            await asegurar_todo(interaction.guild.id);
            //buscamos el setup en la base de datos
            const setup = await setupSchema.findOne({ guildID: interaction.guild.id });
            //comprobaciones previas
            if (!setup || !setup.sistema_tickets || !setup.sistema_tickets.canal || interaction.channelId !== setup.sistema_tickets.canal || interaction.message.id !== setup.sistema_tickets.mensaje) return;
            //buscamos primero si el usuario tiene un ticket creado
            let ticket_data = await ticketSchema.find({ guildID: interaction.guild.id, autor: interaction.user.id, cerrado: false });

            //comprobar si el usuario ya tiene un ticket creado en el servidor y NO esté cerrado, y si es así, hacemos return;
            for (const ticket of ticket_data) {
                if (interaction.guild.channels.cache.get(ticket.canal)) return interaction.reply({ 
                    embeds: [new Discord.EmbedBuilder()
                        .setTitle(`Ya tienes un ticket creado en:`)
                        
                        .setDescription(`<#${ticket.canal}>`)
                        .setThumbnail('https://imgur.com/sjQTlh9.png')
                        .setColor("#E24C4B")
                        .setFooter({ text: 'Powered By Welben', iconURL: 'https://imgur.com/TsKFaHl.png' })
                    ], ephemeral: true
                 });
            }

            await interaction.reply({ 
                embeds: [new Discord.EmbedBuilder()
                    .setTitle(`Creando tu ticket... Porfavor espere`)
                    
                    .setThumbnail('https://imgur.com/sjQTlh9.png')
                    .setColor("#4EF5BD")
                    .setFooter({ text: 'Powered By Welben', iconURL: 'https://imgur.com/TsKFaHl.png' })
                ], ephemeral: true
             });
            //creamos el canal
            const channel = await interaction.guild.channels.create({
                name: `𝖯𝖾𝖽𝗂𝖽𝗈〔${interaction.member.user.username}〕`.substring(0, 50),
                type: 0, // 0 == texto, 2 == voz, ... https://discord-api-types.dev/api/discord-api-types-v10/enum/ChannelType
                parent: interaction.channel.parent ?? null,
                permissionOverwrites: [
                    //denegamos el permiso de ver el ticket a otra persona que no sea el creador del ticket
                    {
                        id: interaction.guild.id,
                        deny: ["ViewChannel"]
                    },
                    //permitimos ver el ticket al usuario que ha creado el ticket
                    {
                        id: interaction.user.id,
                        allow: ["ViewChannel"]
                    },
                    //ROL ESPECIAL PARA QUE PUEDA VER LOS TICKETS
                    {
                        id: "1003778222615437342",
                        allow: ["ViewChannel"]
                    },
                    {
                        id: "1003778222615437342",
                        allow: ["ViewChannel"]
                    },
                ]
            });
            //enviamos la bienvenida en el ticket del usuario
            channel.send({
                embeds: [new Discord.EmbedBuilder()
                    .setTitle(`[GTAHub - LSPD > GDD] Solicitud de Diseño`)
                    
                    .addFields(
                        { name:"‪‪\n> Utiliza la siguiente plantilla para realizar un pedido:\n‪‪", value: "```\n**Titulo:** \n**Descripción del pedido:** \n**Fecha máxima de entrega:** \n```"},
                        { name:"‪‪\n> En caso de que el pedido sea un flyer de Evento, la plantilla es:\n‪‪", value: "```\n**Título:** \n**Fecha del evento:** \n**Horarios:** \n**Ubicación:** \n**Logos:** \n**Texto completo:** \n**Aclaraciones específicas:** \n**Fecha límite:** \n```"}
                    )
                    .setColor("#4EF5BD")
                    
                    .setFooter({ text: 'Powered By Welben', iconURL: 'https://imgur.com/TsKFaHl.png' })
                ],
                components: [new Discord.ActionRowBuilder().addComponents(
                    [
                        new Discord.ButtonBuilder().setLabel("CERRAR").setEmoji("🔒").setCustomId("cerrar_ticket").setStyle("Danger"),
                        new Discord.ButtonBuilder().setLabel("GUARDAR").setEmoji("💾").setCustomId("guardar_ticket").setStyle("Primary"),
                        new Discord.ButtonBuilder().setLabel("BORRAR").setEmoji("🗑").setCustomId("borrar_ticket").setStyle("Secondary")                        
                    ]
                )]
            });
            //guardamos el ticket en la base de datos
            let data = new ticketSchema({
                guildID: interaction.guild.id,
                autor: interaction.user.id,
                canal: channel.id,
                cerrado: false,
            });
            data.save();
            await interaction.editReply({ 
                embeds: [new Discord.EmbedBuilder()
                    .setTitle(`Ticket creado en:`)
                    
                    .setDescription(`<#${channel.id}>`)
                    .setThumbnail('https://imgur.com/sjQTlh9.png')
                    .setColor("#77B255")
                    .setFooter({ text: 'Powered By Welben', iconURL: 'https://imgur.com/TsKFaHl.png' })
                ], ephemeral: true
             })

        } catch (e) {
            console.log(e)
        }
    })

    //BOTONES
    client.on("interactionCreate", async interaction => {
        try {

            //comprobaciones previas
            if (!interaction.guild || !interaction.channel || !interaction.isButton() || interaction.message.author.id !== client.user.id) return;
            //aseguramos la base de datos para evitar errores
            await asegurar_todo(interaction.guild.id);

            let ticket_data = await ticketSchema.findOne({ guildID: interaction.guild.id, canal: interaction.channel.id})
            switch (interaction.customId) {
                case "cerrar_ticket":{
                    //si el ticket ya está cerrado, hacemos return;
                    if(ticket_data && ticket_data.cerrado) return interaction.reply({content: `❌ **Este ticket ya estaba cerrado!**`, ephemeral: true});
                    interaction.deferUpdate();
                    //creamos el mensaje de verificar
                    const verificar = await interaction.channel.send({
                        embeds: [new Discord.EmbedBuilder()
                            .setTitle(`¿Seguro que quieres cerrar el ticket?`)
                            
                            .setDescription(`*¡No podrás abrirlo de nuevo!*`)
                            .setThumbnail('https://imgur.com/sjQTlh9.png')
                            .setColor("#4EF5BD")
                            .setFooter({ text: 'Powered By Welben', iconURL: 'https://imgur.com/TsKFaHl.png' })
                        ],
                        components: [new Discord.ActionRowBuilder().addComponents(
                            new Discord.ButtonBuilder().setLabel("Confirmar").setStyle("Success").setCustomId("verificar").setEmoji("✅")
                        )]
                    });

                    //creamos el collector
                    const collector = verificar.createMessageComponentCollector({
                        filter: i => i.isButton() && i.message.author.id == client.user.id && i.user,
                        time: 180e3
                    });

                    //escuchamos clicks en el botón
                    collector.on("collect", boton => {
                        //si la persona que hace clic en el botón de verificarse NO es la misma persona que ha hecho clic al botón de cerrar ticket, return;
                        if(boton.user.id !== interaction.user.id) return boton.reply({
                            embeds: [new Discord.EmbedBuilder()
                                .setTitle(`Solo puede confirmar la persona que quiso cerrar el ticket:`)
                                
                                .setDescription(`${interaction.user}`)
                                .setThumbnail('https://imgur.com/sjQTlh9.png')
                                .setColor("#E24C4B")
                                .setFooter({ text: 'Powered By Welben', iconURL: 'https://imgur.com/TsKFaHl.png' })
                            ], ephemeral: true
                        });

                        //paramos el collector
                        collector.stop();
                        boton.deferUpdate();
                        //cerramos el ticket en la base de datos
                        ticket_data.cerrado = true;
                        ticket_data.save();
                        //hacemos que el usuario que ha creado el ticket, no pueda ver el ticket
                        interaction.channel.permissionOverwrites.edit(ticket_data.autor, { ViewChannel: false });
                        interaction.channel.send({
                            embeds: [new Discord.EmbedBuilder()
                                .setTitle(`Ticket cerrado correctamente`)
                                
                                .addFields(
                                    { name:"Responsable de cerrarlo", value: `<@${interaction.user.id}>`},
                                    { name:"Fecha", value: `<t:${Math.round(Date.now() / 1000)}>`},
                                )
                                .setThumbnail('https://imgur.com/sjQTlh9.png')
                                .setColor("#77B255")
                                .setFooter({ text: 'Powered By Welben', iconURL: 'https://imgur.com/TsKFaHl.png' })
                            ], ephemeral: true
                        })
                    });

                    collector.on("end", (collected) => {
                        //si el usuario ha hecho clic al botón de verificar, editamos el mensaje desactivado el botón de verificar
                        if(collected && collected.first() && collected.first().customId){
                            //editamos el mensaje desactivado el botón de verificarse
                            verificar.edit({
                                components: [new Discord.ActionRowBuilder().addComponents(
                                    new Discord.ButtonBuilder().setLabel("Confirmar").setStyle("Success").setCustomId("verificar").setEmoji("✅").setDisabled(true)
                                )]
                            })
                        } else {
                            verificar.edit({
                                embeds: [verificar.embeds[0].setColor("Red")],
                                components: [new Discord.ActionRowBuilder().addComponents(
                                    new Discord.ButtonBuilder().setLabel("NO CONFIRMADO").setStyle('Danger').setCustomId("verificar").setEmoji("❌").setDisabled(true)
                                )]
                            })
                        }
                    })

                }
                    break;

                case "borrar_ticket": {
                    interaction.deferUpdate();
                    //creamos el mensaje de verificar
                    const verificar = await interaction.channel.send({
                        embeds: [new Discord.EmbedBuilder()
                            .setTitle(`¿Seguro que quieres borrar el ticket?`)
                            
                            .setDescription(`*¡No podrás abrirlo de nuevo!*`)
                            .setThumbnail('https://imgur.com/sjQTlh9.png')
                            .setColor("#4EF5BD")
                            .setFooter({ text: 'Powered By Welben', iconURL: 'https://imgur.com/TsKFaHl.png' })
                        ],
                        components: [new Discord.ActionRowBuilder().addComponents(
                            new Discord.ButtonBuilder().setLabel("Confirmar").setStyle("Success").setCustomId("verificar").setEmoji("✅")
                        )]
                    });

                    //creamos el collector
                    const collector = verificar.createMessageComponentCollector({
                        filter: i => i.isButton() && i.message.author.id == client.user.id && i.user,
                        time: 180e3
                    });

                    //escuchamos clicks en el botón
                    collector.on("collect", boton => {
                        //si la persona que hace clic en el botón de verificarse NO es la misma persona que ha hecho clic al botón de cerrar ticket, return;
                        if(boton.user.id !== interaction.user.id) return boton.reply({
                            embeds: [new Discord.EmbedBuilder()
                                .setTitle(`Solo puede confirmar la persona que quiso borrar el ticket:`)
                                
                                .setDescription(`${interaction.user}`)
                                .setThumbnail('https://imgur.com/sjQTlh9.png')
                                .setColor("#E24C4B")
                                .setFooter({ text: 'Powered By Welben', iconURL: 'https://imgur.com/TsKFaHl.png' })
                            ], ephemeral: true
                        });

                        //paramos el collector
                        collector.stop();
                        boton.deferUpdate();
                        //borramos el ticket de la base de datos
                        ticket_data.delete();
                        interaction.channel.send({
                            embeds: [new Discord.EmbedBuilder()
                                .setTitle(`El ticket será eliminado en menos de \`3 segundos ...\``)
                                
                                .addFields(
                                    { name:"Responsable de borrarlo", value: `<@${interaction.user.id}>`},
                                    { name:"Fecha", value: `<t:${Math.round(Date.now() / 1000)}>`},
                                )
                                .setThumbnail('https://imgur.com/sjQTlh9.png')
                                .setColor("#E24C4B")
                                .setFooter({ text: 'Powered By Welben', iconURL: 'https://imgur.com/TsKFaHl.png' })
                            ]
                        })
                        //borramos el canal en 3 segundos
                        setTimeout(() => {
                            interaction.channel.delete();
                        }, 3_000);
                    });

                    collector.on("end", (collected) => {
                        //si el usuario ha hecho clic al botón de verificar, editamos el mensaje desactivado el botón de verificar
                        if(collected && collected.first() && collected.first().customId){
                            //editamos el mensaje desactivado el botón de verificarse
                            verificar.edit({
                                components: [new Discord.ActionRowBuilder().addComponents(
                                    new Discord.ButtonBuilder().setLabel("Confirmar").setStyle("Success").setCustomId("verificar").setEmoji("✅").setDisabled(true)
                                )]
                            })
                        } else {
                            verificar.edit({
                                embeds: [verificar.embeds[0].setColor("Red")],
                                components: [new Discord.ActionRowBuilder().addComponents(
                                    new Discord.ButtonBuilder().setLabel("NO CONFIRMADO").setStyle('Danger').setCustomId("verificar").setEmoji("❌").setDisabled(true)
                                )]
                            })
                        }
                    })

                }
                break;

                case "guardar_ticket": {
                    interaction.deferUpdate();
                    //enviamos el mensaje de guardando ticket
                    const mensaje = await interaction.channel.send({
                        content: interaction.user.toString(),
                        embeds: [new Discord.EmbedBuilder()
                            .setTitle(`Guardando ticket... Porfavor espere`)
                            
                            .setThumbnail('https://imgur.com/sjQTlh9.png')
                            .setColor("#4EF5BD")
                            .setFooter({ text: 'Powered By Welben', iconURL: 'https://imgur.com/TsKFaHl.png' })
                        ]
                    });

                    //generamos el archivo html con la conversación
                    const adjunto = await html.createTranscript(interaction.channel, {
                        limit: -1,
                        returnBuffer: false,
                        fileName: `${interaction.channel.name}.html`
                    })

                    mensaje.edit({
                        embeds: [new Discord.EmbedBuilder()
                            .setTitle(`Ticket guardado correctamente`)
                            
                            .addFields(
                                { name:"Responsable del guardado", value: `<@${interaction.user.id}>`},
                                { name:"Fecha", value: `<t:${Math.round(Date.now() / 1000)}>`},
                            )
                            .setThumbnail('https://imgur.com/sjQTlh9.png')
                            .setColor("#77B255")
                            .setFooter({ text: 'Powered By Welben', iconURL: 'https://imgur.com/TsKFaHl.png' })
                        ],
                        files: [adjunto]
                    })                    
                }
                break;
            
                default:
                    break;
            }

        } catch (e) {
            console.log(e)
        }
    })
}

