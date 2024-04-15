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
import { createMany, createOne } from "@/lib/api/quota";
import { useToast } from "@/components/ui/use-toast";
import { queryClient } from "@/lib/api";
import { getAll } from "@/lib/queries/quota";



export const QuotaCreateSchema = z.object({
    quotaTypeId: z.string(),
    ticketId: z.string(),
    usageLeft: z.string()
})


function QuotaCreate() {
    const navigate = useNavigate()

    const { toast } = useToast()

    const form = useForm<z.infer<typeof QuotaCreateSchema>>({
        resolver: zodResolver(QuotaCreateSchema)
    })

    const onSubmit = async (values: z.infer<typeof QuotaCreateSchema>) => {
        try {
            const quota = await createOne({ ...values, usageLeft: parseInt(values.usageLeft) })
            toast({
                title: "Successfully created an quota!",
                description: "Redirecting in a second."
            })
            queryClient.invalidateQueries(getAll)
            navigate(`../details/${quota.UUID}`)
        } catch (e) {
            toast({
                title: "Failed to create an quota!",
                description: "Something went wrong.",
                variant: "destructive"
            })
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Create Quota</CardTitle>
                <CardDescription>
                    Enter quota information
                </CardDescription>
            </CardHeader>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="">
                    <CardContent className="space-y-2">
                        <CustomizedFormField
                            control={form.control}
                            name="quotaTypeId"
                            label="Quota Type Id"
                            inputProps={{ placeholder: "xxxx-xxxx-xxxx-xxxx" }}
                        />
                        <CustomizedFormField
                            control={form.control}
                            name="ticketId"
                            label="Ticket Id"
                            inputProps={{ placeholder: "xxxx-xxxx-xxxx-xxxx" }}
                        />
                        <CustomizedFormField
                            control={form.control}
                            name="usageLeft"
                            label="Usage Left"
                            inputProps={{ placeholder: "Usage quota of this quota" }}
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


export const QuotaCreateManySchema = z.object({
    data_csv: z.string()
})


function QuotaCreateMany() {
    const navigate = useNavigate()

    const { toast } = useToast()

    const form = useForm<z.infer<typeof QuotaCreateManySchema>>({
        resolver: zodResolver(QuotaCreateManySchema),
        defaultValues: { data_csv: "" },
    })

    const onSubmit = async (values: z.infer<typeof QuotaCreateManySchema>) => {
        // console.log(values)
        const quotalist = values.data_csv.trim().split(';')
        const createQuotasData: { quotaTypeId: string, ticketId: string, usageLeft: number }[] = quotalist.map((e) => {
            const splitres = e.split(',')
            return { quotaTypeId: splitres[0].trim(), ticketId: splitres[1].trim(), usageLeft: parseInt(splitres[2]) }
        })
        try {
            const quotas = await createMany(createQuotasData)
            toast({
                title: "Successfully created multiple quota!",
                description: `Created quota UUIDs=${quotas.map((quota) => quota.UUID)}`
            })
            queryClient.invalidateQueries(getAll)
            navigate(`../`)
        } catch (e) {
            toast({
                title: "Failed to create quotas!",
                description: "Something went wrong.",
                variant: "destructive"
            })
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Create Multiple Quotas</CardTitle>
                <CardDescription>
                    Enter the data for the new quotas, with a comma seperated format (csv-like) without its header.
                </CardDescription>
            </CardHeader>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="">
                    <CardContent className="space-y-2">
                        <CustomizedFormTextAreaField
                            control={form.control}
                            name="data_csv"
                            label="Quota Entries"
                            description="quotaTypeId1,ticketId1,usageLeft1;quotaTypeId2,ticketId2,usageLeft2;..."
                            textAreaProps={{ placeholder: "username1,password1,role1,organisationName1;\nusername2,password2,role2,organisationName2;\n..." }}
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


export function QuotaCreatePage() {
    return (
        <TabsTemplate tabs={
            [
                { id: 'Create One', tabContent: QuotaCreate },
                { id: 'Create Many', tabContent: QuotaCreateMany },
            ]
        } />
    )
}
