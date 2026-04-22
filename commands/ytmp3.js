const { exec } = require("child_process")
const fs = require("fs")

module.exports = {
    name: "ytmp3",
    execute: async (sock, from, text, db, safeSend) => {

        const url = text.split(" ")[1]

        if (!url)
            return safeSend(sock, from, { text: "❌ Masukkan link YouTube!" })

        const file = `./yt_${Date.now()}.mp3`

        await safeSend(sock, from, { text: "⏳ Download MP3..." })

        exec(`yt-dlp -x --audio-format mp3 -o "${file}" ${url}`, async (err) => {

            if (err || !fs.existsSync(file)) {
                console.log(err)
                return safeSend(sock, from, { text: "❌ Gagal download MP3" })
            }

            await sock.sendMessage(from, {
                audio: fs.readFileSync(file),
                mimetype: "audio/mpeg"
            })

            fs.unlinkSync(file)
        })
    }
}