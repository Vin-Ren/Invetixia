import { isRouteErrorResponse, useRouteError } from "react-router-dom"


export default function Error() {
    const error = useRouteError()
    if (isRouteErrorResponse(error)) {
        return (<div>Error {error?.status} {error?.statusText}</div>)
    }
    return (<div>Unknown Error</div>)
}
