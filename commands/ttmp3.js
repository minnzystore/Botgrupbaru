const { exec } = require("child_process")
const fs = require("fs")
const path = require("path")
const axios = require("axios")

module.exports = {
    name: "ttmp3",
    execute: async (sock, from, text, db, safeSend) => {

        try {
            let url = text.split(" ")[1]

            if (!url) {
                return safeSend(sock, from, {
                    text: "❌ Masukkan link TikTok!\n\nContoh:\n.ttmp3 https://vt.tiktok.com/xxxx"
                })
            }

            await safeSend(sock, from, { text: "⏳ Mengambil audio TikTok..." })

            // =========================
            // EXPAND LINK (vt.tiktok)
            // =========================
            if (url.includes("vt.tiktok.com")) {
                const res = await axios.get(url)
                url = res.request.res.responseUrl
            }

            const file = path.join(__dirname, `tt_${Date.now()}.mp3`)

            // =========================
            // COMMAND UTAMA
            // =========================
            const cmd = `yt-dlp --no-playlist -f bestaudio -x --audio-format mp3 -o "${file}" ${url}`

            exec(cmd, async (err, stdout, stderr) => {

                // =========================
                // JIKA ERROR → FALLBACK
                // =========================
                if (err) {
                    console.log("ERROR UTAMA:", err)
                    console.log("STDERR:", stderr)

                    const fallbackCmd = `yt-dlp -x -o "${file}" ${url}`

                    return exec(fallbackCmd, async (err2, stdout2, stderr2) => {

                        if (err2) {
                            console.log("ERROR FALLBACK:", err2)
                            console.log("STDERR2:", stderr2)

                            return safeSend(sock, from, {
                                text: "❌ Gagal ambil audio TikTok."
                            })
                        }

                        if (!fs.existsSync(file)) {
                            return safeSend(sock, from, {
                                text: "❌ File audio tidak ditemukan."
                            })
                        }

                        await sock.sendMessage(from, {
                            audio: fs.readFileSync(file),
                            mimetype: "audio/mpeg",
                            ptt: false
                        })

                        fs.unlinkSync(file)
                    })
                }

                // =========================
                // CEK FILE
                // =========================
                if (!fs.existsSync(file)) {
                    return safeSend(sock, from, {
                        text: "❌ File gagal dibuat."
                    })
                }

                // =========================
                // KIRIM AUDIO
                // =========================
                await sock.sendMessage(from, {
                    audio: fs.readFileSync(file),
                    mimetype: "audio/mpeg",
                    ptt: false
                })

                fs.unlinkSync(file)
            })

        } catch (e) {
            console.log("FATAL ERROR:", e)
            safeSend(sock, from, {
                text: "❌ Terjadi error saat proses."
            })
        }
    }
}