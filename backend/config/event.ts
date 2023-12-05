
type Contacts = {
    // e.g https://example.com
    mainWebsite?: string, 

    // e.g: @username
    instagram?: string, 
    
    // e.g: example@mail.com
    mail?: string, 
}

const event: {
    name: string, // displayed as hero's title
    description: string, // displayed as the paragraph text on hero
    startTime: Date, // used to calculate time left to the event, for countdown.
    contacts?: Contacts // to be displayed on footer of hero
    } = {
    name: "Invetixia", // title on hero
    description: "Invetixia launching event", // description on hero
    startTime: new Date("2099-01-01T00:00:00.000+00:00"),
    contacts: {
        mainWebsite: "https://github.com/Vin-Ren/Invetixia"
    }
}

export default event
