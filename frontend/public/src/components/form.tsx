

export const TextInput = ({ prompt, placeholder, infoText = '', error = undefined, value, stateSetter = () => null, disabled = false, ...props }: { prompt: string, placeholder: string, infoText?: string, error?: string | undefined, value: string, stateSetter?: Function, disabled?: boolean, props?: any }) => {
    return (
        <label className="form-control w-full max-w-md">
            <div className="label">
                <span className="label-text font-medium">{prompt}</span>
            </div>
            <input type="text" className="input input-bordered w-full max-w-md border-primary" placeholder={placeholder} value={value} onChange={(e) => { stateSetter(e.target.value) }} disabled={disabled} {...props} />
            <div className='label gap-4'>
                <span className={"label-text-alt font-small" + (!infoText ? 'invisible' : '')}>{infoText}</span>
                <span className={"label-text-alt text-error font-bold" + (!error ? 'invisible' : '')}>{error}</span>
            </div>
        </label>
    )
}
