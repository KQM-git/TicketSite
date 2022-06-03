export interface Transcript {
    discordData: { [key: string]: DiscordDatum };
    attachments: Attachment[];
    reactions:   any[];
    embeds?:     Embed[];
    content?:    string;
    components:  Welcome1Component[];
    user_id:     string;
    bot:         boolean;
    verified?:   boolean;
    username:    string;
    nick:        string;
    tag:         string;
    avatar:      string;
    id:          string;
    created:     number;
    edited:      number | null;
    reference?:  Reference;
}

export interface Attachment {
    base64: string;
    url:    string;
    name:   string;
    size:   number;
    height: number;
    width:  number;
}

export interface Welcome1Component {
    components: ComponentComponent[];
    type:       number;
}

export interface ComponentComponent {
    custom_id: string;
    disabled:  boolean;
    emoji:     Emoji;
    label:     string;
    style:     number;
    type:      number;
    url:       null;
}

export interface Emoji {
    name:     string;
    animated: boolean;
}

export interface DiscordDatum {
    name:    string;
    tag?:    string;
    nick?:   string;
    avatar?: string;
}

export interface Embed {
    title?:      string;
    description: string;
    color:       string;
    fields:      any[];
}

export interface Reference {
    channel: string;
    server?: string;
    message: string;
}
