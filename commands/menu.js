module.exports = {
    name: "menu",
    execute: async (sock, from, text, db, safeSend, ctx) => {

        const { sender, m, isAdmin, isOwner, toJid } = ctx || {}

        if (!sender || !m) return

        if (typeof toJid !== "function") {
            return safeSend(sock, from, { text: "❌ System error (toJid)" })
        }

        const username = m.pushName || "User"

        // =========================
        // DB SAFE
        // =========================
        if (!db[sender]) {
            db[sender] = { level: 1, exp: 0 }
        }

        let level = Number(db[sender].level) || 1
        let exp = Number(db[sender].exp) || 0
        const maxExp = level * 100

        const ownerName = "Mikasa Amerta"

        let role = "User"
        let rank = "Bronze 🥉"

        // =========================
        // OWNER MODE
        // =========================
        if (isOwner) {
            role = "Dewa Pencipta 👑"
            rank = "Dewa Tertinggi 🌌"
            level = "∞"
            exp = "∞"
        } else {

            if (isAdmin) role = "Admin 🛡️"

            if (level >= 2) rank = "Iron ⚙️"
            if (level >= 5) rank = "Silver 🥈"
            if (level >= 10) rank = "Gold 🥇"
            if (level >= 15) rank = "Platinum 💎"
            if (level >= 20) rank = "Diamond 🔷"
            if (level >= 30) rank = "Master 🏅"
            if (level >= 40) rank = "Grandmaster ⚡"
            if (level >= 50) rank = "Mythic 🔥"
            if (level >= 75) rank = "Legend 🌟"
            if (level >= 100) rank = "Supreme 👑"
            if (level >= 150) rank = "Immortal 💀"
            if (level >= 200) rank = "God Mode 🪐"
            if (level >= 999) rank = "VVIP 👑🌟💎🔥"
        }

        // =========================
        // TIME
        // =========================
        const now = new Date()
        const wibTime = now.toLocaleString("id-ID", {
            timeZone: "Asia/Jakarta"
        })

        // =========================
        // PROGRESS BAR
        // =========================
        let bar = ""
        if (!isOwner) {
            const percent = Math.floor((exp / maxExp) * 100)
            const filled = Math.floor(percent / 10)
            bar = "█".repeat(filled) + "░".repeat(10 - filled)
            bar = `${bar} ${percent}%`
        } else {
            bar = "∞∞∞∞∞∞∞∞∞∞"
        }

        // =========================
        // MENU TEXT (FULL FITUR)
        // =========================
        const menu = `
╭━━━〔 🌸 𝐌𝐈𝐍𝐍𝐙𝐘 𝐁𝐎𝐓 🌸 〕━━━╮
┃ 👑 Owner   : ${ownerName}
┃ 👤 User    : ${username}
┃ 🎭 Role    : ${role}
┃ 🏆 Rank    : ${rank}
┃ 📊 Level   : ${level}
┃ ⭐ EXP     : ${exp}${isOwner ? "" : ` / ${maxExp}`}
┃ 📈 Progress: ${bar}
┃ 🆔 Nomor   : @${sender}
┃ 🕒 Time    : ${wibTime}
╰━━━━━━━━━━━━━━━━━━━━━━╯

┌───〔 🌟 MENU UTAMA 〕
│ ✧ .menu
│ ✧ .profile
│ ✧ .info
└────────────

┌───〔 👑 ADMIN 〕
│ ✧ .tagall
│ ✧ .kick
│ ✧ .promote
│ ✧ .demote
└────────────

┌───〔 🎮 GAME 〕
│ ✧ .tictactoe
│ ✧ .join
│ ✧ .move
└────────────

┌───〔 😂 FUN 〕
│ ✧ .memeindo
│ ✧ .memeanime
│ ✧ .rate
└────────────

┌───〔 📥 DOWNLOADER 〕
│ 🎵 .ytmp3
│ 🎬 .ytmp4
│ 🎵 .ttmp3
│ 🎬 .ttmp4
│ 📸 .ig
└────────────

┌───〔 ⚡ STATUS 〕
│ 🤖 Bot Name : MinnzyBot
│ 🎌 Style    : Anime Mode
│ 🟢 Status   : Active & Online
└────────────

┌───〔 💬 MOTIVASI 〕
│ ✨ "Pelan-pelan juga ga apa"
│ 🌸 "Kamu kuat, jangan nyerah!"
│ 💫 "Hari ini susah? Besok pasti bisa!"
└────────────

┌───〔 ⚠️ PERINGATAN 〕
│ 🚫 Jangan spam bot
│ 🚫 Gunakan dengan bijak
│ ⚡ Abuse = Auto Block
└────────────
`

        // =========================
        // SEND (ANTI ERROR)
        // =========================
        try {
            await sock.sendMessage(from, {
                text: menu,
                mentions: [toJid(sender)]
            })
        } catch (e) {
            console.log("MENU ERROR:", e)

            // fallback
            await safeSend(sock, from, {
                text: menu.replace(/@/g, "")
            })
        }
    }
}