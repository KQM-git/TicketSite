import { User } from "@prisma/client"
import { useState } from "react"
import { Avatar, Username } from "../components/User"
import styles from "../pages/style.module.css"

export interface GuideTicket {
  id: number;
  status: string;
  name: string;
  createdAt: number;
  deleted: boolean;
  creator: User;
  verifications: {
    verifier: User;
    type: string;
  }[];
  transcript: {
    slug: string;
  }[];
}

export function GuideTable({ tickets }: { tickets: GuideTicket[] }) {
  return (
    <table
      className={`table-auto w-full ${styles.table} my-2 sm:text-base text-sm`}
    >
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
        {tickets.map(ticket => (
          <GuideTicketLayout key={ticket.id} ticket={ticket} />
        ))}
      </tbody>
    </table>
  )
}

function GuideTicketLayout({ ticket }: { ticket: GuideTicket }) {
  const [expandVerif, setExpandedVerif] = useState(false)
  const [expandTranscripts, setExpandedTranscripts] = useState(false)
  const collapsed = ticket.verifications.reduce((p, c) => {
    p[c.type] = (p[c.type] ?? 0) + 1
    return p
  }, {} as Record<string, number>)

  return (
    <tr
      className={`pr-1 divide-x divide-gray-200 dark:divide-gray-500 ${
        ticket.deleted ? "opacity-40" : ""
      }`}
    >
      <td>{ticket.id}</td>
      <td>{new Date(ticket.createdAt).toLocaleString()}</td>
      <td>
        <Avatar user={ticket.creator} size="4" /> <Username user={ticket.creator} />
      </td>
      <td>
        {expandTranscripts ? (
          <div>
            <u>
              <a
                className="cursor-pointer"
                onClick={() => setExpandedTranscripts(false)}
              >
                {ticket.name}
              </a>
            </u>

            <ul className="list-disc list-inside">
              {ticket.transcript.map((x) => (
                <li key={x.slug}>
                  <a
                    href={`/transcripts/${x.slug}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {x.slug}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ) : ticket.transcript.length == 0 ? (
          ticket.name
        ) : (
          <u>
            <a
              className="cursor-pointer"
              onClick={() =>
                setExpandedTranscripts(
                  !expandTranscripts && ticket.transcript.length > 0
                )
              }
            >
              {ticket.name}
            </a>
          </u>
        )}
      </td>
      <td
        onClick={() => setExpandedVerif(!expandVerif)}
        className="cursor-pointer"
      >
        {expandVerif
          ? ticket.verifications.map((x, i) => (
              <div key={i}>
                {x.type}: <Avatar user={x.verifier} size="4" />{" "}
                <Username user={x.verifier} />
              </div>
            ))
          : Object.entries(collapsed)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([x, count], i) => (
                <div key={i}>
                  {x}: {count}
                </div>
              ))}
      </td>
      <td>{ticket.status}</td>
      <td>{ticket.deleted ? "Yes" : "No"}</td>
    </tr>
  )
}
