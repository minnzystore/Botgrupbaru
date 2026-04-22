const axios = require("axios")

module.exports = {
    name: "profile",
    execute: async (sock, from, text, db, safeSend, ctx) => {

        const { sender, m, isAdmin = false, isOwner = false, toJid } = ctx || {}
        if (!sender || !m) return

        const username = m.pushName || "User"

        // =========================
        // DB SAFE
        // =========================
        if (!db[sender]) {
            db[sender] = { level: 1, exp: 0 }
        }

        let level = db[sender].level
        let exp = db[sender].exp

        let role = "User"
        let rank = "Bronze 🥉"

        // =========================
        // ROLE & RANK
        // =========================
        if (isOwner) {
            role = "Dewa Pencipta 👑"
        } else {
            if (isAdmin) role = "Admin 🛡️"

            const ranks = [
                { lvl: 999, name: "VVIP 👑🔥💎" },
                { lvl: 200, name: "God Mode 🪐" },
                { lvl: 150, name: "Immortal 💀" },
                { lvl: 100, name: "Supreme 👑" },
                { lvl: 75, name: "Legend 🌟" },
                { lvl: 50, name: "Mythic 🔥" },
                { lvl: 40, name: "Grandmaster ⚡" },
                { lvl: 30, name: "Master 🏅" },
                { lvl: 20, name: "Diamond 🔷" },
                { lvl: 15, name: "Platinum 💎" },
                { lvl: 10, name: "Gold 🥇" },
                { lvl: 5, name: "Silver 🥈" },
                { lvl: 2, name: "Iron ⚙️" }
            ]

            for (const r of ranks) {
                if (level >= r.lvl) {
                    rank = r.name
                    break
                }
            }
        }

        const displayLevel = isOwner ? "∞" : level
        const displayExp = isOwner ? "∞" : exp
        const nextLevelExp = isOwner ? "∞" : `${exp}/${level * 100}`

        // =========================
        // TIME
        // =========================
        const time = new Date().toLocaleString("id-ID", {
            timeZone: "Asia/Jakarta"
        })

        // =========================
        // CAPTION
        // =========================
        const caption = `
╭──〔 🌸 𝐌𝐈𝐍𝐍𝐙𝐘 𝐏𝐑𝐎𝐅𝐈𝐋𝐄 🌸 〕──
│ 👤 Nama   : ${username}
│ 🎭 Role   : ${role}
│ 🏆 Rank   : ${rank}
│ 📊 Level  : ${displayLevel}
│ ⭐ EXP    : ${displayExp}
│ 🎯 Next   : ${nextLevelExp}
│ 🆔 ID     : @${sender}
│ 🕒 WIB    : ${time}
╰─────────────────────

💬 *"Teruslah berkembang, bahkan karakter terkuat pun pernah lemah."*
`

        // =========================
        // AVATAR
        // =========================
        const imageUrl = `https://api.dicebear.com/7.x/anime/png?seed=${encodeURIComponent(username)}`

        try {
            const res = await axios.get(imageUrl, {
                responseType: "arraybuffer"
            })

            await sock.sendMessage(from, {
                image: Buffer.from(res.data),
                caption,
                mentions: [toJid(sender)] // 🔥 FIX UTAMA
            })

        } catch (e) {
            console.log("IMG ERROR:", e)

            await safeSend(sock, from, {
                text: caption,
                mentions: [toJid(sender)] // 🔥 tetap mention walau gagal gambar
            })
        }
    }
}