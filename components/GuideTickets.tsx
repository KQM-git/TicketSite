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
        {tickets.map((dn) => (
          <GuideTicketLayout key={dn.id} dn={dn} />
        ))}
      </tbody>
    </table>
  )
}

function GuideTicketLayout({ dn }: { dn: GuideTicket }) {
  const [expanded, setExpanded] = useState(false)
  const collapsed = dn.verifications.reduce((p, c) => {
    p[c.type] = (p[c.type] ?? 0) + 1
    return p
  }, {} as Record<string, number>)

  return (
    <tr
      className={`pr-1 divide-x divide-gray-200 dark:divide-gray-500 ${
        dn.deleted ? "opacity-25" : ""
      }`}
    >
      <td>{dn.id}</td>
      <td>{new Date(dn.createdAt).toLocaleString()}</td>
      <td>
        <Avatar user={dn.creator} size="4" /> <Username user={dn.creator} />
      </td>
      <td>{dn.name}</td>
      <td onClick={() => setExpanded(!expanded)}>
        {expanded
          ? dn.verifications.map((x, i) => (
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
      <td>{dn.status}</td>
      <td>{dn.deleted ? "Yes" : "No"}</td>
    </tr>
  )
}
