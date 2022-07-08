import { PrismaClient } from "@prisma/client"
import { Transcript, Message } from "./types"

export const prisma = new PrismaClient()

export async function fetchTranscript(slug: string | string[] | undefined | null): Promise<Transcript | null> {
    if (typeof slug != "string")
        return null

    const fetched = await prisma.transcript.findUnique({
        where: { slug },
        include: {
            _count: {
                select: {
                    messages: true
                }
            },
            messages: {
                select: {
                    id: true,
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
                    id: "desc"
                },
                take: 250
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
        messages: fetched.messages.map(m => ({ ...m, createdAt: m.createdAt.getTime(), editedAt: m.editedAt?.getTime() ?? null })),
        messageCount: fetched._count.messages,
        mentionedChannels: fetched.mentionedChannels,
        mentionedRoles: fetched.mentionedRoles,
        createdAt: fetched.createdAt.getTime(),
        queuedBy: fetched.queuedTranscript?.transcriber?.username ?? null,
        contributors: fetched.ticket?.contributors.map(c => `${c.username}\\#${c.tag}`) ?? null
    }
}

export async function fetchMore(slug: string, offset: number): Promise<{messages: Message[], isDone: boolean } | null> {
    const fetched = await prisma.transcript.findUnique({
        where: { slug: slug },
        include: {
            queuedTranscript: {
                select: { id: true }
            },
            messages: {
                select: {
                    id: true,
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
                    id: "desc"
                },
                cursor: {
                    id: offset
                },
                skip: 1,
                take: 100
            }
        }
    })

    if (!fetched || fetched.messages.length == 0)
        return null

    return {
        messages: fetched.messages.map(m => ({ ...m, createdAt: m.createdAt.getTime(), editedAt: m.editedAt?.getTime() ?? null })),
        isDone: fetched.queuedTranscript == null
    }
}
