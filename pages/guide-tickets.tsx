/* eslint-disable @next/next/no-img-element */

import { User } from "@prisma/client"
import { GetServerSideProps } from "next"
import Head from "next/head"
import Main from "../components/Main"
import { Avatar, Username } from "../components/User"
import { fetchGuideTickets } from "../utils/db"
import styles from "./style.module.css"

interface GuideTicket {
  id: number
  status: string
  name: string
  createdAt: number
  deleted: boolean
  creator: User
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
            <th>Creator</th>
            <th>Ticket</th>
            <th>Type</th>
            <th>Deleted</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-500">
          {tickets.map(dn => <tr className={`pr-1 divide-x divide-gray-200 dark:divide-gray-500 ${dn.deleted ? "opacity-25" : ""}` } key={dn.id}>
            <td>{dn.id}</td>
            <td>{new Date(dn.createdAt).toLocaleString()}</td>
            <td>
              <Avatar user={dn.creator} size="4" />{" "}
              <Username user={dn.creator} />
            </td>
            <td>
              {dn.name}
            </td>
            <td>{dn.status}</td>
            <td>{dn.deleted ? "Yes" : "No"}</td>
          </tr>)}

        </tbody>
      </table>
    </Main>
  )
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
