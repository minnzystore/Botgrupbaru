const axios = require("axios")

module.exports = {
    name: "memeanime",
    execute: async (sock, from, text, db, safeSend, ctx) => {

        try {
            // API anime random
            const res = await axios.get("https://api.waifu.pics/sfw/waifu")

            await sock.sendMessage(from, {
                image: { url: res.data.url },
                caption: "🎌 *Meme Anime*\n\nWibu mode ON 😎🔥"
            })

        } catch (e) {
            console.log("MEME ANIME ERROR:", e)

            await safeSend(sock, from, {
                text: "❌ Gagal ambil meme anime 😭"
            })
        }
    }
}