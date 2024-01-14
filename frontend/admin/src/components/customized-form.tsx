import { Control, FieldPath, FieldValues } from "react-hook-form"
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "./ui/form"
import { Input, InputProps } from "./ui/input"
import { ReactNode } from "react"
import { Textarea, TextareaProps } from "@/components/ui/textarea"


export interface CustomizedFormFieldProps<
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> {
    control: Control<TFieldValues>,
    name: TName,
    label: string,
    inputProps: InputProps & React.RefAttributes<HTMLInputElement>,
    description?: string | ReactNode,
}


export const CustomizedFormField = <
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
    control,
    name,
    label,
    inputProps,
    description = ""
}: CustomizedFormFieldProps<TFieldValues, TName>) => {
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
        <FormField
            control={control}
            name={name}
            render={({ field }) => (
                <FormItem>
                    <FormLabel>{label}</FormLabel>
                    <FormControl>
                        <Textarea {...textAreaProps} {...field} />
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
