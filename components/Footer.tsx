import FormattedLink from "./FormattedLink"

export default function Footer({ location, marginBottom }: { location: string, marginBottom?: number }) {
    return <footer className="flex flex-col items-center justify-center w-full border-t text-center" style={({ marginBottom: marginBottom && `${marginBottom}px` })}>
        <div className="flex items-center justify-center gap-4">
            <FormattedLink href="https://keqingmains.com/" location={location} target="kqm"> KQM</FormattedLink>
            <FormattedLink href="https://discord.gg/keqing" location={location} target="discord-invite"> KQM Discord</FormattedLink>
        </div>
    </footer>
}
