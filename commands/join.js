module.exports = {
    name: "join",
    execute: async (sock, from, text, db, safeSend, ctx) => {

        const { m } = ctx
        const senderJid = m.key.participant || m.key.remoteJid
        const senderName = m.pushName || "Player"

        const room = global.tictactoe[from]

        if (!room) {
            return safeSend(sock, from, {
                text: "❌ Belum ada game!"
            })
        }

        if (room.players.length >= 2) {
            return safeSend(sock, from, {
                text: "⚠️ Game sudah penuh!"
            })
        }

        if (room.players.includes(senderJid)) {
            return safeSend(sock, from, {
                text: "⚠️ Kamu sudah join!"
            })
        }

        room.players.push(senderJid)
        room.names[senderJid] = senderName

        const [p1, p2] = room.players

        await safeSend(sock, from, {
            text: `🎮 *GAME DIMULAI!*

❌ ${room.names[p1]}
⭕ ${room.names[p2]}

${room.board.join(" | ")}

Giliran: ${room.names[p1]}
Ketik *.move 1-9*`,
            mentions: [p1, p2]
        })
    }
}