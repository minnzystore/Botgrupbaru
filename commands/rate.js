module.exports = {
    name: "rate",
    execute: async (sock, from, text, db, safeSend, ctx) => {

        const { m } = ctx

        const args = text.split(" ").slice(1)

        if (args.length < 2) {
            return safeSend(sock, from, {
                text: "❌ Contoh:\n.rate aku kamu"
            })
        }

        const name1 = args[0]
        const name2 = args[1]

        // 🎲 RANDOM PERSEN
        const percent = Math.floor(Math.random() * 101)

        let result = ""

        if (percent < 20) result = "💔 Waduh... kayaknya ga cocok 😭"
        else if (percent < 40) result = "😅 Masih ragu-ragu nih"
        else if (percent < 60) result = "🙂 Lumayan cocok"
        else if (percent < 80) result = "😍 Cocok banget!"
        else result = "💖 Jodoh dunia akhirat 😳🔥"

        const message = `
💘 *RATE PASANGAN*

👤 ${name1}
❤️
👤 ${name2}

💯 Kecocokan: *${percent}%*

${result}

✨ *Cinta itu bukan angka, tapi usaha~*
        `

        await sock.sendMessage(from, {
            text: message
        })
    }
}