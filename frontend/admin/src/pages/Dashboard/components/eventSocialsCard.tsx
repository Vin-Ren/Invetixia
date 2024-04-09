
import { useQuery } from "@tanstack/react-query"

import { queryClient } from "@/lib/api"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { z } from "zod"
import { Form } from "@/components/ui/form"
import { CustomizedFormField } from "@/components/customized-form"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "@/components/ui/use-toast"
import { getEventSocials } from "@/lib/queries/config"
import { updateEventSocials } from "@/lib/api/config"

export const EventSocialsSchema = z.object({
    mainWebsite: z.string(),
    instagram: z.string(),
    youtube: z.string(),
    x_twitter: z.string(),
    email: z.string()
})

export const EventSocialsCard = () => {
    const { data: event_details } = useQuery(getEventSocials, queryClient)
    const form = useForm<z.infer<typeof EventSocialsSchema>>({
        resolver: zodResolver(EventSocialsSchema),
        defaultValues: { mainWebsite: "", instagram: "", youtube: "", x_twitter: "", email: "", ...event_details},
    })

    const onSubmit = async (values: z.infer<typeof EventSocialsSchema>) => {
        const res = await updateEventSocials(values)
        if (res) {
            toast({
                title: "Successfully updated event!",
                description: "Updated event socials."
            })
            queryClient.invalidateQueries(getEventSocials)
        } else {
            toast({
                title: "Failed to update event!",
                description: "Something went wrong.",
                variant: "destructive"
            })
        }
    }

    if (event_details===undefined) return <></>

    return (
        <Card>
            <CardHeader>
                <CardTitle>Event Socials</CardTitle>
                <CardDescription>Social links for the event. All of which are optional.</CardDescription>
            </CardHeader>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="">
                    <CardContent className="space-y-2">
                        <CustomizedFormField
                            control={form.control}
                            name="mainWebsite"
                            label="Website"
                            inputProps={{ placeholder: "https://example.com" }}
                        />
                        <CustomizedFormField
                            control={form.control}
                            name="instagram"
                            label="Instagram"
                            inputProps={{ placeholder: "https://instagram.com/instagram" }}
                        />
                        <CustomizedFormField
                            control={form.control}
                            name="youtube"
                            label="Youtube"
                            inputProps={{ placeholder: "https://youtube.com/youtube" }}
                        />
                        <CustomizedFormField
                            control={form.control}
                            name="x_twitter"
                            label="X (Formerly Twitter)"
                            inputProps={{ placeholder: "https://x.com" }}
                        />
                        <CustomizedFormField
                            control={form.control}
                            name="email"
                            label="Email"
                            inputProps={{ placeholder: "example@mail.com" }}
                        />
                    </CardContent>
                    <CardFooter>
                        <Button type="submit">Update</Button>
                    </CardFooter>
                </form>
            </Form>
        </Card>
    )
}
