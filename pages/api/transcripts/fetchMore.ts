import { NextApiRequest, NextApiResponse } from "next"
import { fetchMore } from "../../../utils/db"

export default async function api(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "GET") return res.redirect("/")

    const { slug = null, offset = null } = req.query
    if (slug == null || offset == null || typeof slug !== "string" || typeof offset !== "string") return res.redirect("/")

    const fetched = await fetchMore(slug, +offset)
    if (!fetched)
        return res.status(404).json({ error: "Not found" })

    const { messages, isDone } = fetched
    if (isDone)
        return res.setHeader("name", "public, max-age=2592000").json(messages)
    return res.json(messages)
}
