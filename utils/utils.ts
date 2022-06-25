import { Transcript } from "./types"

export function urlify(input: string, shouldRemoveBrackets: boolean): string {
    if (shouldRemoveBrackets)
        input = removeBrackets(input)
    return input.toLowerCase().replace(/[():"'-]/g, "").trim().replace(/ +/g, "-")
}

export function removeBrackets(input: string) {
    return input.replace(/\(.*\)/g, "").replace(/ +:/, ":")
}

export function clean(input: string) {
    return input.replace(/ ?\$\{.*?\}/g, "").replace(/ ?\(.*?\)/g, "").replace(/[*[\]]/g, "").split("\n")[0]
}

export function parseTranscript(transcript: Transcript) {
    const { messages, users, slug } = transcript

    let finding = "Finding: *Unknown*", evidence = "Evidence: *Unknown*", significance = "Significance: *Unknown*"
    let nick = "Unknown", tag = "????"

    for (const message of messages) {
        const content = message.content
        if (!content) continue

        if (content.match(/\**(Finding|Theory|Bug|Theory\/Finding\/Bug)\**:\**/i)) {
            finding = content
            evidence = ""
            significance = ""
        } else if (content.match(/\**Evidence\**:\**/i)) {
            evidence = content
            significance = ""
        } else if (content.match(/\**Significance\**:\**/i)) {
            significance = content
        } else
            continue

        const user = users.find(u => u.discordId == message.userId)
        nick = user?.username ?? "Unknown"
        tag = user?.tag ?? "????"
    }

    const date = new Date(transcript.createdAt).toISOString().split("T")[0]

    const findings = `${finding}
  
  ${evidence}
  
  ${significance}`
        .replace(/\**(Finding|Theory|Bug|Theory\/Finding\/Bug|Evidence|Significance)\**:\**\s*/gi, (_, a) => `**${a}:**  \n`)
        .replace(/(https?:\/\/.*)(\s)/g, (_, url, w) => `[${getDomain(url)}](${url})${w}`)
        .trim()

    const beautifiedChannel = transcript.channelName
        .replace(/-/g, " ")
        .replace(/^./, (a) => a.toUpperCase())
        .replace(/(^|\s)./g, (a) => ["a", "to", "the"].includes(a) ? a : a.toUpperCase())

    return `### ${beautifiedChannel}
  
**By:** ${nick}\\#${tag}${transcript.contributors ? ", " + transcript.contributors.join(", ") : ""}  
**Added:** ${date}  
[Discussion](https://tickets.deeznuts.moe/transcripts/${slug})

${findings}
`.trim()
}

function getDomain(str: string) {
    const url = new URL(str)
    if (["youtube.com", "youtu.be"].includes(url.hostname))
        return "YouTube"
    if (["i.imgur.com", "imgur.com"].includes(url.hostname))
        return "Imgur"
    return url.hostname
}
