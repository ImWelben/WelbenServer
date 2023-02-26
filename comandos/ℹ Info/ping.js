module.exports = {
    name: "ping",
    aliases: ["latencia", "ms"],
    desc: "Sirve para ver la latencia del Bot",
    run: async (client, message, args, prefix) => {
        message.reply(`Pong! Prueba | Ping --> \`${client.ws.ping}ms\``)
    }
}

