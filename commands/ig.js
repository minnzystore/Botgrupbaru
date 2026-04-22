const { exec } = require("child_process")
const fs = require("fs")

module.exports = {
    name: "ig",
    execute: async (sock, from, text, db, safeSend) => {

        const url = text.split(" ")[1]

        if (!url)
            return safeSend(sock, from, { text: "❌ Masukkan link Instagram!" })

        const file = `./ig_${Date.now()}.mp4`

        await safeSend(sock, from, { text: "⏳ Download IG..." })

        exec(`yt-dlp -f mp4 -o "${file}" ${url}`, async (err) => {

            if (err || !fs.existsSync(file)) {
                console.log(err)
                return safeSend(sock, from, { text: "❌ Gagal download IG" })
            }

            await sock.sendMessage(from, {
                video: fs.readFileSync(file)
            })

            fs.unlinkSync(file)
        })
    }
}