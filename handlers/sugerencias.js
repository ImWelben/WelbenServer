const setupSchema = require(`${process.cwd()}/modelos/setups.js`);
const votosSchema = require(`${process.cwd()}/modelos/votos-sugs.js`);
const { asegurar_todo } = require(`${process.cwd()}/utils/funciones.js`);
const Discord = require('discord.js');
module.exports = client => {
    //evento al enviar mensaje en el canal de sugerencias
    client.on("messageCreate", async message => {
        try {
            //comprobaciones previas
            if (!message.guild || !message.channel || message.author.bot) return;
            //buscamos los datos de la DB
            let setup_data = await setupSchema.findOne({ guildID: message.guild.id });
            //comprobaciones previas
            if (!setup_data || !setup_data.sugerencias || !message.guild.channels.cache.get(setup_data.sugerencias) || message.channel.id !== setup_data.sugerencias) return;
            //eliminamos la sugerencia enviada por el autor y lo convertimos en sugerencia con botones
            message.delete().catch(() => { });
            //definimos los botones
            let botones = new Discord.ActionRowBuilder().addComponents([
                //votar si
                new Discord.ButtonBuilder().setStyle("Secondary").setLabel("0").setEmoji("✅").setCustomId("votar_si"),
                //votar no
                new Discord.ButtonBuilder().setStyle("Secondary").setLabel("0").setEmoji("❌").setCustomId("votar_no"),
                //ver votanes
                new Discord.ButtonBuilder().setStyle('Primary').setLabel("Votaciones").setEmoji("🗳").setCustomId("ver_votos"),
            ])
            //enviamos el mensaje con los botones
            let msg = await message.channel.send({
                embeds: [
                    new Discord.EmbedBuilder()
                        
                        .setTitle( `Sugerencia de ${message.author.username}`)
                        .setDescription(`>>> ${message.content}`)
                        .addFields([
                            {name: `✅ __**Votos positivos**__`, value: `\`0 votos\``, inline: true},
                            {name: `❌ __**Votos negativos**__`, value: `\`0 votos\``, inline: true},
                            {name: `¿Quieres crear una sugerencia?`, value: `Envía la descripción de la sugerencia por este canal y el bot hará su trabajo`, inline: false},
                        ])
                        .setThumbnail('https://imgur.com/sjQTlh9.png')
                        .setImage('https://imgur.com/JUeXIPb.png')
                        .setColor("#4EF5BD")
                        .setFooter({ text: 'Powered By Welben', iconURL: 'https://imgur.com/TsKFaHl.png' })
                ],
                components: [botones]
            })
            let data_msg = new votosSchema({
                messageID: msg.id,
                autor: message.author.id,
            })
            data_msg.save();
        } catch (e) { console.log(e) }
    })

    //evento al hacer click en un botón de la sugerencia
    client.on("interactionCreate", async interaction => {
        try {
            //comprobaciones previas
            if (!interaction.guild || !interaction.channel || !interaction.message || !interaction.user) return;
            //aseguramos la base de datos
            asegurar_todo(interaction.guild.id, interaction.user.id);
            //buscamos los datos en la base de datos
            let setup_data = await setupSchema.findOne({ guildID: interaction.guild.id });
            //buscamos la base de datos del mensaje de la sugerencia
            let msg_data = await votosSchema.findOne({ messageID: interaction.message.id });
            //comprobaciones previas
            if (!msg_data || !setup_data || !setup_data.sugerencias || interaction.channelId !== setup_data.sugerencias) return;
            switch (interaction.customId) {
                case "votar_si": {
                    //si el votante ya ha votado en el mismo voto hacemos return;
                    if (msg_data.si.includes(interaction.user.id)) return interaction.reply({
                        embeds: [new Discord.EmbedBuilder()
                            .setTitle(`No puedes votar dos veces.`)
                            
                            .setThumbnail('https://imgur.com/sjQTlh9.png')
                            .setDescription(`Ya has votado **SI** en la sugerencia.`)
                            .setColor("#4EF5BD")
                            .setFooter({ text: 'Powered By Welben', iconURL: 'https://imgur.com/TsKFaHl.png' })
                        ], ephemeral: true
                    });
                    //modificamos la DB
                    if (msg_data.no.includes(interaction.user.id)) msg_data.no.splice(msg_data.no.indexOf(interaction.user.id), 1)
                    msg_data.si.push(interaction.user.id);
                    msg_data.save();

                    //modificamos el embed
                    interaction.message.embeds[0].fields[0].value = `\`${msg_data.si.length} votos\``;
                    interaction.message.embeds[0].fields[1].value = `\`${msg_data.no.length} votos\``;

                    //modificamos los botones con el valor de los votos
                    interaction.message.components[0].components[0].label = msg_data.si.length.toString();
                    interaction.message.components[0].components[1].label = msg_data.no.length.toString();

                    //editamos el mensaje
                    await interaction.message.edit({ embeds: [interaction.message.embeds[0]], components: [interaction.message.components[0]] });
                    interaction.deferUpdate();
                }
                    break;

                case "votar_no": {
                    //si el votante ya ha votado en el mismo voto hacemos return;
                    if (msg_data.no.includes(interaction.user.id)) return interaction.reply({
                        embeds: [new Discord.EmbedBuilder()
                            .setTitle(`No puedes votar dos veces`)
                            
                            .setDescription(`Ya has votado **NO** en la sugerencia.`)
                            .setThumbnail('https://imgur.com/sjQTlh9.png')
                            .setColor("#4EF5BD")
                            .setFooter({ text: 'Powered By Welben', iconURL: 'https://imgur.com/TsKFaHl.png' })
                        ], ephemeral: true
                    });
                    //modificamos la DB
                    if (msg_data.si.includes(interaction.user.id)) msg_data.si.splice(msg_data.si.indexOf(interaction.user.id), 1)
                    msg_data.no.push(interaction.user.id);
                    msg_data.save();

                    //modificamos el embed
                    interaction.message.embeds[0].fields[0].value = `\`${msg_data.si.length} votos\``;
                    interaction.message.embeds[0].fields[1].value = `\`${msg_data.no.length} votos\``;

                    //modificamos los botones con el valor de los votos
                    interaction.message.components[0].components[0].label = msg_data.si.length.toString();
                    interaction.message.components[0].components[1].label = msg_data.no.length.toString();

                    //editamos el mensaje
                    await interaction.message.edit({ embeds: [interaction.message.embeds[0]], components: [interaction.message.components[0]] });
                    interaction.deferUpdate();

                }
                    break;
                    
                case "ver_votos": {
                    interaction.reply({
                        embeds: [new Discord.EmbedBuilder()
                        .setTitle(`Votos de la sugerencia`)
                        .addFields([
                            {name: `✅ __**Votos positivos**__`, value: msg_data.si.length >= 1 ? msg_data.si.map(u => `<@${u}>\n`).toString() : "```\nNo hay votos\n```", inline: true},
                            {name: `❌ __**Votos negativos**__`, value: msg_data.no.length >= 1 ? msg_data.no.map(u => `<@${u}>\n`).toString() : "```\nNo hay votos\n```", inline: true}
                        ])
                        .setColor("#4EF5BD")
                        ],
                        ephemeral: true,
                    })
                }
                    break;

                default:
                    break;
            }
        } catch (e) { console.log(e) }
    })
}
