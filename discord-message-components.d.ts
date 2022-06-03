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
    }): any
    export function DiscordMention(props: {
        children: any,
        roleColor?: any,
        profile?: any,
        type: TypeName
    }): any

    export type TypeName = "user" | "channel" | "role"
    export function DiscordMessage(): any
    export function DiscordMessages(): any
    export var DiscordOptionsContext: import("react").Context<any>
    export function DiscordReaction(): any
    export function DiscordReactions(): any
}
