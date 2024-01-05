import { useState, useMemo } from 'react';

const isUpdaterFunction = <T>(fn: T | ((arg0: T) => T)): fn is ((arg0: T) => T) => {
  return (typeof fn === 'function')
}

// DS Short for Data Structure
export default function useDS<T extends unknown[]>() {
  const [obj, setObj] = useState<Record<string, T[number]>>({})

  return useMemo(() => {
    const getValue = (key: string) => obj[key]
    const setValue = (key: string, updater: T[number] | ((arg0: T[number]) => T[number])) => {
      if (isUpdaterFunction(updater)) {
        if (!(key in obj)) setObj((prv) => ({ ...prv, [key]: updater({}) }))
        else setObj((prv) => ({ ...prv, [key]: updater(obj[key]) }))
      } else {
        setObj((prv) => ({ ...prv, [key]: updater }))
      }
    }
    const createGetter = (key: string) => (() => getValue(key))
    const createSetter = (key: string) => ((updater: T[number] | ((arg0: T[number]) => T[number])) => setValue(key, updater))
    return { getValue, setValue, createGetter, createSetter }
  }, [obj])
}
