const { exec } = require("child_process")
const fs = require("fs")
const path = require("path")

module.exports = {
    name: "ig",
    execute: async (sock, from, text, db, safeSend) => {

        try {
            const url = text.split(" ")[1]

            if (!url) {
                return safeSend(sock, from, {
                    text: "❌ Masukkan link Instagram!\n\nContoh:\n.ig https://instagram.com/reel/xxxx"
                })
            }

            const file = path.join(__dirname, `ig_${Date.now()}.mp4`)

            await safeSend(sock, from, {
                text: "⏳ Mengunduh video Instagram..."
            })

            // =========================
            // COMMAND UTAMA
            // =========================
            const cmd = `yt-dlp --no-playlist -f "bv*+ba/b" --merge-output-format mp4 -o "${file}" ${url}`

            exec(cmd, async (err, stdout, stderr) => {

                // =========================
                // JIKA ERROR → FALLBACK
                // =========================
                if (err) {
                    console.log("ERROR UTAMA:", err)
                    console.log("STDERR:", stderr)

                    const fallbackCmd = `yt-dlp --no-playlist -o "${file}" ${url}`

                    return exec(fallbackCmd, async (err2, stdout2, stderr2) => {

                        if (err2) {
                            console.log("ERROR FALLBACK:", err2)
                            console.log("STDERR2:", stderr2)

                            return safeSend(sock, from, {
                                text: "❌ Gagal download Instagram.\nKemungkinan video private / butuh login."
                            })
                        }

                        if (!fs.existsSync(file)) {
                            return safeSend(sock, from, {
                                text: "❌ File tidak ditemukan."
                            })
                        }

                        await sock.sendMessage(from, {
                            video: fs.readFileSync(file),
                            caption: "✅ Berhasil download (fallback)"
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
                // KIRIM VIDEO
                // =========================
                await sock.sendMessage(from, {
                    video: fs.readFileSync(file),
                    caption: "✅ Berhasil download Instagram"
                })

                fs.unlinkSync(file)
            })

        } catch (e) {
            console.log("FATAL ERROR:", e)
            safeSend(sock, from, {
                text: "❌ Terjadi error sistem."
            })
        }
    }
}