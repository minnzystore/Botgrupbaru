global.tictactoe = global.tictactoe || {}

module.exports = {
    name: "tictactoe",
    execute: async (sock, from, text, db, safeSend, ctx) => {

        const { sender, toJid } = ctx

        if (!sender) return

        // =========================
        // CEK GAME BERJALAN
        // =========================
        if (global.tictactoe[from]) {
            return safeSend(sock, from, {
                text: "⚠️ Masih ada game berlangsung!"
            })
        }

        // =========================
        // BUAT GAME BARU
        // =========================
        global.tictactoe[from] = {
            board: ["1","2","3","4","5","6","7","8","9"],
            players: [sender],
            turn: 0
        }

        // =========================
        // SEND MESSAGE (FIX MENTION)
        // =========================
        await safeSend(sock, from, {
            text: `🎮 *TIC TAC TOE*

Player 1: @${sender} (❌)

Menunggu Player 2...
Ketik *.join* untuk ikut`,
            mentions: [toJid(sender)] // 🔥 FIX UTAMA
        })
    }
}