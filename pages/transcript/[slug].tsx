/* eslint-disable @next/next/no-img-element */

import { Prisma, PrismaClient } from "@prisma/client"
import Color from "color"
import { GetStaticPathsResult, GetStaticPropsContext, GetStaticPropsResult } from "next"
import Head from "next/head"
import ReactMarkdown from "react-markdown"
import Main from "../../components/Main"
import { prisma } from "../../utils/utils"
import styles from "../style.module.css"

interface Message {
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
  serverId: string
  transcriptId: number
}

interface User {
  discordId: string
  serverId: string
  roleColor: string | null
  nickname: string | null
  username: string | null
  tag: string | null
  avatar: string | null
  bot: boolean | null
  verified: boolean | null
}

interface Props {
  transcript: {
    createdAt: number
    channelId: string
    channelName: string
    messages: Message[]
    users: User[]
    server: {
      name: string;
      id: string;
      icon: string | null;
    }
    verifications: {
      createdAt: number
      channelId: string
      channelName: string
      userId: string
      serverId: string
      transcriptId: number | null
      ticketsId: number
    }[]
  }
}

interface MessageGroup {
  user: User,
  msg: Message[]
}

export default function Experiment({ transcript, location }: Props & { location: string }) {
  const desc = `${transcript.channelName}.`

  const messageGroups: MessageGroup[] = []

  for (const msg of transcript.messages) {
    const prev = messageGroups[messageGroups.length - 1]
    if (msg.userId == prev?.user.discordId) {
      prev.msg.push(msg)
    } else {
      messageGroups.push({
        msg: [msg],
        user: transcript.users.find(x => msg.userId == x.discordId) ?? {
          discordId: msg.discordId,
          serverId: msg.serverId,
          avatar: null,
          bot: null,
          nickname: null,
          roleColor: null,
          tag: null,
          username: null,
          verified: null
        }
      })
    }
  }


  return (
    <Main>
      <Head>
        <title>{transcript.channelName} | KQM Transcripts</title>
        <meta name="twitter:card" content="summary" />
        <meta property="og:title" content={`${transcript.channelName} | KQM Transcripts`} />
        <meta property="og:description" content={desc} />
        <meta name="description" content={desc} />
      </Head>

      <div className={`grid ${styles.gridAuto1} gap-2`}>
        <img src={(transcript.server.icon && `https://cdn.discordapp.com/icons/${transcript.server.id}/${transcript.server.icon}.png`) ?? "./img/empty.png"} width={128} height={128} className="w-24 h-24" alt="Server Icon" />
        <div className="text-xl font-semibold">
          <div>{transcript.server.name}</div>
          <div>{transcript.channelName}</div>
          <div>{transcript.messages.length} messages</div>
        </div>
      </div>

      {messageGroups.map((group, i) => <MessageGroup key={i} group={group} users={transcript.users} />)}

    </Main>
  )
}

function MessageGroup({ group, users }: { group: MessageGroup, users: User[] }) {
  return <div className={`grid ${styles.gridAuto1} mt-2`}>
    <div className="w-11 h-11 mt-1">
      <img src={(group.user.avatar && `https://cdn.discordapp.com/avatars/${group.user.discordId}/${group.user.avatar}.png`) ?? "https://cdn.discordapp.com/attachments/247122362942619649/980958465566572604/unknown.png"} className="w-11 h-11 rounded-full" alt="Avatar" />
    </div>
    <div className="ml-5 w-full">
      <span className="font-semibold" style={({
        color: group.user.roleColor == "#000000" ? undefined : group.user.roleColor ?? undefined
      })}>{group.user.nickname ?? group.user.username}</span>
      <span className="text-sm text-slate-700 dark:text-slate-400 ml-2">{new Date(group.msg[0].createdAt).toLocaleString(undefined, { month: "long", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit", weekday: "short" })}</span>
      <div>
        {group.msg.map((msg, j) => <Message key={j} msg={msg} users={users} />)}
      </div>
    </div>
  </div>
}

interface Embed {
  title?: string
  description?: string
  color?: number
}
function Message({ msg, users }: { msg: Message, users: User[] }) {
  return <div className="mb-2">
    <ReactMarkdown className={styles.md} >{cleanUsers(msg.content, users)}</ReactMarkdown>
    <div>{msg.embeds.map(e => e as Embed).map((e, i) => <div key={i} className="flex max-w-xl">
      <div className="w-1 rounded-l" style={({ backgroundColor: Color(e.color ?? "#2F3136").hex() })} />
      <div className="flex flex-col p-2 rounded-r bg-slate-200 dark:bg-slate-800 dark:bg-opacity-50 bg-opacity-50">
        {e.title && <div className="font-bold">{e.title}</div>}
        <ReactMarkdown>{cleanUsers(e.description ?? "", users)}</ReactMarkdown>
      </div>
    </div>)}</div>
  </div>
}


function cleanUsers(msg: string, users: User[]): string {
  return msg.replace(/<@(\d+)>/g, (_, id) => {
    const u = users.find(u => u.discordId == id)
    return `@${u?.nickname ?? u?.username ?? id}`
  })
}

export async function getStaticProps(context: GetStaticPropsContext): Promise<GetStaticPropsResult<Props>> {
  try {
    const slug = context.params?.slug
    if (typeof slug != "string")
      return {
        notFound: true,
        revalidate: 24 * 60 * 60
      }

    const transcript = await prisma.transcript.findUnique({
      where: { slug },
      include: {
        messages: {
          orderBy: {
            discordId: "asc"
          }
        },
        users: true,
        server: {
          select: {
            name: true,
            id: true,
            icon: true
          }
        },
        verifications: true
      }
    })

    if (!transcript) {
      return {
        notFound: true,
        revalidate: 15 * 60
      }
    }
    return {
      props: {
        transcript: {
          channelId: transcript.channelId,
          channelName: transcript.channelName,
          users: transcript.users,
          verifications: transcript.verifications.map(m => ({ ...m, createdAt: m.createdAt.getTime() })),
          server: transcript.server,
          messages: transcript.messages.map(m => ({ ...m, createdAt: m.createdAt.getTime(), editedAt: m.editedAt?.getTime() ?? null })),
          createdAt: transcript.createdAt.getTime()
        }
      },
      revalidate: 60 * 60 * 1
    }
  } catch (error) {
    return {
      notFound: true,
      revalidate: 15 * 60
    }
  }
}


export async function getStaticPaths(): Promise<GetStaticPathsResult> {
  const prisma = new PrismaClient()
  const slugs = await prisma.transcript.findMany({
    select: {
      slug: true
    },
    take: 10
  })

  return {
    paths: slugs?.map(s => ({
      params: { slug: s.slug }
    })) ?? [],
    fallback: "blocking"
  }
}
