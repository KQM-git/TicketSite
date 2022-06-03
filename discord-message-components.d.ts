declare module "@discord-message-components/react" {
    export function DiscordButton(): any
    export function DiscordButtons(): any
    export function DiscordDefaultOptions(): any
    export function DiscordEmbed(): any
    export function DiscordEmbedField(): any
    export function DiscordEmbedFields(): any
    export function DiscordInteraction(): any
    export function DiscordMarkdown(props: {
        children: any
    }): import("react").ReactElement
    export function DiscordMention(props: {
        children: any,
        roleColor?: any,
        profile?: any,
        type: TypeName
    }): import("react").ReactElement

    export type TypeName = "user" | "channel" | "role"
    export function DiscordMessage(): any
    export function DiscordMessages(): any
    export var DiscordOptionsContext: import("react").Context<any>
    export function DiscordReaction(props: {
        image: string,
        name: string,
        active?: boolean,
        count?: number
    }): import("react").ReactElement
    export function DiscordReactions(props: { children: any }): import("react").ReactElement
}

declare module "react-twemoji" {
    export default function Twemoji(props: {
        children: any,
        noWrapper?: boolean,
        options: {
            callback?: Function,    // default the common replacer
            attributes?: Function,  // default returns {}
            base?: string,          // default MaxCDN
            ext?: string,           // default ".png"
            className?: string,     // default "emoji"
            size?: string | number, // default "72x72"
            folder?: string         // in case it's specified it replaces .size info, if any
        }
    }): import("react").ReactElement
}
