/* eslint-disable @next/next/no-img-element */

import { User } from "@prisma/client"
import { GetServerSideProps } from "next"
import Head from "next/head"
import Main from "../components/Main"
import { Avatar, Username } from "../components/User"
import { fetchGuideTickets } from "../utils/db"
import styles from "./style.module.css"
import { useState } from "react"

interface GuideTicket {
  id: number
  status: string
  name: string
  createdAt: number
  deleted: boolean
  creator: User
  verifications: {
    verifier: User
    type: string
  }[]
}

interface Props {
  tickets: GuideTicket[]
}

export default function GuideTickets({ tickets, location }: Props & { location: string }) {
  const desc = "List of guide tickets."

  return (
    <Main>
      <Head>
        <title>Guide Tickets | KQM Transcripts</title>
        <meta name="twitter:card" content="summary" />
        <meta property="og:title" content={"Guide Tickets | KQM Transcripts"} />
        <meta property="og:description" content={desc} />
        <meta name="description" content={desc} />
      </Head>

      <h1 className="text-5xl font-bold pb-2">
        Guide Tickets
      </h1>

      <div className="clear-both"/>

      <table className={`table-auto w-full ${styles.table} my-2 sm:text-base text-sm`}>
        <thead>
          <tr className="divide-x divide-gray-200 dark:divide-gray-500">
            <th>ID</th>
            <th>Open Time</th>
            <th>Owner</th>
            <th>Ticket</th>
            <th>Verifies</th>
            <th>Type</th>
            <th>Deleted</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-500">
          {tickets.map(dn => <GuideTicketLayout key={dn.id} dn={dn} />)}
        </tbody>
      </table>
    </Main>
  )
}

function GuideTicketLayout({ dn } : { dn : GuideTicket }) {
  const [expanded, setExpanded] = useState(false)
  const collapsed = dn.verifications.reduce((p, c) => {p[c.type] = (p[c.type] ?? 0) + 1; return p}, {} as Record<string, number>)
 return <tr className={`pr-1 divide-x divide-gray-200 dark:divide-gray-500 ${dn.deleted ? "opacity-25" : ""}` }>
    <td>{dn.id}</td>
    <td>{new Date(dn.createdAt).toLocaleString()}</td>
    <td>
      <Avatar user={dn.creator} size="4" />{" "}
      <Username user={dn.creator} />
    </td>
    <td>
      {dn.name}
    </td>
    <td onClick={() => setExpanded(!expanded)}>{expanded ?
      dn.verifications.map((x, i) => <div key={i}>{x.type}: <Avatar user={x.verifier} size="4" />{" "}<Username user={x.verifier} /></div>) :
      Object.entries(collapsed).sort(([a], [b]) => a.localeCompare(b)).map(([x, count], i) => <div key={i}>{x}: {count}</div>)
    }</td>
    <td>{dn.status}</td>
    <td>{dn.deleted ? "Yes" : "No"}</td>
  </tr>
}

export const getServerSideProps: GetServerSideProps<Props> = async function (ctx) {
  try {
    const tickets = await fetchGuideTickets()
    if (!tickets)
      return {
        notFound: true,
      }

    return {
      props: {
        tickets
      }
    }
  } catch (error) {
    console.log(error)
    return {
      notFound: true,
      revalidate: 60
    }
  }
}
