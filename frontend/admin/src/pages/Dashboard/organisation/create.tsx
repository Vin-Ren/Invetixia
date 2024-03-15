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
import { createMany, createOne } from "@/lib/api/organisation";
import { useToast } from "@/components/ui/use-toast";
import { queryClient } from "@/lib/api";
import { getAll } from "@/lib/queries/organisation";



export const OrganisationCreateSchema = z.object({
    name: z.string()
        .min(2, { message: 'Organisation name is too short' })
        .max(50, { message: 'Organisation name is too long' })
})


function OrganisationCreate() {
    const navigate = useNavigate()

    const { toast } = useToast()

    const form = useForm<z.infer<typeof OrganisationCreateSchema>>({
        resolver: zodResolver(OrganisationCreateSchema),
        defaultValues: { name: "" },
    })

    const onSubmit = async (values: z.infer<typeof OrganisationCreateSchema>) => {
        try {
            const organisation = await createOne(values.name)
            toast({
                title: "Successfully created an organisation!",
                description: "Redirecting in a second."
            })
            queryClient.invalidateQueries(getAll)
            navigate(`../details/${organisation.UUID}`)
        } catch (e) {
            toast({
                title: "Failed to create an organisation!",
                description: "Something went wrong.",
                variant: "destructive"
            })
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Create an Organisation</CardTitle>
                <CardDescription>
                    Enter the name for the new organisation
                </CardDescription>
            </CardHeader>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="">
                    <CardContent className="space-y-2">
                        <CustomizedFormField
                            control={form.control}
                            name="name"
                            label="Organisation Name"
                            inputProps={{ placeholder: "Example Organisation" }}
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


export const OrganisationCreateManySchema = z.object({
    names_csv: z.string()
})


function OrganisationCreateMany() {
    const navigate = useNavigate()

    const { toast } = useToast()

    const form = useForm<z.infer<typeof OrganisationCreateManySchema>>({
        resolver: zodResolver(OrganisationCreateManySchema),
        defaultValues: { names_csv: "" },
    })

    const onSubmit = async (values: z.infer<typeof OrganisationCreateManySchema>) => {
        console.log(values)
        const names = values.names_csv.split(',')
        try {
            const organisations = await createMany(names)
            toast({
                title: "Successfully created multiple organisation!",
                description: `Created organisation UUIDs=${organisations.map((org) => org.UUID)}`
            })
            queryClient.invalidateQueries(getAll)
            navigate(`../`)
        } catch (e) {
            toast({
                title: "Failed to create organisations!",
                description: "Something went wrong.",
                variant: "destructive"
            })
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Create Multiple Organisations</CardTitle>
                <CardDescription>
                    Enter the names for the new organisations, with a comma seperated format (csv-like) without its header.
                </CardDescription>
            </CardHeader>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="">
                    <CardContent className="space-y-2">
                        <CustomizedFormTextAreaField
                            control={form.control}
                            name="names_csv"
                            label="Organisation Name"
                            textAreaProps={{ placeholder: "Company 1,Company 2,Company 3,Company 4" }}
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


export function OrganisationCreatePage() {

    return (
        <TabsTemplate tabs={
            [
                { id: 'Create One', tabContent: OrganisationCreate },
                { id: 'Create Many', tabContent: OrganisationCreateMany },
            ]
        } />
    )
}