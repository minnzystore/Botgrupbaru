function checkWin(b) {
    const win = [
        [0,1,2],[3,4,5],[6,7,8],
        [0,3,6],[1,4,7],[2,5,8],
        [0,4,8],[2,4,6]
    ]
    return win.some(([a,b1,c]) => b[a] === b[b1] && b[b1] === b[c])
}

module.exports = {
    name: "move",
    execute: async (sock, from, text, db, safeSend, ctx) => {

        const { sender } = ctx
        const game = global.tictactoe[from]

        if (!game) return

        if (game.players.length < 2) return

        const playerIndex = game.players.indexOf(sender)
        if (playerIndex !== game.turn) return

        const pos = parseInt(text.split(" ")[1]) - 1

        if (isNaN(pos) || pos < 0 || pos > 8) {
            return safeSend(sock, from, { text: "❌ Pilih angka 1-9!" })
        }

        if (["❌","⭕"].includes(game.board[pos])) {
            return safeSend(sock, from, { text: "⚠️ Posisi sudah diambil!" })
        }

        const symbol = playerIndex === 0 ? "❌" : "⭕"
        game.board[pos] = symbol

        const board = game.board.join(" | ")

        // 🔥 CEK MENANG
        if (checkWin(game.board)) {
            await safeSend(sock, from, {
                text: `🏆 @${sender.split("@")[0]} MENANG!

${board}`,
                mentions: [sender]
            })
            delete global.tictactoe[from]
            return
        }

        // 🔥 CEK DRAW
        if (game.board.every(x => ["❌","⭕"].includes(x))) {
            await safeSend(sock, from, {
                text: `🤝 SERI!

${board}`
            })
            delete global.tictactoe[from]
            return
        }

        game.turn = game.turn === 0 ? 1 : 0

        await safeSend(sock, from, {
            text: `${board}

Giliran: @${game.players[game.turn].split("@")[0]}`,
            mentions: [game.players[game.turn]]
        })
    }
}