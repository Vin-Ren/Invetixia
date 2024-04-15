
import { useQuery } from "@tanstack/react-query"

import { queryClient } from "@/lib/api"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { z } from "zod"
import { Form } from "@/components/ui/form"
import { CustomizedFormField, CustomizedFormTextAreaField } from "@/components/customized-form"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "@/components/ui/use-toast"
import { getEventInfo } from "@/lib/queries/config"
import { updateEventInfo } from "@/lib/api/config"
import { useEffect } from "react"

export const EventInfoSchema = z.object({
    name: z.string(),
    description: z.string()
})

export const EventInfoCard = () => {
    const { data: event_info } = useQuery(getEventInfo, queryClient)
    const form = useForm<z.infer<typeof EventInfoSchema>>({
        resolver: zodResolver(EventInfoSchema),
        defaultValues: { name: event_info?.name || "", description: event_info?.description || "" },
    })

    const onSubmit = async (values: z.infer<typeof EventInfoSchema>) => {
        const res = await updateEventInfo(values)
        if (res) {
            toast({
                title: "Successfully updated event!",
                description: "Updated general event information."
            })
            queryClient.invalidateQueries(getEventInfo)
        } else {
            toast({
                title: "Failed to update event!",
                description: "Something went wrong.",
                variant: "destructive"
            })
        }
    }

    useEffect(() => {
        form.setValue('name', event_info?.name || '')
        form.setValue('description', event_info?.description || '')
    }, [event_info])

    if (!(event_info)) return <></>

    return (
        <Card>
            <CardHeader>
                <CardTitle>Event Information</CardTitle>
                <CardDescription>General information about the event</CardDescription>
            </CardHeader>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="">
                    <CardContent className="space-y-2">
                        <CustomizedFormField
                            control={form.control}
                            name="name"
                            label="Name"
                            inputProps={{ placeholder: "Event's name" }}
                        />
                        <CustomizedFormTextAreaField
                            control={form.control}
                            name="description"
                            label="Description"
                            textAreaProps={{ placeholder: "A Description of the event" }}
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
