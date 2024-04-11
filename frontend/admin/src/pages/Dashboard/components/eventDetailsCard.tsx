
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
import { getEventDetails } from "@/lib/queries/config"
import { updateEventDetails } from "@/lib/api/config"

export const EventDetailsSchema = z.object({
    locationName: z.string(),
    startTime: z.string()
})

export const EventDetailsCard = () => {
    const { data: event_details } = useQuery(getEventDetails, queryClient)
    const form = useForm<z.infer<typeof EventDetailsSchema>>({
        resolver: zodResolver(EventDetailsSchema),
        defaultValues: { locationName: "", startTime: "", ...event_details},
    })

    const onSubmit = async (values: z.infer<typeof EventDetailsSchema>) => {
        const res = await updateEventDetails(values)
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

    if (event_details===undefined) return <></>

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
                    </CardContent>
                    <CardFooter>
                        <Button type="submit">Update</Button>
                    </CardFooter>
                </form>
            </Form>
        </Card>
    )
}
