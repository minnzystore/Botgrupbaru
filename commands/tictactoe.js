global.tictactoe = global.tictactoe || {}

module.exports = {
    name: "tictactoe",
    execute: async (sock, from, text, db, safeSend, ctx) => {

        const { m } = ctx
        if (!m) return

        const senderJid = m.key.participant || m.key.remoteJid
        const senderName = m.pushName || "Player"

        if (global.tictactoe[from]) {
            return safeSend(sock, from, {
                text: "⚠️ Masih ada game berlangsung!"
            })
        }

        global.tictactoe[from] = {
            board: ["1","2","3","4","5","6","7","8","9"],
            players: [senderJid],
            names: { [senderJid]: senderName },
            turn: 0
        }

        await safeSend(sock, from, {
            text: `🎮 *TIC TAC TOE*

❌ ${senderName}

Menunggu Player 2...
Ketik *.join* untuk ikut`,
            mentions: [senderJid]
        })
    }
}