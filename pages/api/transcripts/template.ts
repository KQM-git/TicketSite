import { NextApiRequest, NextApiResponse } from "next"
import { fetchTranscript } from "../../../utils/db"
import { parseTranscript } from "../../../utils/utils"

export default async function api(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "GET") return res.redirect("/")

    const { slug = null } = req.query

    const transcript = await fetchTranscript(slug)
    if (!transcript)
        return res.status(404).json({ error: "Not found" })

    const md = parseTranscript(transcript)

    return res.json({
        md,
        transcript
    })
}
