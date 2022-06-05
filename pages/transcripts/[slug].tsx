/* eslint-disable @next/next/no-img-element */

import { DiscordMarkdown, DiscordReactions } from "@discord-message-components/react"
import { Prisma, PrismaClient } from "@prisma/client"
import Color from "color"
import { GetStaticPathsResult, GetStaticPropsContext, GetStaticPropsResult } from "next"
import Head from "next/head"
import { useEffect, useState } from "react"
import Twemoji from "react-twemoji"
import Main from "../../components/Main"
import { prisma } from "../../utils/utils"
import styles from "../style.module.css"
import copy from "copy-to-clipboard"
import ReactMarkdown from "react-markdown"

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
  transcript: Transcript
}
interface Transcript {
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
}
interface Channel {
  discordId: string
  name: string
  type: string
}
interface Role {
  discordId: string
  name: string
  roleColor: string | null
}

interface MessageGroup {
  user: User,
  msg: Message[]
}

export default function Experiment({ transcript, location }: Props & { location: string }) {
  const desc = `Transcript for ${transcript.channelName} (${transcript.messages.length} messages).`

  const [hl, setHl] = useState("0")

  useEffect(() => {
    if (hl != "0") {
      const id = setTimeout(() => {
        setHl("0")
      }, 2000)
      return () => clearTimeout(id)
    }
  }, [hl])

  const messageGroups: MessageGroup[] = []

  for (const msg of transcript.messages) {
    const prev = messageGroups[messageGroups.length - 1]
    if (msg.userId == prev?.user.discordId && !msg.reply) {
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

      <Evidence transcript={transcript} />
      <div className={`grid ${styles.gridAuto1} gap-2`}>
        <img src={(transcript.server.icon && `https://cdn.discordapp.com/icons/${transcript.server.id}/${transcript.server.icon}.png`) ?? "./img/empty.png"} width={128} height={128} className="w-24 h-24" alt="Server Icon" />
        <div className="text-xl font-semibold">
          <div>{transcript.server.name}</div>
          <div>{transcript.channelName}</div>
          <div>{transcript.messages.length} messages</div>
        </div>
      </div>

      {messageGroups.map((group, i) => <MessageGroup key={i} group={group} transcript={transcript} hl={hl} setHl={setHl} />)}

    </Main>
  )
}

function Evidence({ transcript }: {transcript: Transcript}) {
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

  const md = `### ${beautifiedChannel}

**By:** ${nick}\\#${tag}  
**Added:** ${date}  
[Discussion](https://tickets.deeznuts.moe/transcripts/${slug})

${findings}
`.trim()

  const [expanded, setExpanded] = useState(false)
  return expanded ?
      <div className="dark:bg-slate-600 bg-slate-300 rounded-xl my-2 p-2">
        <button onClick={() => {
          copy(md, {
            format: "text/plain"
          })
        }} className="bg-blue-600 disabled:bg-gray-900 text-slate-50 disabled:text-slate-400 w-fit px-3 py-1 text-center rounded-lg mr-2 cursor-pointer float-right">Copy evidence markdown template to clipboard</button>
        <button onClick={() => {
          setExpanded(false)
        }} className="bg-red-600 disabled:bg-gray-900 text-slate-50 disabled:text-slate-400 w-fit px-3 py-1 text-center rounded-lg mr-2 cursor-pointer float-right">Close evidence markdown</button>

        <ReactMarkdown>{md}</ReactMarkdown>
        <hr className="opacity-80"/>
        <textarea value={md} className="bg-slate-500 w-full my-2 h-72" />
        <div className="clear-both"></div>
      </div>
         :
      <button onClick={() => {
        setExpanded(true)
      }} className="bg-green-600 disabled:bg-gray-900 text-slate-50 disabled:text-slate-400 w-fit px-3 py-1 text-center rounded-lg mt-3 cursor-pointer float-right">Show evidence markdown</button>
}

function getDomain(str: string) {
  const url = new URL(str)
  if (["youtube.com", "youtu.be"].includes(url.hostname))
      return "YouTube"
  if (["i.imgur.com", "imgur.com"].includes(url.hostname))
      return "Imgur"
  return url.hostname
}

function MessageGroup({ group, transcript, hl, setHl }: { group: MessageGroup, transcript: Transcript, hl: string, setHl: (hl: string) => void }) {
  return <div className={`grid ${styles.gridAuto1} mt-2`} id={group.msg[0]?.discordId}>
    <div>
      {group.msg[0]?.reply && <div className="h-4" />}
      <div className="w-11 h-11 mt-2">
        <img src={(group.user.avatar && `https://cdn.discordapp.com/avatars/${group.user.discordId}/${group.user.avatar}.png`) ?? "https://cdn.discordapp.com/attachments/247122362942619649/980958465566572604/unknown.png"} className="w-11 h-11 rounded-full" loading="lazy" alt="Avatar" />
      </div>
    </div>
    <div className="ml-5 w-max-full pr-4">
      {group.msg[0]?.reply && <Reply replyId={group.msg[0].reply} transcript={transcript} setHl={setHl} />}
      <span className="font-semibold" title={`${group.user.username ?? "???"}#${group.user.tag}`} style={({
        color: group.user.roleColor == "#000000" ? undefined : group.user.roleColor ?? undefined
      })}>{group.user.nickname ?? group.user.username}</span>
      <span className="text-sm text-slate-700 dark:text-slate-400 ml-2">{new Date(group.msg[0].createdAt).toLocaleString(undefined, { month: "long", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit", weekday: "short" })}</span>
      <div>
        {group.msg.map((msg, j) => <Message key={j} msg={msg} transcript={transcript} hl={hl} />)}
      </div>
    </div>
  </div>
}

interface Embed {
  title?: string
  description?: string
  color?: string
}
interface Attachment {
  name?: string
  url: string
  size: string
  width?: string
  height?: string
  spoiler: boolean
}
interface Reaction {
  emoji: {
    name?: string
    id?: string
    url?: string
  }
  count: number
}
function Message({ msg, transcript, hl }: { msg: Message, transcript: Transcript, hl: string }) {
  msg.reactions.map(a => a as unknown as Reaction).map((r, i) => console.log(r))

  return <div className={`mb-2 w-full ${hl == msg.discordId ? styles.highlight : styles.nothl} rounded-lg`} id={msg.discordId}>
    <Formatter content={msg.content} transcript={transcript} />
    {msg.embeds?.length > 0 && <div>{msg.embeds.map(e => e as Embed).map((e, i) => <div key={i} className={`grid ${styles.gridAuto1} max-w-xl`}>
      <div className="w-1 rounded-l" style={({ backgroundColor: (e.color ?? "#2F3136") })} />
      <div className="flex flex-col p-2 rounded-r bg-slate-200 dark:bg-slate-800 dark:bg-opacity-75 bg-opacity-75">
        {e.title && <div className="font-bold">{e.title}</div>}
        <div className="text-sm">
          <Formatter content={e.description ?? ""} transcript={transcript} />
        </div>
      </div>
    </div>)}</div>}
    {msg.attachments?.length > 0 && <div>{msg.attachments.map(a => a as unknown as Attachment).map((a, i) => <div key={i} className={`flex max-w-xl ${a.spoiler ? "blur-xl hover:blur-0" : ""}`}>
      <img src={a.url} width={a.width} height={a.height} alt={a.name} loading="lazy" />
    </div>)}</div>}
    {msg.reactions?.length > 0 && <DiscordReactions>
        {msg.reactions.map(a => a as unknown as Reaction).map((r, i) => <div key={i} className="discord-reaction" title={r.emoji?.name ?? "unknown"}>
            {r.emoji.url ? <img src={r.emoji.url} alt={r.emoji.name} className="d-emoji" loading="lazy" /> : <Twemoji noWrapper={true} options={{
                className: "d-emoji"
              }}>
                <span>{r.emoji.name}</span>
            </Twemoji>}
            <span className="discord-reaction-count">{r.count}</span>
          </div>)}
      </DiscordReactions>}
  </div>
}


function Reply({ replyId, transcript, setHl } : { replyId: string, transcript: Transcript, setHl: (hl: string) => void }) {
  const msg = transcript.messages.find(u => u.discordId == replyId)
  if (!msg)
    return <div>
      <a className="text-xs" href={`#${replyId}`}>Reply to an unknown message</a>
    </div>
  return <div className="overflow-hidden h-4 text-xs">
    <a href={`#${replyId}`} onClick={() => setHl(replyId)} >Reply to <Formatter transcript={transcript} content={msg.content.split(/\n/)[0]}/></a>
  </div>
}

function Formatter({ content, transcript }: { transcript: Transcript, content: string}) {
  const any = /^(.*?)<(#|@&|@!?)(\d{17,19})>/

  const elements: JSX.Element[] = []
  let i = 0

  let match
  while (match = content.match(any)) {
    const [full, pre, type, id] = match
    elements.push(<DiscordMarkdown key={i++}>{pre}</DiscordMarkdown>)

    let name = id, roleColor, title
    title = id
    if (type == "#") {
      const channel = transcript.mentionedChannels.find(c => c.discordId == id)
      name = channel?.name ?? id
    } else if (type == "@&") {
      const role = transcript.mentionedRoles.find(c => c.discordId == id)
      name = role?.name ?? id
      roleColor = role?.roleColor
    } else {
      const user = transcript.users.find(c => c.discordId == id)
      name = user?.nickname ?? user?.username ?? id
      if (user?.username)
        title = user.username + "#" + user.tag
      // roleColor = user?.roleColor
    }

    elements.push(<span key={i++} title={title} className={`${styles.mention} bg cursor-pointer bg-opacity-30 hover:bg-opacity-75 transition-all`} style={({
      backgroundColor: roleColor ? `${Color(roleColor).desaturate(0.3).rgb().toString().replace(")", "")}, var(--tw-bg-opacity)` : undefined
    })}>{type.substring(0, 1)}{name}</span>)

    content = content.replace(full, "")
  }
  elements.push(<DiscordMarkdown key={i++}>{content}</DiscordMarkdown>)

  return <Twemoji noWrapper={true} options={{
    className: "d-emoji"
  }}>
    <span>
      {elements}
    </span>
  </Twemoji>
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
        channel: {
          select: {
            name: true
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
        }
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
          slug: transcript.slug,
          channelName: transcript.channel.name,
          users: transcript.users,
          server: transcript.server,
          messages: transcript.messages.map(m => ({ ...m, createdAt: m.createdAt.getTime(), editedAt: m.editedAt?.getTime() ?? null })),
          mentionedChannels: transcript.mentionedChannels,
          mentionedRoles: transcript.mentionedRoles,
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
