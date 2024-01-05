import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Form } from "@/components/ui/form"
import { useToast } from "@/components/ui/use-toast"
import { UserProvider } from "@/context/UserContext"
import useUser from "@/hooks/useUser"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Navigate, useNavigate } from "react-router-dom"
import { z } from 'zod'
import { CredentialsSchema } from "@/lib/api/user"
import { CustomizedFormField } from "@/components/customized-form"
import { queryClient } from "@/lib/api"

export function Login() {
    const navigate = useNavigate()
    const { user, login } = useUser()
    const { toast } = useToast()

    const form = useForm<z.infer<typeof CredentialsSchema>>({
        resolver: zodResolver(CredentialsSchema),
        defaultValues: {
            username: "",
            password: ""
        },
    })

    const onSubmit = async (values: z.infer<typeof CredentialsSchema>) => {
        const res = await login(values)
        if (res.status < 400) {
            await queryClient.invalidateQueries({ queryKey: ['user', 'self'] })
            toast({
                title: "Successfully logged in!",
                description: "You will be redirected in a second."
            })
            return navigate('/dashboard')
        } else {
            toast({
                title: "Failed to login",
                description: (res.status === 404) ? "Invalid credentials" : `Something went wrong. HTTP ${res.status}`,
                variant: "destructive"
            })
        }
    }

    if (user.authenticated) return <Navigate to={'/dashboard'} />

    return (
        <UserProvider>
            <div className="h-full w-full items-center bg-cover bg-center min-h-screen">
                <div className="flex items-center justify-center z-0 align-middle w-full h-full">
                    <Card className="w-[350px] m-4">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="">
                                <CardHeader>
                                    <CardTitle>Login</CardTitle>
                                    <CardDescription>Enter your credentials below.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <CustomizedFormField
                                        control={form.control}
                                        name="username"
                                        label="Username"
                                        inputProps={{ placeholder: "John Doe", autoComplete: "username" }}
                                        description="Username is case-sensitive."
                                    />
                                    <CustomizedFormField
                                        control={form.control}
                                        name="password"
                                        label="Password"
                                        inputProps={{ placeholder: "S0m3_R3ally_$ecur3_P4s$$0rd", type: "password", autoComplete: "current-password" }}
                                        description="Password is case-sensitive."
                                    />
                                </CardContent>
                                <CardFooter className="flex justify-end">
                                    <Button type="submit">Login</Button>
                                </CardFooter>
                            </form>
                        </Form>
                    </Card>
                </div>
            </div>
        </UserProvider>
    )
}

