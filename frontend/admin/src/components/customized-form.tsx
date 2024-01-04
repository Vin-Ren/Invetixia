import { Control, FieldPath, FieldValues, FormProviderProps, SubmitHandler } from "react-hook-form"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "./ui/form"
import { Input, InputProps } from "./ui/input"
import { ReactNode } from "react"
import { Card } from "./ui/card"


export const CustomizedFormField = <
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
    control,
    name,
    label,
    inputProps,
    description 
}: {
    control: Control<TFieldValues>,
    name: TName,
    label: string,
    inputProps: InputProps & React.RefAttributes<HTMLInputElement>,
    description: string | ReactNode
}) => {

    return (
        <FormField
            control={control}
            name={name}
            render={({ field }) => (
                <FormItem>
                    <FormLabel>{label}</FormLabel>
                    <FormControl>
                        <Input {...inputProps} {...field} />
                    </FormControl>
                    <FormDescription>
                        {description}
                    </FormDescription>
                    <FormMessage />
                </FormItem>
            )
            } />
    )
}


export const FormInCard = <
TFieldValues extends FieldValues, 
TContext = any, 
TTransformedValues extends FieldValues | undefined = undefined
>({
    className = {card: '', form: ''}, 
    formProps,
    onSubmit,
    children
}: {
    className: {
        card?: string,
        form?: string
    }, 
    formProps: Omit<FormProviderProps<TFieldValues, TContext, TTransformedValues>, "children">,
    onSubmit: TTransformedValues extends undefined ? SubmitHandler<TFieldValues> : TTransformedValues extends FieldValues ? SubmitHandler<TTransformedValues> : never,
    children: ReactNode | ReactNode[]
}) => {
    return (
        <Card className={className.card}>
            <Form {...formProps}>
                <form onSubmit={formProps.handleSubmit(onSubmit)} className={className.form}>
                    {children}
                </form>
            </Form>
        </Card>
    )
}
