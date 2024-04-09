import { Button } from "@/components/ui/button";
import { isRouteErrorResponse, useNavigate, useRouteError } from "react-router-dom"


export default function Error() {
    const navigate = useNavigate();
    const error = useRouteError()
    if (isRouteErrorResponse(error)) {
        return (<div>Error {error?.status} {error?.statusText}</div>)
    }
    return (
        <div className="flex self-center items-center gap-4 align-middle flex-1 flex-row">
            Unknown Error
            <Button onClick={() => navigate('../')}>Go back</Button>
        </div>
    )
}
