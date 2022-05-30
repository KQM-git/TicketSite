import Head from "next/head"
import Main from "../components/Main"


export default function MainPage({ location }: { location: string }) {
  const desc = "Transcripts for KQM Theorycrafting Library."
  return (
    <Main>
      <Head>
        <title>KQM Transcripts</title>
        <meta name="twitter:card" content="summary" />
        <meta property="og:title" content="KQM Transcripts" />
        <meta property="og:description" content={desc} />
        <meta name="description" content={desc} />
      </Head>

      <h1 className="text-5xl font-bold pb-2">
        KQM Transcripts
      </h1>

      <h3 className="text-2xl font-bold pt-1" id="about">About</h3>
      <p>
        This site hosts transcripts for the KQM Theorycrafting Library.
      </p>
    </Main>
  )
}
