import { queryClient } from "@/lib/api"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { z } from "zod"
import { Form } from "@/components/ui/form"
import { CustomizedFormField } from "@/components/customized-form"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "@/components/ui/use-toast"
import { getEventDetails } from "@/lib/queries/config"
import { authEmailClient } from "@/lib/api/email"

export const ResendAPIConfigSchema = z.object({
    apiKey: z.string(),
    domain: z.string().optional()
})

export const ResendAPIConfigCard = () => {
    const form = useForm<z.infer<typeof ResendAPIConfigSchema>>({
        resolver: zodResolver(ResendAPIConfigSchema),
    })

    const onSubmit = async (values: z.infer<typeof ResendAPIConfigSchema>) => {
        const res = await authEmailClient(values)

        if (res) {
            toast({
                title: "Successfully Authenticated remote email client!"
            })
            queryClient.invalidateQueries(getEventDetails)
        } else {
            toast({
                title: "Failed to authenticate remote email client!",
                description: "Something went wrong.",
                variant: "destructive"
            })
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Resend Email Client API Key</CardTitle>
                <CardDescription>API Keys are only used to authenticate once and are not stored on the database.</CardDescription>
            </CardHeader>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="">
                    <CardContent className="space-y-2">
                        <CustomizedFormField
                            control={form.control}
                            name="apiKey"
                            label="API Key"
                            inputProps={{ placeholder: "re_123456789", autoComplete: "false" }}
                            description="Your Resend API Key"
                        />
                        <CustomizedFormField
                            control={form.control}
                            name="domain"
                            label="Domain"
                            description="Leave empty to automatically choose"
                            inputProps={{ placeholder: "example.com" }}
                        />
                    </CardContent>
                    <CardFooter>
                        <Button type="submit">Authenticate</Button>
                    </CardFooter>
                </form>
            </Form>
        </Card>
    )
}
