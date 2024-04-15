import { Button, ButtonProps } from "@/components/ui/button"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { useEffect, useState } from "react"


export function Combobox({
    label = 'item',
    initialValue = '',
    options,
    onChange,
    buttonProps = {}
}: {
    label?: string,
    initialValue?: string,
    options: { value: string, label: string }[],
    onChange: (value: string) => void,
    buttonProps?: ButtonProps
}) {
    const [open, setOpen] = useState(false)
    const [value, setValue] = useState(initialValue)

    useEffect(() => {
        onChange(value)
    }, [value])

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full max-w-xs justify-between"
                    {...buttonProps}
                >
                    {value
                        ? options.find((option) => option.value === value)?.label
                        : `Select ${label}...`}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full max-w-xs p-0">
                <Command>
                    <CommandInput placeholder={`Search ${label}...`} />
                    <CommandList>
                        <CommandEmpty>No {`${label}`} found.</CommandEmpty>
                        <CommandGroup>
                            {options.map((option) => (
                                <CommandItem
                                    key={option.value}
                                    value={option.value}
                                    onSelect={(currentValue) => {
                                        setValue(currentValue === value ? "" : currentValue)
                                        setOpen(false)
                                    }}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            value === option.value ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    {option.label}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
