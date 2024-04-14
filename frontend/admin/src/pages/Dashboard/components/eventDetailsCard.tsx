
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
import { getEventDetails } from "@/lib/queries/config"
import { updateEventDetails } from "@/lib/api/config"
import { useEffect } from "react"

export const EventDetailsSchema = z.object({
    locationName: z.string(),
    startTime: z.string(),
    note: z.string()
})

export const EventDetailsCard = () => {
    const { data: event_details } = useQuery(getEventDetails, queryClient)
    const form = useForm<z.infer<typeof EventDetailsSchema>>({
        resolver: zodResolver(EventDetailsSchema),
        defaultValues: { locationName: "", startTime: "", ...event_details},
    })

    const onSubmit = async (values: z.infer<typeof EventDetailsSchema>) => {
        let res = false
        if (!isNaN((new Date(values.startTime)).getDate())) {
            res = await updateEventDetails(values)
        }
        if (res) {
            toast({
                title: "Successfully updated event!",
                description: "Updated detailed event information."
            })
            queryClient.invalidateQueries(getEventDetails)
        } else {
            toast({
                title: "Failed to update event!",
                description: "Something went wrong.",
                variant: "destructive"
            })
        }
    }

    useEffect(()=> {
        form.setValue('locationName', event_details?.locationName || '')
        form.setValue('startTime', event_details?.startTime || '')
        form.setValue('note', event_details?.note || '')
    }, [event_details])

    if (!(event_details)) return <></>

    return (
        <Card>
            <CardHeader>
                <CardTitle>Event Details</CardTitle>
                <CardDescription>Detailed information about the event</CardDescription>
            </CardHeader>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="">
                    <CardContent className="space-y-2">
                        <CustomizedFormField
                            control={form.control}
                            name="locationName"
                            label="Location"
                            description="Location where the event would be held at"
                        />
                        <CustomizedFormField
                            control={form.control}
                            name="startTime"
                            label="Start Time"
                            description="In ISO format"
                            inputProps={{ placeholder: "YYYY-MM-DDT00:00:00.000Z" }}
                        />
                        <CustomizedFormField
                            control={form.control}
                            name="note"
                            label="Note"
                            description="An optional note to show on the participants tickets"
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
