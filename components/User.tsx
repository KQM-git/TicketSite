/* eslint-disable @next/next/no-img-element */
import { User } from "../utils/types"


export function Avatar({ user, size }: { user: User, size: string }) {
    return <img
        src={(user.avatar && `https://cdn.discordapp.com/avatars/${user.discordId}/${user.avatar}.png`) ?? "https://cdn.discordapp.com/attachments/247122362942619649/980958465566572604/unknown.png"}
        className={`w-${size} h-${size} inline-block rounded-full`}
        loading="lazy"
        alt="Avatar"
    />
}

export function Username({ user }: { user: User }) {
    return <span className="font-semibold" title={`${user.username ?? "???"}#${user.tag}`} style={({
        color: user.roleColor == "#000000" ? undefined : user.roleColor ?? undefined
    })}>{user.nickname ?? user.username}</span>
}
