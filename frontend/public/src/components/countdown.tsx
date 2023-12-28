import { useEffect } from "react"
import useTimer from "../hooks/useTimer"


export const CountdownEntry = ({ label, value, ...props }: { label: string, value: number, props?: any }) => {
    return (
        <div className="flex flex-col p-2 bg-neutral rounded-box text-neutral-content bg-opacity-80 shadow-lg" {...props} >
            <span className="countdown font-mono text-4xl md:text-5xl">
                <span style={{ "--value": value } as React.CSSProperties}></span>
            </span>
            {label}
        </div>
    )
}


export const Countdown = ({ targetDate }: { targetDate: Date }) => {
    const timer = useTimer(targetDate)

    useEffect(() => {
        timer.setDate(targetDate)
    }, [targetDate])

    return (
        <div className="grid grid-flow-col gap-4 text-center auto-cols-max">
            <CountdownEntry label="days" value={timer.day} />
            <CountdownEntry label="hours" value={timer.hour} />
            <CountdownEntry label="min" value={timer.minute} />
            <CountdownEntry label="sec" value={timer.second} />
        </div>
    )
}
