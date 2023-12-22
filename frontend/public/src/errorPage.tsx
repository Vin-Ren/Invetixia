import { useNavigate, useRouteError } from "react-router-dom";


export default function ErrorPage() {
    const error = useRouteError()
    const navigate = useNavigate()
    console.log(error)

    return (
        <div className="hero min-h-screen">
            <div className="hero-overlay bg-opacity-60"></div>
            <div className="hero-content text-center text-neutral-content">
                <div className="max-w-md">
                    <h1 className="mb-5 text-5xl font-bold">Hello there, you seem kind of... lost</h1>
                    <p className="mb-5">There's nothing of interest for you here. You should go back.</p>
                    <button className="btn btn-accent glass" onClick={() => { navigate('/') }}>Click here to go back</button>
                </div>
            </div>
        </div>
    )
}