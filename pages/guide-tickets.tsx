import { GetServerSideProps } from "next"
import Head from "next/head"
import { GuideTable, GuideTicket } from "../components/GuideTickets"
import Main from "../components/Main"
import { fetchTickets } from "../utils/db"

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

      <GuideTable tickets={tickets} />
    </Main>
  )
}


export const getServerSideProps: GetServerSideProps<Props> = async function (ctx) {
  try {
    const tickets = await fetchTickets("guide")
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
    }
  }
}
