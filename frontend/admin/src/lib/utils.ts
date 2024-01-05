import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}


// Ref: https://kasama-chenkaow.medium.com/typescript-convert-array-of-object-to-object-with-id-as-a-key-81d012ca70c5
export type StringKeys<T> = {
    [K in keyof T]: T[K] extends string | number | symbol ? K : never;
}[keyof T];
export function arrayToKeyObject<
    T extends Record<StringKeys<T>, string | number | symbol>,
    TKeyName extends keyof Record<StringKeys<T>, string | number | symbol>
>(
    array: T[],
    key: TKeyName
): Record<T[TKeyName], T> {
    return Object.fromEntries(array.map(a => [a[key], a])) as Record<T[TKeyName], T>
}

export const isFunction = (fn: never | ((...arg0: never[]) => never)): fn is ((...arg0: never[]) => never) => {
    return (typeof fn === 'function')
}
