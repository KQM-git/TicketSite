import { Prisma } from "@prisma/client"

export interface Message {
    discordId: string
    createdAt: number
    editedAt: number | null
    attachments: Prisma.JsonValue[]
    reactions: Prisma.JsonValue[]
    embeds: Prisma.JsonValue[]
    content: string
    components: Prisma.JsonValue[]
    stickers: Prisma.JsonValue[]
    reply: string | null
    userId: string
}

export interface User {
    discordId: string
    roleColor: string | null
    nickname: string | null
    username: string | null
    tag: string | null
    avatar: string | null
    bot: boolean | null
    verified: boolean | null
}

export interface Transcript {
    createdAt: number
    slug: string
    server: {
        name: string;
        id: string;
        icon: string | null;
    }
    channelName: string
    messages: Message[]
    users: User[]
    mentionedChannels: Channel[]
    mentionedRoles: Role[]
    queuedBy: string | null
    contributors: string[] | null
}
export interface Channel {
    discordId: string
    name: string
    type: string
}
export interface Role {
    discordId: string
    name: string
    roleColor: string | null
}

export interface MessageGroup {
    user: User,
    msg: Message[]
}


export interface EmbedData {
    title?: string
    url?: string
    description?: string
    color?: string
    thumbnail?: AttachmentData
    image?: AttachmentData
    video?: AttachmentData
}
export interface AttachmentData {
    name?: string
    url: string
    size?: number
    width?: string
    height?: string
    spoiler?: boolean
}
export interface Reaction {
    emoji: {
        name?: string
        id?: string
        url?: string
    }
    count: number
}
