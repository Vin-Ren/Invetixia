import { ReactNode } from "react"


export const OptionalSocialLink = ({icon, url, tooltip = "", ...props} : {icon: ReactNode, url: string|null, tooltip?: string}) => {
    if (url) {
        return (
            <div className="tooltip tooltip-accent" data-tip={tooltip}>
                <a href={url} target="_blank" {...props}>{icon}</a>
            </div>
        )
    } else {
        return null
    }
}
