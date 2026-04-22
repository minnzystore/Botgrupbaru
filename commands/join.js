module.exports = {
    name: "join",
    execute: async (sock, from, text, db, safeSend, ctx) => {

        const { sender } = ctx
        const game = global.tictactoe[from]

        if (!game) {
            return safeSend(sock, from, { text: "❌ Tidak ada game!" })
        }

        if (game.players.length >= 2) {
            return safeSend(sock, from, { text: "⚠️ Game sudah penuh!" })
        }

        if (game.players.includes(sender)) {
            return safeSend(sock, from, { text: "⚠️ Kamu sudah join!" })
        }

        game.players.push(sender)

        const board = game.board.join(" | ")

        await safeSend(sock, from, {
            text: `🎮 *GAME DIMULAI!*

❌ @${game.players[0].split("@")[0]}
⭕ @${game.players[1].split("@")[0]}

${board}

Giliran: @${game.players[0].split("@")[0]}
Ketik angka 1-9`,
            mentions: game.players
        })
    }
}