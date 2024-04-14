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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { TabsTemplate } from "@/components/tabs-template";
import { Form } from "@/components/ui/form";
import { CustomizedFormField, CustomizedFormTextAreaField, CustomizedGeneralFormField } from "@/components/customized-form";
import { createMany, createOne } from "@/lib/api/user";
import { useToast } from "@/components/ui/use-toast";
import { queryClient } from "@/lib/api";
import { getAll } from "@/lib/queries/user";



export const UserCreateSchema = z.object({
    username: z.string()
        .min(2, { message: 'username is too short' })
        .max(50, { message: 'username is too long' }),
    password: z.string()
        .min(8, {message: "Password requires atleast 8 characters"})
        .max(50, {message: "Password can only be at most 50 characters"}),
    role: z.number(),
    organisationName: z.string()
})


function UserCreate() {
    const navigate = useNavigate()

    const { toast } = useToast()

    const form = useForm<z.infer<typeof UserCreateSchema>>({
        resolver: zodResolver(UserCreateSchema),
        defaultValues: { username: "", password: "", role: 1, organisationName: "" },
    })

    const onSubmit = async (values: z.infer<typeof UserCreateSchema>) => {
        try {
            const user = await createOne(values)
            toast({
                title: "Successfully created an user!",
                description: "Redirecting in a second."
            })
            queryClient.invalidateQueries(getAll)
            navigate(`../details/${user.UUID}`)
        } catch (e) {
            toast({
                title: "Failed to create an user!",
                description: "Something went wrong.",
                variant: "destructive"
            })
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Create User</CardTitle>
                <CardDescription>
                    Enter user information
                </CardDescription>
            </CardHeader>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="">
                    <CardContent className="space-y-2">
                        <CustomizedFormField
                            control={form.control}
                            name="username"
                            label="Username"
                            inputProps={{ placeholder: "Example User" }}
                        />
                        <CustomizedFormField
                            control={form.control}
                            name="password"
                            label="Password"
                            inputProps={{ placeholder: "S0m3_R3ally_$ecur3_P4s$$0rd", type: "password" }}
                        />
                        <CustomizedGeneralFormField
                            control={form.control}
                            name="role"
                            label="User Role"
                            render={({field}) => (
                                <Select>
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="Role"/>
                                    </SelectTrigger>
                                    <SelectContent {...field}>
                                        <SelectItem value={"4"}>ADMIN</SelectItem>
                                        <SelectItem value={"2"}>Organisation Manager</SelectItem>
                                        <SelectItem value={"1"}>Observer</SelectItem>
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        <CustomizedFormField
                            control={form.control}
                            name="organisationName"
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


export const UserCreateManySchema = z.object({
    data_csv: z.string()
})


function UserCreateMany() {
    const navigate = useNavigate()

    const { toast } = useToast()

    const form = useForm<z.infer<typeof UserCreateManySchema>>({
        resolver: zodResolver(UserCreateManySchema),
        defaultValues: { data_csv: "" },
    })

    const onSubmit = async (values: z.infer<typeof UserCreateManySchema>) => {
        // console.log(values)
        const userlist = values.data_csv.trim().split(';')
        const createUsersData: {username:string, password:string, role:number, organisationName:string}[] = userlist.map((e) => {
            const splitres = e.split(',')
            return {username: splitres[0].trim(), password: splitres[1].trim(), role: parseInt(splitres[2].trim()), organisationName: splitres[3].trim()}
        })
        try {
            const users = await createMany(createUsersData)
            toast({
                title: "Successfully created multiple user!",
                description: `Created user UUIDs=${users.map((usr) => usr.UUID)}`
            })
            queryClient.invalidateQueries(getAll)
            navigate(`../`)
        } catch (e) {
            toast({
                title: "Failed to create users!",
                description: "Something went wrong.",
                variant: "destructive"
            })
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Create Multiple Users</CardTitle>
                <CardDescription>
                    Enter the data for the new users, with a comma seperated format (csv-like) without its header.
                </CardDescription>
            </CardHeader>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="">
                    <CardContent className="space-y-2">
                        <CustomizedFormTextAreaField
                            control={form.control}
                            name="data_csv"
                            label="User Entries"
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


export function UserCreatePage() {

    return (
        <TabsTemplate tabs={
            [
                { id: 'Create One', tabContent: UserCreate },
                { id: 'Create Many', tabContent: UserCreateMany },
            ]
        } />
    )
}