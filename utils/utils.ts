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

export function parseTranscript(transcript: Transcript, all: boolean) {
    const { messages, users, slug, contributors } = transcript

    const contributorList = contributors ?? []
    let finding = "Finding: *Unknown*", evidence = "Evidence: *Unknown*", significance = "Significance: *Unknown*"
    let nick = "Unknown", tag = "????"

    for (const message of messages) {
        const content = message.content
        if (!content) continue

        if (all && content.match(/\S*(Finding|Theory|Bug|Theory\/Finding\/Bug|Evidence|Significance)\S*:\S*/i)) {
            if (evidence != "") finding = ""

            finding = finding + "\n\n" + content
            evidence = ""
            significance = ""
        } else if (content.match(/\S*(Finding|Theory|Bug|Theory\/Finding\/Bug)\S*:\S*/i)) {
            finding = content
            evidence = ""
            significance = ""
        } else if (content.match(/\S*Evidence\S*:\S*/i)) {
            evidence = content
            significance = ""
        } else if (content.match(/\S*Significance\S*:\S*/i)) {
            significance = content
        } else
            continue

        const user = users.find(u => u.discordId == message.userId)
        nick = user?.username ?? "Unknown"
        tag = user?.tag ?? "????"
    }

    if (!contributorList.includes(`${nick}\\#${tag}`))
        contributorList.unshift(`${nick}\\#${tag}`)

    const date = new Date(transcript.createdAt).toISOString().split("T")[0]

    const findings = `${finding}

${evidence}

${significance}`
    .replace(/ *\n/g, "  \n")
    .replace(/\S*(Finding|Theory|Bug|Theory\/Finding\/Bug|Evidence|Significance)\S*:\S*\s*/gi, (_, a) => `**${a}:**  \n`)
    .replace(/<?(https?:\/\/\S*?)>?(\s)/g, (_, url, w) => `[${getDomain(url)}](${url})${w}`)
    .trim()

    const beautifiedChannel = transcript.channelName
        .replace(/-/g, " ")
        .replace(/^./, (a) => a.toUpperCase())
        .replace(/(^|\s)./g, (a) => ["a", "to", "the"].includes(a) ? a : a.toUpperCase())

    return `### ${beautifiedChannel}

**By:** ${contributorList.join(", ")}  
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


export function getUser(id: string, transcript: Transcript) {
    return transcript.users.find(x => id == x.discordId) ?? {
        discordId: id,
        avatar: null,
        bot: null,
        nickname: null,
        roleColor: null,
        tag: null,
        username: null,
        verified: null
    }
}
