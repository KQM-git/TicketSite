/* eslint-disable @next/next/no-img-element */

import { DiscordMarkdown, DiscordReactions } from "@discord-message-components/react"
import { PrismaClient } from "@prisma/client"
import Color from "color"
import copy from "copy-to-clipboard"
import { GetStaticPathsResult, GetStaticPropsContext, GetStaticPropsResult } from "next"
import Head from "next/head"
import { Dispatch, SetStateAction, useState } from "react"
import InfiniteScroll from "react-infinite-scroll-component"
import ReactMarkdown from "react-markdown"
import Twemoji from "react-twemoji"
import FormattedLink from "../../components/FormattedLink"
import Main from "../../components/Main"
import { Avatar, Username } from "../../components/User"
import { fetchTranscript } from "../../utils/db"
import { AttachmentData, EmbedData, Message, MessageGroup, Reaction, Transcript } from "../../utils/types"
import { dateFormatter, getUser, parseTranscript } from "../../utils/utils"
import styles from "../style.module.css"

interface Props {
  transcript: Transcript
  host: string
}

export default function Experiment({ transcript, host }: Props) {
  const desc = `Transcript for ${transcript.channelName} (${transcript.messageCount} messages).`

  const messageGroups: MessageGroup[] = []

  const [messages, setMessages] = useState(transcript.messages)
  const [hasMore, setHasMore] = useState(messages.length < transcript.messageCount)

  for (const msg of messages) {
    const prev = messageGroups[messageGroups.length - 1]
    if (msg.userId == prev?.user.discordId && !msg.reply) {
      prev.msg.push(msg)
    } else {
      messageGroups.push({
        msg: [msg],
        user: getUser(msg.userId, transcript)
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

      <Evidence transcript={transcript} host={host} />
      {transcript.queuedBy && <div className="font-bold text-4xl text-red-700 dark:text-red-400">This ticket is still being transcribed, please wait until all messages have been added...</div>}
      <div className={`grid ${styles.gridAuto1} gap-2`}>
        <img src={(transcript.server.icon && `https://cdn.discordapp.com/icons/${transcript.server.id}/${transcript.server.icon}.png`) ?? "./img/empty.png"} width={128} height={128} className="w-24 h-24" alt="Server Icon" />
        <div className="text-xl font-semibold">
          <div>{transcript.server.name}</div>
          <div>{transcript.channelName}</div>
          <div>{Math.max(transcript.messageCount, messages.length)} messages {transcript.queuedBy ? "fetched so far" : ""}</div>
        </div>
      </div>
      <InfiniteScroll
        dataLength={messages.length}
        next={() => fetchData(transcript.slug, messages[messages.length-1].id, setHasMore, messages, setMessages)}
        hasMore={hasMore}
        loader={<h4>Loading...</h4>}
      >
        {messageGroups.map((group, i) => <MessageGroupElement key={i} group={group} transcript={transcript} />)}
      </InfiniteScroll>

    </Main>
  )
}

async function fetchData(slug: string, offset: number, setHasMore: Dispatch<SetStateAction<boolean>>, messages: Message[], setMessages: Dispatch<SetStateAction<Message[]>>) {
  const msg = await fetch(`/api/transcripts/fetchMore?slug=${slug}&offset=${offset}`)
  if (msg.status == 404) {
    setHasMore(false)
    return
  }

  setMessages(messages.concat(await msg.json() as Message[]))
}

function Evidence({ transcript, host }: { transcript: Transcript, host: string }) {
  const [expanded, setExpanded] = useState(false)
  const [all, setAllFindings] = useState(true)

  const md = parseTranscript(transcript, all, host)
  return expanded ?
    <div className="dark:bg-slate-600 bg-slate-200 rounded-xl my-2 p-2">
      <button onClick={() => {
        copy(md, {
          format: "text/plain"
        })
      }} className="bg-blue-600 disabled:bg-gray-900 text-slate-50 disabled:text-slate-400 w-fit px-3 py-1 text-center rounded-lg mr-2 cursor-pointer float-right">Copy evidence markdown template to clipboard</button>
      <button onClick={() => {
        setExpanded(false)
      }} className="bg-red-600 disabled:bg-gray-900 text-slate-50 disabled:text-slate-400 w-fit px-3 py-1 text-center rounded-lg mr-2 cursor-pointer float-right">Close evidence markdown</button>


      <ReactMarkdown>{md}</ReactMarkdown>
      <hr className="opacity-80" />
      <textarea value={md} className="dark:bg-slate-500 bg-slate-300 w-full my-2 h-72" />
      <button onClick={() => {
        setAllFindings(!all)
      }} className={`${all ? "bg-red-600" : "bg-green-600"} disabled:bg-gray-900 text-slate-50 disabled:text-slate-400 w-fit px-3 py-1 text-center rounded-lg mr-2 cursor-pointer float-right`}>{all ? "Show latest finding" : "Show all findings"}</button>
      <div className="clear-both"></div>
    </div>
    :
    <button onClick={() => {
      setExpanded(true)
    }} className="bg-green-600 disabled:bg-gray-900 text-slate-50 disabled:text-slate-400 w-fit px-3 py-1 text-center rounded-lg mt-3 cursor-pointer float-right">Show evidence markdown</button>
}

function MessageGroupElement({ group, transcript }: { group: MessageGroup, transcript: Transcript }) {
  return <div className={`grid ${styles.gridAuto1} mt-2`} id={group.msg[0]?.discordId}>
    <div>
      {group.msg[0]?.reply && <div className="h-4" />}
      <div className="w-11 h-11 mt-2">
        <Avatar user={group.user} size="11" />
      </div>
    </div>
    <div className="ml-5 w-max-full pr-4">
      {group.msg[0]?.reply && <Reply replyId={group.msg[0].reply} transcript={transcript} />}
      <Username user={group.user} />
      <span className="text-sm text-slate-700 dark:text-slate-400 ml-2">{dateFormatter.format(group.msg[0].createdAt)}</span>
      <div>
        {group.msg.map((msg, j) => <MessageElement key={j} msg={msg} transcript={transcript} />)}
      </div>
    </div>
  </div>
}

function MessageElement({ msg, transcript, }: { msg: Message, transcript: Transcript }) {
  return <div className="mb-1 w-full rounded-lg" id={msg.discordId}>
    <Formatter content={msg.content} transcript={transcript} />
    {msg.embeds?.length > 0 && <div>{msg.embeds.map((e, i) => <Embed key={i} e={e as EmbedData} transcript={transcript} />)}</div>}
    {msg.attachments?.length > 0 && <div>{msg.attachments.map((a, i) => <Attachment key={i} a={a as unknown as AttachmentData} />)}</div>}
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

function Attachment({ a }: { a: AttachmentData }) {
  const url = new URL(a.url)
  let width, height
  if (a.width && a.height) {
    const w = +a.width, h = +a.height
    const MAX = 576
    if (w >= h && w > MAX) {
      width = 576
      height = h / w * 576
    }

    if (h >= w && h > MAX) {
      height = 576
      width = w / h * 576
    }
  }

  if ([".png", ".jpg", ".jpeg", ".gif", ".webp"].some(x => url.pathname.toLowerCase().endsWith(x)))
    return <div
      className={`flex max-w-xl ${a.spoiler ? "blur-xl hover:blur-0" : ""} my-1`}
      style={({ width, height })}
    >
      <FormattedLink href={a.url} target="_blank">
        <img src={a.url} width={a.width} height={a.height} alt={a.name} loading="lazy" style={({ width, height })} />
      </FormattedLink>
    </div>

  if ([".mp4", ".mov", ".webm", ".avi", ".flv"].some(x => url.pathname.toLowerCase().endsWith(x)))
    return <div
      className={`flex max-w-xl ${a.spoiler ? "blur-xl hover:blur-0" : ""} my-1`}
      style={({ width, height })}
    >
      <video src={a.url} width={a.width} height={a.height} title={a.name} controls style={({ width, height })} />
    </div>

  return <div className={`flex items-center max-w-xl ${a.spoiler ? "blur-xl hover:blur-0" : ""} my-1 bg-slate-200 dark:bg-slate-800 border border-slate-400 dark:border-slate-900 rounded-lg`}>
    <img src="/img/attachment.png" alt="Attachment" width={72} height={96} className="h-10 m-2 ml-3 w-auto" />
    <div className="m-1">
      <FormattedLink href={a.url} target="_blank">Attachment: {a.name}</FormattedLink>
      <div className="opacity-80">({a.size ? size(a.size) : "?"})</div>
    </div>
  </div>
}

function size(a: number) {
  if (a < 1024) return `${a}B`
  if (a < 100 * 1024) return `${(a / 1024).toFixed(2)}KB`
  if (a < 1024 * 1024) return `${(a / 1024).toFixed(1)}KB`
  if (a < 100 * 1024 * 1024) return `${(a / 1024 / 1024).toFixed(2)}MB`
  return `${(a / 1024 / 1024).toFixed(1)}MB`
}

function Embed({ e, transcript }: { e: EmbedData, transcript: Transcript }) {
  if (!e.title && !e.description && e.thumbnail)
    return <Attachment a={e.thumbnail} />

  return <div className={`grid ${styles.gridAuto1} max-w-xl`}>
    <div className="w-1 rounded-l" style={({ backgroundColor: (e.color ?? "#2F3136") })} />
    <div className="flex flex-col p-2 rounded-r bg-slate-200 dark:bg-slate-800 dark:bg-opacity-75 bg-opacity-75">
      {e.title && e.url ?
        <FormattedLink className="font-bold" target="_blank" href={e.url}>{e.title}</FormattedLink>
        :
        <div className="font-bold">{e.title}</div>
      }
      {e.description &&
        <div className="text-sm">
          <Formatter content={e.description} transcript={transcript} />
        </div>}
      {e.image && <div className="mt-2"><Attachment a={e.image} /></div>}
      {e.video && (e.video.url.endsWith(".mp4") ? <Attachment a={e.video} /> : <div className="mt-2"><div className="flex max-w-xl my-1">
        <iframe
          src={e.video.url.replace("https://www.youtube.com/embed/", "https://www.youtube-nocookie.com/embed/")}
          width="560"
          height="315"
          title="Video player"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div></div>)}
    </div>
  </div>
}


function Reply({ replyId, transcript }: { replyId: string, transcript: Transcript }) {
  const msg = transcript.messages.find(u => u.discordId == replyId)
  if (!msg)
    return <div>
      <a className="text-xs" href={`#${replyId}`}>Reply to an unknown message</a>
    </div>

  const user = getUser(msg.userId, transcript)
  return <div className="overflow-hidden h-4 text-xs">
    <a href={`#${replyId}`} >
      Reply to{" "}
      <Avatar user={user} size="4" />{" "}
      <Username user={user} />{": "}
      <Formatter transcript={transcript} content={msg.content.split(/\n/)[0]} />
    </a>
  </div>
}

function Formatter({ content, transcript }: { transcript: Transcript, content: string }) {
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
    const param = context.params?.slug
    if (!param) return { notFound: true }
    if (typeof param === "string") return { notFound: true }
    const [slug, offset] = param

    const transcript = await fetchTranscript(slug, offset)
    if (!transcript)
      return {
        notFound: true,
        revalidate: 300
      }

    return {
      props: {
        transcript,
        host: process.env["HOST"] ?? "https://localhost:3000"
      },
      revalidate: transcript.queuedBy ? 60 : 3600
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
      params: { slug: [s.slug] }
    })) ?? [],
    fallback: "blocking"
  }
}
