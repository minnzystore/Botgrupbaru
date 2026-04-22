module.exports = {
    name: "demote",
    execute: async (sock, from, text, db, safeSend, ctx) => {

        const { isAdmin, isOwner, m, metadata, getNumber } = ctx

        const owner = ["6285798407870@s.whatsapp.net"]

        if (!isAdmin && !isOwner)
            return safeSend(sock, from, { text: "❌ Khusus admin!" })

        let target = null

        const mentioned = m.message?.extendedTextMessage?.contextInfo?.mentionedJid

        if (mentioned && mentioned.length > 0) {
            target = mentioned[0]
        } else if (m.message?.extendedTextMessage?.contextInfo?.participant) {
            target = m.message.extendedTextMessage.contextInfo.participant
        }

        if (!target)
            return safeSend(sock, from, { text: "❌ Tag atau reply user!" })

        const targetJid = target
const targetNumber = getNumber(targetJid)

        // 🚫 PROTECT OWNER
        if (owner.includes(targetJid)) {
            return safeSend(sock, from, {
                text: "🚫 Owner tidak bisa di demote!"
            })
        }

        // 🔍 CEK ADMIN TARGET
        const targetIsAdmin = metadata.participants
    .filter(p => p.admin)
    .some(p => getNumber(p.id) === targetNumber)

        if (targetIsAdmin && !isOwner) {
            return safeSend(sock, from, {
                text: "🚫 Tidak bisa demote sesama admin!"
            })
        }

        try {
            await sock.groupParticipantsUpdate(from, [targetJid], "demote")
            await safeSend(sock, from, { text: "✅ Berhasil demote" })
        } catch (err) {
            console.log(err)
            await safeSend(sock, from, {
                text: "❌ Gagal demote (bot mungkin bukan admin)"
            })
        }
    }
}