const axios = require("axios")

module.exports = {
    name: "memeindo",
    execute: async (sock, from, text, db, safeSend, ctx) => {

        try {
            // API meme indo (alternatif random)
            const res = await axios.get("https://api.waifu.pics/sfw/neko")

            await sock.sendMessage(from, {
                image: { url: res.data.url },
                caption: "😂 *Meme Indo Random*\n\nNgakak dulu ga sih 🤣"
            })

        } catch (e) {
            console.log("MEME INDO ERROR:", e)

            await safeSend(sock, from, {
                text: "❌ Gagal ambil meme indo 😭"
            })
        }
    }
}