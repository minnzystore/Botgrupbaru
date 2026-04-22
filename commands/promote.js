module.exports = {
    name: "promote",
    execute: async (sock, from, text, db, safeSend, ctx) => {

        const { isAdmin, isOwner, m } = ctx

        if (!isAdmin && !isOwner) {
            return safeSend(sock, from, { text: "❌ Khusus admin!" })
        }

        const mentioned = m.message?.extendedTextMessage?.contextInfo?.mentionedJid

        if (!mentioned) {
            return safeSend(sock, from, { text: "Tag user!" })
        }

        await sock.groupParticipantsUpdate(from, mentioned, "promote")
        await safeSend(sock, from, { text: "✅ Berhasil promote" })
    }
}