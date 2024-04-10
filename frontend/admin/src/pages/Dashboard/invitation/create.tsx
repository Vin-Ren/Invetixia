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
import { createOne } from "@/lib/api/invitation";
import { useToast } from "@/components/ui/use-toast";
import { queryClient } from "@/lib/api";
import { getAll } from "@/lib/queries/invitation";



export const InvitationCreateSchema = z.object({
    name: z.string()
        .min(2, { message: 'username is too short' })
        .max(50, { message: 'username is too long' }),
    organisationId: z.string(),
    usageQuota: z.number(),
    defaultQuotas: z.string()
})


function InvitationCreate() {
    const navigate = useNavigate()

    const { toast } = useToast()

    const form = useForm<z.infer<typeof InvitationCreateSchema>>({
        resolver: zodResolver(InvitationCreateSchema),
        defaultValues: { name: "", organisationId: "", usageQuota: 1, defaultQuotas: "" },
    })

    const onSubmit = async (values: z.infer<typeof InvitationCreateSchema>) => {
        try {
            const defaultQuotas = values.defaultQuotas.trim().split(';').map((s) => ({quotaTypeId: s.split(',')[0].trim(), value: parseInt(s.split(',')[1])}))
            const invitation = await createOne({...values, defaultQuotas })
            toast({
                title: "Successfully created an invitation!",
                description: "Redirecting in a second."
            })
            queryClient.invalidateQueries(getAll)
            navigate(`../details/${invitation.UUID}`)
        } catch (e) {
            toast({
                title: "Failed to create an invitation!",
                description: "Something went wrong.",
                variant: "destructive"
            })
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Create Invitation</CardTitle>
                <CardDescription>
                    Enter invitation information
                </CardDescription>
            </CardHeader>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="">
                    <CardContent className="space-y-2">
                        <CustomizedFormField
                            control={form.control}
                            name="name"
                            label="Invitation Name"
                            inputProps={{ placeholder: "Example" }}
                        />
                        <CustomizedFormField
                            control={form.control}
                            name="organisationId"
                            label="Organisation ID"
                            inputProps={{ placeholder: "xxxx-xxxx-xxxx-xxxx" }}
                        />
                        <CustomizedFormField
                            control={form.control}
                            name="usageQuota"
                            label="Usage Quota"
                            inputProps={{ placeholder: "Quota of this invitation" }}
                        />
                        <CustomizedFormTextAreaField
                            control={form.control}
                            name="defaultQuotas"
                            label="Default Quotas"
                            description="Enter values in csv-like format. e.g: 'quotaTypeId1,value1;quotaTypeId2,value2;...'"
                            textAreaProps={{ placeholder: "quotaTypeId1,value1;\nquotaTypeId2,value2;\n..." }}
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


export function InvitationCreatePage() {
    return (
        <TabsTemplate tabs={
            [
                { id: 'Create One', tabContent: InvitationCreate },
            ]
        } />
    )
}
