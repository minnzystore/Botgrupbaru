module.exports = {
    name: "move",
    execute: async (sock, from, text, db, safeSend, ctx) => {

        const { m } = ctx
        const senderJid = m.key.participant || m.key.remoteJid

        const room = global.tictactoe[from]

        if (!room) {
            return safeSend(sock, from, {
                text: "❌ Tidak ada game!"
            })
        }

        if (room.players.length < 2) {
            return safeSend(sock, from, {
                text: "⚠️ Menunggu player 2!"
            })
        }

        const turnPlayer = room.players[room.turn]

        if (senderJid !== turnPlayer) {
            return safeSend(sock, from, {
                text: `⏳ Bukan giliran kamu!\nGiliran: ${room.names[turnPlayer]}`
            })
        }

        const args = text.split(" ")
        const pos = parseInt(args[1])

        if (!pos || pos < 1 || pos > 9) {
            return safeSend(sock, from, {
                text: "⚠️ Gunakan angka 1 - 9"
            })
        }

        if (room.board[pos - 1] === "❌" || room.board[pos - 1] === "⭕") {
            return safeSend(sock, from, {
                text: "⚠️ Posisi sudah diisi!"
            })
        }

        const symbol = room.turn === 0 ? "❌" : "⭕"
        room.board[pos - 1] = symbol

        // =========================
        // CEK MENANG
        // =========================
        const winPattern = [
            [0,1,2],[3,4,5],[6,7,8],
            [0,3,6],[1,4,7],[2,5,8],
            [0,4,8],[2,4,6]
        ]

        const isWin = winPattern.some(p =>
            p.every(i => room.board[i] === symbol)
        )

        if (isWin) {
            await safeSend(sock, from, {
                text: `🏆 *MENANG!*

${room.board.join(" | ")}

🎉 ${room.names[senderJid]} menang!`,
                mentions: [senderJid]
            })

            delete global.tictactoe[from]
            return
        }

        // =========================
        // CEK DRAW
        // =========================
        if (!room.board.some(v => !["❌","⭕"].includes(v))) {
            await safeSend(sock, from, {
                text: `🤝 *DRAW!*

${room.board.join(" | ")}`
            })

            delete global.tictactoe[from]
            return
        }

        // =========================
        // NEXT TURN
        // =========================
        room.turn = room.turn === 0 ? 1 : 0
        const nextPlayer = room.players[room.turn]

        await safeSend(sock, from, {
            text: `${room.board.join(" | ")}

Giliran: ${room.names[nextPlayer]}`,
            mentions: [nextPlayer]
        })
    }
}