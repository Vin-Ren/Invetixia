import { Control, ControllerFieldState, ControllerRenderProps, FieldPath, FieldValues, UseFormStateReturn } from "react-hook-form"
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "./ui/form"
import { Input, InputProps } from "./ui/input"
import { ReactNode } from "react"
import { Textarea, TextareaProps } from "@/components/ui/textarea"


export interface CustomizedGeneralFormFieldProps<
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> {
    control: Control<TFieldValues>,
    name: TName,
    label: string,
    description?: string | ReactNode,
    render: ({
        field,
        fieldState,
        formState
    }: {
        field: ControllerRenderProps<TFieldValues, TName>,
        fieldState: ControllerFieldState,
        formState: UseFormStateReturn<TFieldValues>
    }) => React.ReactNode
}


export const CustomizedGeneralFormField = <
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
    control,
    name,
    label,
    description = "",
    render
}: CustomizedGeneralFormFieldProps<TFieldValues, TName>) => {
    return (
        <FormField
            control={control}
            name={name}
            render={(renderProps) => (
                <FormItem>
                    <FormLabel>{label}</FormLabel>
                    <FormControl>
                        {render(renderProps)}
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


export interface CustomizedFormFieldProps<
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> {
    control: Control<TFieldValues>,
    name: TName,
    label: string,
    inputProps?: InputProps & React.RefAttributes<HTMLInputElement>,
    description?: string | ReactNode,
}


export const CustomizedFormField = <
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
    control,
    name,
    label,
    inputProps = {},
    description = ""
}: CustomizedFormFieldProps<TFieldValues, TName>) => {
    return (
        <CustomizedGeneralFormField
            control={control}
            name={name}
            label={label}
            description={description}
            render={({ field }) => (<Input {...inputProps} {...field} />)}
        />
    )
}


export interface CustomizedFormTextAreaFieldProps<
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> {
    control: Control<TFieldValues>,
    name: TName,
    label: string,
    textAreaProps: TextareaProps & React.RefAttributes<HTMLInputElement>,
    description?: string | ReactNode,
}

export const CustomizedFormTextAreaField = <
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
    control,
    name,
    label,
    textAreaProps,
    description = ""
}: CustomizedFormTextAreaFieldProps<TFieldValues, TName>) => {
    return (
        <CustomizedGeneralFormField
            control={control}
            name={name}
            label={label}
            description={description}
            render={({ field }) => (<Textarea {...textAreaProps} {...field} />)}
        />
    )
}
