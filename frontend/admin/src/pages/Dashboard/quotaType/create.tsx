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
import { createMany, createOne } from "@/lib/api/quotaType";
import { useToast } from "@/components/ui/use-toast";
import { queryClient } from "@/lib/api";
import { getAll } from "@/lib/queries/quotaType";



export const QuotaTypeCreateSchema = z.object({
    name: z.string()
        .min(2, { message: 'username is too short' })
        .max(30, { message: 'username is too long' }),
    description: z.string()
})


function QuotaTypeCreateOne() {
    const navigate = useNavigate()

    const { toast } = useToast()

    const form = useForm<z.infer<typeof QuotaTypeCreateSchema>>({
        resolver: zodResolver(QuotaTypeCreateSchema),
        defaultValues: { name: "", description: ""},
    })

    const onSubmit = async (values: z.infer<typeof QuotaTypeCreateSchema>) => {
        try {
            const entr = await createOne(values)
            toast({
                title: "Successfully created a quota type!",
                description: "Redirecting in a second."
            })
            queryClient.invalidateQueries(getAll)
            navigate(`../details/${entr.UUID}`)
        } catch (e) {
            toast({
                title: "Failed to create a quota type!",
                description: "Something went wrong.",
                variant: "destructive"
            })
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Create Quota Type</CardTitle>
                <CardDescription>
                    Enter quota type information
                </CardDescription>
            </CardHeader>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="">
                    <CardContent className="space-y-2">
                        <CustomizedFormField
                            control={form.control}
                            name="name"
                            label="Name"
                            inputProps={{ placeholder: "Example Name" }}
                        />
                        <CustomizedFormField
                            control={form.control}
                            name="description"
                            label="Description"
                            inputProps={{ placeholder: "A brief description"}}
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


export const QuotaTypeCreateManySchema = z.object({
    data_csv: z.string()
})


function QuotaTypeCreateMany() {
    const navigate = useNavigate()

    const { toast } = useToast()

    const form = useForm<z.infer<typeof QuotaTypeCreateManySchema>>({
        resolver: zodResolver(QuotaTypeCreateManySchema),
        defaultValues: { data_csv: "" },
    })

    const onSubmit = async (values: z.infer<typeof QuotaTypeCreateManySchema>) => {
        // console.log(values)
        const userlist = values.data_csv.trim().split(';')
        const createQuotaTypesData = userlist.map((e) => {
            const splitres = e.split(',')
            return {name: splitres[0].trim(), description: splitres[1].trim()}
        })
        try {
            const entries = await createMany(createQuotaTypesData)
            toast({
                title: "Successfully created multiple quota types!",
                description: `Created quota types UUIDs=${entries.map((entr) => entr.UUID)}`
            })
            queryClient.invalidateQueries(getAll)
            navigate(`../`)
        } catch (e) {
            toast({
                title: "Failed to create quota types!",
                description: "Something went wrong.",
                variant: "destructive"
            })
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Create Multiple Quota Types</CardTitle>
                <CardDescription>
                    Enter the data for the new quota types, with a comma seperated format (csv-like) without its header.
                </CardDescription>
            </CardHeader>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="">
                    <CardContent className="space-y-2">
                        <CustomizedFormTextAreaField
                            control={form.control}
                            name="data_csv"
                            label="User Entries"
                            textAreaProps={{ placeholder: "name1,description1;\nname2,description2;\n..." }}
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


export function QuotaTypeCreatePage() {
    return (
        <TabsTemplate tabs={
            [
                { id: 'Create One', tabContent: QuotaTypeCreateOne },
                { id: 'Create Many', tabContent: QuotaTypeCreateMany },
            ]
        } />
    )
}
