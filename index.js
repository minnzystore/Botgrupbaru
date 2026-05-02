require("dotenv").config()

const {
    default: makeWASocket,
    useMultiFileAuthState,
    fetchLatestBaileysVersion,
    DisconnectReason,
    jidDecode
} = require("@whiskeysockets/baileys")

const P = require("pino")
const qrcode = require("qrcode-terminal")
const fs = require("fs")

// =========================
// GLOBAL VARS
// =========================
const commands = new Map()
const OWNER_NUMBER = (process.env.OWNER_NUMBER || "6285798407870").replace(/[^0-9]/g, "")
const prefix = "."
const MAX_QUEUE = 100

// =========================
// DATABASE
// =========================
const DB_FILE = "./database.json"
let dbLock = false

function loadDB() {
    try {
        if (!fs.existsSync(DB_FILE)) return {}
        return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'))
    } catch (e) {
        console.log("❌ DB LOAD ERROR:", e.message)
        return {}
    }
}

async function safeDB(fn) {
    if (dbLock) return null
    dbLock = true
    try {
        return await fn()
    } finally {
        dbLock = false
    }
}

// =========================
// HELPERS
// =========================
function decodeJid(jid) {
    if (!jid) return null
    try {
        if (/:\d+@/gi.test(jid)) {
            const decode = jidDecode(jid)
            if (decode?.user && decode?.server) return `${decode.user}@${decode.server}`
        }
        return jid
    } catch {
        return jid
    }
}

function getNumber(jid = "") {
    return jid?.split("@")[0] || ""
}

function toJid(number) {
    return `${number}@s.whatsapp.net`
}

function isOwnerJid(jid) {
    return getNumber(jid) === OWNER_NUMBER
}

const sleep = (ms) => new Promise(res => setTimeout(res, ms))

// Rate limit
const userCooldown = new Map()
function checkCooldown(user, time = 1500) {
    const now = Date.now()
    if (userCooldown.has(user) && now - userCooldown.get(user) < time) return false
    userCooldown.set(user, now)
    return true
}

// =========================
// QUEUE SYSTEM
// =========================
let queue = []
let isProcessing = false

async function safeSend(sock, jid, msg) {
    try {
        await sock.sendMessage(jid, msg)
        await sleep(400)
    } catch (e) {
        console.log("❌ SEND ERROR:", e.message)
    }
}

async function runQueue() {
    if (isProcessing || queue.length === 0) return
    isProcessing = true

    while (queue.length > 0) {
        const job = queue.shift()
        try {
            await job()
            await sleep(150)
        } catch (e) {
            console.log("❌ QUEUE ERROR:", e.message)
        }
    }
    isProcessing = false
}

// =========================
// MAIN BOT
// =========================
async function startBot() {
    console.log("🤖 Starting MinnzyBot...")
    
    const { state, saveCreds } = await useMultiFileAuthState("session")
    const { version } = await fetchLatestBaileysVersion()

    const sock = makeWASocket({
        version,
        logger: P({ level: "silent" }),
        auth: state,
        printQRInTerminal: false
    })

    sock.ev.on("creds.update", saveCreds)

    // Connection
    sock.ev.on("connection.update", (update) => {
        const { connection, lastDisconnect, qr } = update

        if (qr) {
            console.log("\n🔗 SCAN QR:")
            qrcode.generate(qr, { small: true })
        }

        if (connection === "open") {
            console.log("\n✅ BOT ONLINE!")
            console.log(`📱 Owner: ${OWNER_NUMBER}`)
        }

        if (connection === "close") {
            const reason = lastDisconnect?.error?.output?.statusCode
            console.log("❌ DISCONNECT:", DisconnectReason[reason] || reason)

            if (reason !== DisconnectReason.loggedOut) {
                console.log("🔄 Reconnect 3s...")
                setTimeout(startBot, 3000)
            } else {
                console.log("⚠️ SESSION LOGOUT - Hapus folder 'session'")
            }
        }
    })

    // Messages
    sock.ev.on("messages.upsert", async ({ messages }) => {
        try {
            for (const m of messages) {
                if (!m?.message || m.key?.fromMe) continue

                const from = m.key.remoteJid
                if (!from) continue

                const isGroup = from.endsWith("@g.us")
                m.pushName = m.pushName || "User"

                const senderRaw = isGroup ? m.key.participant : from
                if (!senderRaw) continue

                const senderJid = decodeJid(senderRaw)
                if (!senderJid) continue

                const sender = getNumber(senderJid)

                const msg = m.message
                const text = msg?.conversation || 
                           msg?.extendedTextMessage?.text || 
                           msg?.imageMessage?.caption || 
                           msg?.videoMessage?.caption || ""

                // Text check
                const msgTypes = ['conversation', 'extendedTextMessage']
                const hasText = msgTypes.some(type => msg?.[type])
                if (!hasText || !text.startsWith(prefix)) continue

                // Cooldown
                if (!checkCooldown(sender)) continue

                console.log(`📩 ${sender}: ${text.slice(0, 30)}`)

                // Level system
                await safeDB(async () => {
                    let db = loadDB()
                    if (!db[sender]) db[sender] = { exp: 0, level: 1 }

                    db[sender].exp += 10
                    while (db[sender].exp >= db[sender].level * 100) {
                        db[sender].exp -= db[sender].level * 100
                        db[sender].level++
                    }
                    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2))
                })

                // Group info
                let metadata = null, isAdmin = false
                if (isGroup) {
                    try {
                        metadata = await sock.groupMetadata(from)
                        isAdmin = metadata.participants
                            ?.filter(p => p.admin)
                            ?.some(p => getNumber(decodeJid(p.id)) === sender) || false
                    } catch (e) {
                        console.log("⚠️ GROUP ERROR:", e.message)
                    }
                }

                // Command
                const command = text.slice(1).split(" ")[0].toLowerCase()
                const cmd = commands.get(command)
                if (!cmd) continue

                // Queue
                if (queue.length > MAX_QUEUE) queue.shift()
                queue.push(async () => {
                    try {
                        await cmd.execute(sock, from, text, loadDB(), safeSend, {
                            isAdmin,
                            isOwner: isOwnerJid(senderJid),
                            isOwnerJid,
                            getNumber,
                            toJid,
                            sender,
                            senderJid,
                            metadata,
                            m,
                            OWNER_NUMBER,
                            OWNER_JID: toJid(OWNER_NUMBER)
                        })
                    } catch (e) {
                        console.log(`❌ CMD ${command} ERROR:`, e.message)
                        await safeSend(sock, from, { 
                            text: `❌ Error *${command}*\nCoba lagi!` 
                        })
                    }
                })

                runQueue()
            }
        } catch (error) {
            console.log("🚨 HANDLER ERROR:", error.message)
        }
    })

    // Load Commands
    if (fs.existsSync("./commands")) {
        const cmdFiles = fs.readdirSync("./commands").filter(f => f.endsWith('.js'))
        for (const file of cmdFiles) {
            try {
                delete require.cache[require.resolve(`./commands/${file}`)]
                const cmd = require(`./commands/${file}`)
                if (cmd?.name && typeof cmd.execute === 'function') {
                    commands.set(cmd.name.toLowerCase(), cmd)
                    console.log(`✅ ${cmd.name}`)
                }
            } catch (e) {
                console.log(`❌ CMD ${file}:`, e.message)
            }
        }
    }

    console.log(`\n📦 ${commands.size} Commands`)
    console.log("🎯 Bot Ready!\n")
}

// Start
startBot().catch(console.error)