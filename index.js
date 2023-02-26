const Discord = require('discord.js');
const config = require('./config/config.json')
const fs = require('fs');
const Enmap = require('enmap');
require('colors')
const client = new Discord.Client({
    intents: [
        Discord.GatewayIntentBits.Guilds,
        Discord.GatewayIntentBits.GuildMembers,
        Discord.GatewayIntentBits.GuildMessages,
        Discord.GatewayIntentBits.MessageContent,
        Discord.GatewayIntentBits.GuildVoiceStates,
        Discord.GatewayIntentBits.GuildMessageReactions,
        Discord.GatewayIntentBits.GuildEmojisAndStickers,
    ],
    partials: [Discord.Partials.User, Discord.Partials.Channel, Discord.Partials.GuildMember, Discord.Partials.Message, Discord.Partials.Reaction]

})

client.commands = new Discord.Collection();
client.aliases = new Discord.Collection();
client.color = config.color;

//Cargamos los handlers
fs.readdirSync('./handlers').forEach(handler => {
    try {
        require(`./handlers/${handler}`)(client, Discord);
    } catch (e) {
        console.log(`ERROR EN EL HANDLER ${handler}`.red)
        console.log(e)
    }
});

client.login(config.token).catch(() => console.log(`-[X]- NO HAS ESPECIFICADO UN TOKEN VALIDO O TE FALTAN INTENTOS -[X]-\n [-] ACTIVA LOS INTENTOS EN https://discord.dev [-]`.red))

//SISTEMA DE BIENVENIDA

client.setups = new Enmap({
    name: "setups",
    dataDir: "./databases"
})

client.on("messageCreate", async (message) => {
    if (message.author.bot || !message.guild || !message.channel) return;
    client.setups.ensure(message.guild.id, {
        welcomechannel: "",
        welcomemessage: "",
    });
    const args = message.content.slice(config.prefix.length).trim().split(" ")
    const command = args.shift()?.toLowerCase();

    if (command == "setup-welcome") {
        const channel = message.guild.channels.cache.get(args[0]) || message.mentions.channels.first();
        if (!channel) return message.reply(`El CANAL que has mencionado NO EXISTE!\n**Uso:** \`${config.prefix}setup-welcome <#CANAL O ID> <MENSAJE DE BIENVENIDA>\``);
        if (!args.slice(1).join(" ")) return message.reply(`No has especificado el MENSAJE DE BIENVENIDA!\n**Uso:** \`${config.prefix}setup-welcome <#CANAL O ID> <MENSAJE DE BIENVENIDA>\``);
        let obj = {
            welcomechannel: channel.id,
            welcomemessage: args.slice(1).join(" "),

        }
        client.setups.set(message.guild.id, obj)
        return message.reply(`✅ Se ha configurado correctamente el canal de bienvenida\n**Canal:** ${channel}\n**Mensaje de Bienvenida:** ${args.slice(1).join(" ")}`)
    }
})

client.on("guildMemberAdd", async (member) => {
    client.setups.ensure(member.guild.id, {
        welcomechannel: "",
        welcomemessage: "",
    });

    try {
        const data = client.setups.get(member.guild.id);
        if(data) {
            if(member.guild.channels.cache.get(data.welcomechannel)){
                const channel = member.guild.channels.cache.get(data.welcomechannel)
                const attachment = new Discord.AttachmentBuilder('https://imgur.com/GWDnSVC.png')
                channel.send({content: data.welcomemessage.replace(/{usuario}/, member), files: [attachment]})
            }
        }
    } catch (e){console.log(e)}
})
/*
client.on("guildMemberAdd", async (member) => {
    if(member.guild.id == "1003310179091218452"){
        const Canvas = require("canvas")
        const canvas = Canvas.createCanvas(1018, 650)
        const ctx = canvas.getContext("2d")
        const { loadImage } = require('canvas')

        //IMAGEN DE FONOD
        const background = await Canvas.loadImage('https://imgur.com/KaK4tpX.png')
        ctx.drawImage(background, 0, 0, canvas.width, canvas.height)
        
        ctx.fillStyle = "#5580a6"
        ctx.textAlign = "center";
        ctx.font = "40px Bahnschrift Light SemiCondensed"

        ctx.fillText(`${member.user.username}`, 770, 240)

        ctx.beginPath()
        ctx.arc(247, 350, 175, 0, Math.PI * 2, true)
        ctx.closePath()
        ctx.clip()

        const avatar = await Canvas.loadImage(member.user.displayAvatarURL({ format: "jpg", size: 1024, dynamic: true}))
        ctx.globalAlpha = 0.8;
        ctx.drawImage(avatar, 72, 175, 350, 350)

        const attachment = new Discord.AttachmentBuilder(canvas.toBuffer(), "bienvenida.png")
        client.channels.cache.get("1003779228917055568").send({ files: [attachment] })
    }
})*/