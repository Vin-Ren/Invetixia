import { useState, useEffect, Dispatch, SetStateAction } from 'react';


function getSavedValue<T>(key: string, initialValue: T) {
  const jsonValue = localStorage.getItem(key)
  if (jsonValue != null) return JSON.parse(jsonValue)
  if (initialValue instanceof Function) return initialValue()
  return initialValue
}


export default function useLocalStorage<T>(key: string, initialValue?: T): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => {
    return getSavedValue(key, () => (initialValue))
  })

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value))
  }, [value])

  return [value, setValue]
}
