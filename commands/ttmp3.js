const { exec } = require("child_process")
const fs = require("fs")
const axios = require("axios")

module.exports = {
    name: "ttmp3",
    execute: async (sock, from, text, db, safeSend) => {

        let url = text.split(" ")[1]

        if (!url)
            return safeSend(sock, from, { text: "❌ Masukkan link TikTok!" })

        await safeSend(sock, from, { text: "⏳ Memproses..." })

        try {
            // 🔥 EXPAND SHORT LINK
            if (url.includes("vt.tiktok.com")) {
                const res = await axios.get(url)
                url = res.request.res.responseUrl
            }

            const file = `./tt_${Date.now()}.mp3`

            exec(`yt-dlp -x --audio-format mp3 -o "${file}" ${url}`, async (err) => {

                if (err || !fs.existsSync(file)) {
                    console.log(err)
                    return safeSend(sock, from, { text: "❌ Gagal ambil audio" })
                }

                await sock.sendMessage(from, {
                    audio: fs.readFileSync(file),
                    mimetype: "audio/mpeg"
                })

                fs.unlinkSync(file)
            })

        } catch (e) {
            console.log(e)
            safeSend(sock, from, { text: "❌ Error saat proses link" })
        }
    }
}