const axios = require("axios")

module.exports = {
    name: "profile",
    execute: async (sock, from, text, db, safeSend, ctx) => {

        const { sender, m, isAdmin = false, isOwner = false, toJid } = ctx || {}
        if (!sender || !m) return

        const username = m.pushName || "User"
        const senderJid = typeof toJid === "function" ? toJid(sender) : null

        // =========================
        // DB SAFE
        // =========================
        if (!db[sender]) {
            db[sender] = { level: 1, exp: 0 }
        }

        let level = Number(db[sender].level) || 1
        let exp = Number(db[sender].exp) || 0

        let role = "User"
        let rank = "Bronze 🥉"

        // =========================
        // ROLE & RANK
        // =========================
        if (isOwner) {
            role = "Dewa Pencipta 👑"
            rank = "Dewa Tertinggi 🌌"
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
╭──〔 🌸 MINNZY PROFILE 🌸 〕──
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
        // AVATAR (LEBIH STABIL)
        // =========================
        const imageUrl = `https://api.dicebear.com/7.x/anime/png?seed=${encodeURIComponent(username)}`

        try {
            const res = await axios.get(imageUrl, {
                responseType: "arraybuffer",
                timeout: 8000 // 🔥 anti stuck
            })

            await sock.sendMessage(from, {
                image: Buffer.from(res.data),
                caption,
                ...(senderJid && { mentions: [senderJid] })
            })

        } catch (e) {
            console.log("IMG ERROR:", e?.message)

            // fallback tanpa gambar
            await safeSend(sock, from, {
                text: caption,
                ...(senderJid && { mentions: [senderJid] })
            })
        }
    }
}