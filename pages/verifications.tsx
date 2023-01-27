/* eslint-disable @next/next/no-img-element */

import { GetStaticPropsContext, GetStaticPropsResult } from "next"
import Head from "next/head"
import FormattedLink from "../components/FormattedLink"
import Main from "../components/Main"
import { Avatar, Username } from "../components/User"
import { fetchVerifications } from "../utils/db"
import { User } from "../utils/types"
import { dateFormatter } from "../utils/utils"
import styles from "./style.module.css"

type Verification = {
  id: number
  createdAt: number
  channelId: string
  channelName: string
  type: string
  userId: string
  serverId: string
  ticketsId: number
  verifier: User
  ticket: {
    name: string
  }
}

interface Props {
  verifications: Verification[]
}

export default function Verifications({ verifications, location }: Props & { location: string }) {
  const desc = "List of verifications."

  return (
    <Main>
      <Head>
        <title>Verifications | KQM Transcripts</title>
        <meta name="twitter:card" content="summary" />
        <meta property="og:title" content={"Verifications | KQM Transcripts"} />
        <meta property="og:description" content={desc} />
        <meta name="description" content={desc} />
      </Head>

      <button className="bg-blue-600 disabled:bg-gray-900 text-slate-50 disabled:text-slate-400 w-fit px-3 py-1 text-center rounded-lg mt-2 cursor-pointer float-right" onClick={() => exportCSV(verifications)}>Export to .csv</button>

      <h1 className="text-5xl font-bold pb-2">
        Verifications
      </h1>

      <div className="clear-both"/>

      <table className={`table-auto w-full ${styles.table} my-2 sm:text-base text-sm`}>
        <thead>
          <tr className="divide-x divide-gray-200 dark:divide-gray-500">
            <th>ID</th>
            <th>Time</th>
            <th>User</th>
            <th>Ticket</th>
            <th>Type</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-500">
          {verifications.map(dn => <tr className={"pr-1 divide-x divide-gray-200 dark:divide-gray-500"} key={dn.id}>
            <td>{dn.id}</td>
            <td>{new Date(dn.createdAt).toLocaleString()}</td>
            <td>
              <Avatar user={dn.verifier} size="4" />{" "}
              <Username user={dn.verifier} />
            </td>
            <td>
              <FormattedLink href={`https://discord.com/channels/${dn.serverId}/${dn.channelId}`} target="_blank">
                {dn.ticket.name}
              </FormattedLink>
            </td>
            <td>{dn.type}</td>
          </tr>)}

        </tbody>
      </table>
    </Main>
  )
}

function exportCSV(data: Verification[]) {
  const file = {
    mime: "text/plain",
    filename: `verifications-${new Date().toISOString().split("T")[0]}.csv`,
    contents: "id,time,user,channel,type\n" +
      data.flatMap(d => `${d.id},${d.verifier.username?.replace(/,/g, "")}#${d.verifier.tag},${new Date(d.createdAt).toISOString()},${d.ticket.name},${d.type}`).join("\n"),
  }
  const blob = new Blob([file.contents], { type: file.mime }), url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  document.body.appendChild(link) // Firefox requires the link to be in the body
  link.download = file.filename
  link.href = url
  link.click()
  document.body.removeChild(link) // remove the link when done
}


export async function getStaticProps(): Promise<GetStaticPropsResult<Props>> {
  try {
    const verifications = await fetchVerifications()
    if (!verifications)
      return {
        notFound: true
      }

    return {
      props: {
        verifications
      },
    }
  } catch (error) {
    return {
      notFound: true,
      revalidate: 60
    }
  }
}
