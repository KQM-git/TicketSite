import { PrismaClient } from "@prisma/client"
import { Transcript } from "./types"

export function urlify(input: string, shouldRemoveBrackets: boolean): string {
    if (shouldRemoveBrackets)
        input = removeBrackets(input)
    return input.toLowerCase().replace(/[():"'-]/g, "").trim().replace(/ +/g, "-")
}

export function removeBrackets(input: string) {
    return input.replace(/\(.*\)/g, "").replace(/ +:/, ":")
}

export function clean(input: string) {
    return input.replace(/ ?\$\{.*?\}/g, "").replace(/ ?\(.*?\)/g, "").replace(/[*[\]]/g, "").split("\n")[0]
}

export function parseTranscript(transcript: Transcript) {
    const { messages, users, slug } = transcript

    let finding = "Finding: *Unknown*", evidence = "Evidence: *Unknown*", significance = "Significance: *Unknown*"
    let nick = "Unknown", tag = "????"

    for (const message of messages) {
        const content = message.content
        if (!content) continue

        if (content.match(/\**(Finding|Theory|Bug|Theory\/Finding\/Bug)\**:\**/i)) {
            finding = content
            evidence = ""
            significance = ""
        } else if (content.match(/\**Evidence\**:\**/i)) {
            evidence = content
            significance = ""
        } else if (content.match(/\**Significance\**:\**/i)) {
            significance = content
        } else
            continue

        const user = users.find(u => u.discordId == message.userId)
        nick = user?.username ?? "Unknown"
        tag = user?.tag ?? "????"
    }

    const date = new Date(transcript.createdAt).toISOString().split("T")[0]

    const findings = `${finding}
  
  ${evidence}
  
  ${significance}`
        .replace(/\**(Finding|Theory|Bug|Theory\/Finding\/Bug|Evidence|Significance)\**:\**\s*/gi, (_, a) => `**${a}:**  \n`)
        .replace(/(https?:\/\/.*)(\s)/g, (_, url, w) => `[${getDomain(url)}](${url})${w}`)
        .trim()

    const beautifiedChannel = transcript.channelName
        .replace(/-/g, " ")
        .replace(/^./, (a) => a.toUpperCase())
        .replace(/(^|\s)./g, (a) => ["a", "to", "the"].includes(a) ? a : a.toUpperCase())

    return `### ${beautifiedChannel}
  
**By:** ${nick}\\#${tag}${transcript.contributors ? ", " + transcript.contributors.join(", ") : ""}  
**Added:** ${date}  
[Discussion](https://tickets.deeznuts.moe/transcripts/${slug})

${findings}
`.trim()
}

function getDomain(str: string) {
    const url = new URL(str)
    if (["youtube.com", "youtu.be"].includes(url.hostname))
        return "YouTube"
    if (["i.imgur.com", "imgur.com"].includes(url.hostname))
        return "Imgur"
    return url.hostname
}

export const prisma = new PrismaClient()

export async function fetchTranscript(slug: string | string[] | undefined | null): Promise<Transcript | null> {
    if (typeof slug != "string")
        return null

    const fetched = await prisma.transcript.findUnique({
        where: { slug },
        include: {
            messages: {
                select: {
                  discordId: true,
                  createdAt: true,
                  editedAt: true,
                  attachments: true,
                  reactions: true,
                  embeds: true,
                  content: true,
                  components: true,
                  reply: true,
                  stickers: true,
                  userId: true,
                },
                orderBy: {
                    discordId: "asc"
                }
            },
            channel: {
                select: {
                    name: true
                }
            },
            users: {
                select: {
                    discordId: true,
                    roleColor: true,
                    nickname: true,
                    username: true,
                    tag: true,
                    avatar: true,
                    bot: true,
                    verified: true
                }
            },
            server: {
                select: {
                    name: true,
                    id: true,
                    icon: true
                }
            },
            mentionedChannels: {
                select: {
                    discordId: true,
                    name: true,
                    type: true
                }
            },
            mentionedRoles: {
                select: {
                    discordId: true,
                    name: true,
                    roleColor: true
                }
            },
            queuedTranscript: {
                select: {
                    transcriber: {
                        select: {
                            username: true
                        }
                    }
                }
            },
            ticket: {
                select: {
                    contributors: {
                        select: {
                            username: true,
                            tag: true
                        }
                    }
                }
            }
        }
    })

    if (!fetched)
        return null

    return {
        slug: fetched.slug,
        channelName: fetched.channel.name,
        users: fetched.users,
        server: fetched.server,
        messages: fetched.messages.map(m => ({ ...m,  createdAt: m.createdAt.getTime(), editedAt: m.editedAt?.getTime() ?? null })),
        mentionedChannels: fetched.mentionedChannels,
        mentionedRoles: fetched.mentionedRoles,
        createdAt: fetched.createdAt.getTime(),
        queuedBy: fetched.queuedTranscript?.transcriber?.username ?? null,
        contributors: fetched.ticket?.contributors.map(c => `${c.username}\\#${c.tag}`) ?? null
    }
}
