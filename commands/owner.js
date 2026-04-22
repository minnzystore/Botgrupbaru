module.exports = {
    name: "owner",
    execute: async (sock, from, text, db, safeSend, ctx) => {

        const ownerNumber = "6285798407870@s.whatsapp.net"

        const menu = `
╔═━━━「 👑 𝐎𝐖𝐍𝐄𝐑 𝐈𝐍𝐅𝐎 」━━━═╗
║ 
║ 👤 Nama  : Mikasa Amerta
║ 📱 Nomor : @${ownerNumber.split("@")[0]}
║ 🛡️ Status: Developer Bot
║ ⚡ Role  : Owner / Creator
║ 
╚═━━━━━━━━━━━━━━━━━━━═╝

┌─〔 💬 𝐏𝐄𝐒𝐀𝐍 〕
│ Jangan spam bot ya 🚫
│ Gunakan dengan bijak ✨
└───────────────
`

        await sock.sendMessage(from, {
            text: menu,
            mentions: [ownerNumber]
        })
    }
}