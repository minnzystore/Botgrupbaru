module.exports = {
    name: "tagall",
    execute: async (sock, from, text, db, safeSend, ctx) => {

        if (!from.endsWith("@g.us")) {
            return safeSend(sock, from, {
                text: "❌ Command ini hanya untuk group!"
            })
        }

        const metadata = ctx?.metadata
        if (!metadata?.participants) {
            return safeSend(sock, from, {
                text: "❌ Data group tidak ditemukan!"
            })
        }

        await sock.sendMessage(from, {
            text: "@minasang"
        })
    }
}