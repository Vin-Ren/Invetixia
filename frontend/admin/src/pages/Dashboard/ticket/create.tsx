import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { z } from "zod";


import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { TabsTemplate } from "@/components/tabs-template";
import { Form } from "@/components/ui/form";
import { CustomizedFormField, CustomizedFormTextAreaField } from "@/components/customized-form";
import { createMany, createOne } from "@/lib/api/ticket";
import { useToast } from "@/components/ui/use-toast";
import { queryClient } from "@/lib/api";
import { getAll } from "@/lib/queries/ticket";



export const TicketCreateSchema = z.object({
    invitationId: z.string(),
    ownerName: z.string(),
    ownerEmail: z.string(),
    ownerPhoneNumber: z.string()
})


function TicketCreate() {
    const navigate = useNavigate()

    const { toast } = useToast()

    const form = useForm<z.infer<typeof TicketCreateSchema>>({
        resolver: zodResolver(TicketCreateSchema),
    })

    const onSubmit = async (values: z.infer<typeof TicketCreateSchema>) => {
        try {
            const ticket = await createOne({...values, ownerContacts: {email: values.ownerEmail, phone_number: values.ownerPhoneNumber} })
            toast({
                title: "Successfully created an ticket!",
                description: "Redirecting in a second."
            })
            queryClient.invalidateQueries(getAll)
            navigate(`../details/${ticket.UUID}`)
        } catch (e) {
            toast({
                title: "Failed to create an ticket!",
                description: "Something went wrong.",
                variant: "destructive"
            })
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Create Ticket</CardTitle>
                <CardDescription>
                    Enter ticket information
                </CardDescription>
            </CardHeader>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="">
                    <CardContent className="space-y-2">
                        <CustomizedFormField
                            control={form.control}
                            name="ownerName"
                            label="Owner Name"
                            inputProps={{ placeholder: "John Doe" }}
                        />
                        <CustomizedFormField
                            control={form.control}
                            name="invitationId"
                            label="Invitation ID"
                            inputProps={{ placeholder: "xxxx-xxxx-xxxx-xxxx" }}
                        />
                        <CustomizedFormField
                            control={form.control}
                            name="ownerEmail"
                            label="Email"
                            inputProps={{ placeholder: "example@mail.com" }}
                        />
                        <CustomizedFormField
                            control={form.control}
                            name="ownerPhoneNumber"
                            label="Phone Number"
                            inputProps={{ placeholder: "628xxxxxxxxxx" }}
                        />
                    </CardContent>
                    <CardFooter>
                        <Button type="submit">Create</Button>
                    </CardFooter>
                </form>
            </Form>
        </Card>
    )
}


export const TicketCreateManySchema = z.object({
    data_csv: z.string()
})


function TicketCreateMany() {
    const navigate = useNavigate()

    const { toast } = useToast()

    const form = useForm<z.infer<typeof TicketCreateManySchema>>({
        resolver: zodResolver(TicketCreateManySchema),
        defaultValues: { data_csv: "" },
    })

    const onSubmit = async (values: z.infer<typeof TicketCreateManySchema>) => {
        // console.log(values)
        const ticketlist = values.data_csv.trim().split(';')
        const createTicketsData: {invitationId:string, ownerName:string, ownerContacts: {email:string, phone_number:string}}[] = ticketlist.map((e) => {
            const splitres = e.split(',')
            return {invitationId: splitres[0].trim(), ownerName: splitres[1].trim(), ownerContacts: { email: splitres[2].trim(), phone_number: splitres[3].trim()}}
        })
        try {
            const tickets = await createMany(createTicketsData)
            toast({
                title: "Successfully created multiple ticket!",
                description: `Created ticket UUIDs=${tickets.map((ticket) => ticket.UUID)}`
            })
            queryClient.invalidateQueries(getAll)
            navigate(`../`)
        } catch (e) {
            toast({
                title: "Failed to create tickets!",
                description: "Something went wrong.",
                variant: "destructive"
            })
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Create Multiple Tickets</CardTitle>
                <CardDescription>
                    Enter the data for the new tickets, with a comma seperated format (csv-like) without its header.
                </CardDescription>
            </CardHeader>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="">
                    <CardContent className="space-y-2">
                        <CustomizedFormTextAreaField
                            control={form.control}
                            name="data_csv"
                            label="Ticket Entries"
                            textAreaProps={{ placeholder: "invitationId1,ownerName1,ownerEmail1,ownerPhoneNumber1;\ninvitationId2,ownerName2,ownerEmail2,ownerPhoneNumber2;\n..." }}
                        />
                    </CardContent>
                    <CardFooter>
                        <Button type="submit">Create</Button>
                    </CardFooter>
                </form>
            </Form>
        </Card>
    )
}


export function TicketCreatePage() {
    return (
        <TabsTemplate tabs={
            [
                { id: 'Create One', tabContent: TicketCreate },
                { id: 'Create Many', tabContent: TicketCreateMany },
            ]
        } />
    )
}
