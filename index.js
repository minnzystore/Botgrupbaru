require("dotenv").config()

const {
    default: makeWASocket,
    useMultiFileAuthState,
    fetchLatestBaileysVersion,
    DisconnectReason
} = require("@whiskeysockets/baileys")

const P = require("pino")
const qrcode = require("qrcode-terminal")
const fs = require("fs")

// =========================
// CONFIG
// =========================
const OWNER_NUMBER = (process.env.OWNER_NUMBER || "6285798407870")
    .replace(/[^0-9]/g, "")

const prefix = "."

// =========================
// DATABASE
// =========================
const DB_FILE = "./database.json"

function loadDB() {
    try {
        if (!fs.existsSync(DB_FILE)) return {}
        return JSON.parse(fs.readFileSync(DB_FILE))
    } catch {
        return {}
    }
}

function saveDB(data) {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2))
}

// =========================
// HELPER
// =========================
function getNumber(jid) {
    if (!jid) return ""
    return jid.split("@")[0].split(":")[0]
}

function toJid(number) {
    return number + "@s.whatsapp.net"
}

function isOwnerJid(jid) {
    return getNumber(jid) === OWNER_NUMBER
}

// =========================
// SAFE SEND
// =========================
const sleep = (ms) => new Promise(res => setTimeout(res, ms))

async function safeSend(sock, jid, msg) {
    try {
        await sock.sendMessage(jid, msg)
        await sleep(300)
    } catch (e) {
        console.log("SEND ERROR:", e)
    }
}

// =========================
// QUEUE SYSTEM
// =========================
let queue = []
let isProcessing = false

async function runQueue() {
    if (isProcessing) return
    isProcessing = true

    while (queue.length > 0) {
        const job = queue.shift()
        try {
            await job()
        } catch (e) {
            console.log("QUEUE ERROR:", e)
        }
    }

    isProcessing = false
}

// =========================
// START BOT
// =========================
async function startBot() {

    const { state, saveCreds } = await useMultiFileAuthState("session")
    const { version } = await fetchLatestBaileysVersion()

    const sock = makeWASocket({
        version,
        logger: P({ level: "silent" }),
        auth: state
    })

    sock.ev.on("creds.update", saveCreds)

    // =========================
    // CONNECTION
    // =========================
    sock.ev.on("connection.update", (update) => {
        const { connection, lastDisconnect, qr } = update

        if (qr) qrcode.generate(qr, { small: true })

        if (connection === "open") {
            console.log("✅ BOT ONLINE")
        }

        if (connection === "close") {
            const reason = lastDisconnect?.error?.output?.statusCode
            console.log("❌ DISCONNECT:", reason)

            if (reason !== DisconnectReason.loggedOut) {
                setTimeout(startBot, 3000)
            }
        }
    })

    // =========================
    // WELCOME / GOODBYE
    // =========================
    sock.ev.on("group-participants.update", async (data) => {
        try {
            const { id, participants, action } = data

            for (const user of participants) {

                const jid = user?.includes?.("@") ? user : user?.id
                if (!jid) continue

                const number = getNumber(jid)

                const time = new Date().toLocaleTimeString("id-ID", {
                    timeZone: "Asia/Jakarta",
                    hour: "2-digit",
                    minute: "2-digit"
                })

                if (action === "add") {
                    await sock.sendMessage(id, {
                        text: `╔═══━━━「 𝐖𝐄𝐋𝐂𝐎𝐌𝐄 」━━━═══╗
║ 👋 Halo @${number}
║ 🎉 Selamat datang di grup
║ 🕒 ${time} WIB
║ 📌 Jangan lupa baca rules
╚═══━━━━━━━━━━━━━━━═══╝`,
                        mentions: [jid]
                    })
                }

                if (action === "remove") {
                    await sock.sendMessage(id, {
                        text: `╔═══━━━「 𝐆𝐎𝐎𝐃𝐁𝐘𝐄 」━━━═══╗
║ 👋 Bye @${number}
║ 😢 Semoga ketemu lagi
║ 🕒 ${time} WIB
╚═══━━━━━━━━━━━━━━━═══╝`,
                        mentions: [jid]
                    })
                }
            }

        } catch (e) {
            console.log("WELCOME ERROR:", e)
        }
    })

    // =========================
    // LOAD COMMANDS
    // =========================
    const commands = new Map()

    if (fs.existsSync("./commands")) {
        for (const file of fs.readdirSync("./commands")) {

            if (!file.endsWith(".js")) continue

            try {
                const cmd = require(`./commands/${file}`)

                if (cmd?.name && cmd?.execute) {
                    commands.set(cmd.name.toLowerCase(), cmd)
                    console.log("✅ Loaded:", cmd.name)
                } else {
                    console.log("⚠️ Invalid command:", file)
                }

            } catch (e) {
                console.log("❌ CMD ERROR:", file, e)
            }
        }
    }

    console.log("📦 Total Commands:", [...commands.keys()])

    // =========================
    // MESSAGE HANDLER
    // =========================
    sock.ev.on("messages.upsert", async ({ messages }) => {
        try {
            for (const m of messages) {

                if (!m?.message || m.key.fromMe) continue

                const from = m.key.remoteJid
                const senderRaw = m.key.participant || m.key.remoteJid

                if (!senderRaw || !senderRaw.includes("@")) continue

                const sender = getNumber(senderRaw) || senderRaw.split("@")[0]

                const text =
                    m.message?.conversation ||
                    m.message?.extendedTextMessage?.text ||
                    m.message?.imageMessage?.caption ||
                    m.message?.videoMessage?.caption ||
                    ""

                if (!text.startsWith(prefix)) continue

                const command = text.slice(1).split(" ")[0].toLowerCase()
                console.log("📩 CMD:", command, "| FROM:", sender)

                let db = loadDB()

                if (!db[sender]) db[sender] = { exp: 0, level: 1 }

                db[sender].exp += 10

                while (db[sender].exp >= db[sender].level * 100) {
                    db[sender].exp -= db[sender].level * 100
                    db[sender].level++
                }

                saveDB(db)

                let metadata = null
                let isAdmin = false

                if (from.endsWith("@g.us")) {
                    try {
                        metadata = await sock.groupMetadata(from)

                        isAdmin = metadata.participants
                            .filter(p => p.admin)
                            .some(p => getNumber(p.id) === sender)

                    } catch (e) {
                        console.log("GROUP META ERROR:", e)
                    }
                }

                const isOwner = isOwnerJid(senderRaw)

                const cmd = commands.get(command)

                if (!cmd) {
                    console.log("❌ CMD NOT FOUND:", command)
                    continue // 🔥 FIX PENTING
                }

                queue.push(async () => {
                    await cmd.execute(sock, from, text, db, safeSend, {
                        isAdmin,
                        isOwner,
                        isOwnerJid,
                        getNumber,
                        toJid,
                        sender,
                        metadata,
                        m
                    })
                })

                runQueue()
            }

        } catch (e) {
            console.log("HANDLER ERROR:", e)
        }
    })
}

startBot()