import {
    Body,
    Button,
    Container,
    Column,
    Head,
    Heading,
    Html,
    Img,
    Preview,
    Row,
    Section,
    Text,
    Link,
} from "@react-email/components";
import * as React from "react";

interface TicketEmailProps {
    event?: {
        name?: string,
        startTime?: Date,
        locationName?: string
    };
    ownerName?: string;
    bgUrl?: string;
    logoUrl?: string;
    qrImgUrl?: string;
    ticketLink?: string;
    timezone?: string;
}

export const TicketEmail = ({
    event,
    ownerName,
    bgUrl,
    logoUrl,
    qrImgUrl,
    ticketLink,
    timezone
}: TicketEmailProps) => {
    let formattedDate = ""

    try {
        formattedDate = new Intl.DateTimeFormat("en", {
            dateStyle: "long",
            timeStyle: "short",
            timeZone: timezone
        }).format(new Date(event?.startTime || ""));
    } catch (e) {
        console.log(e)
    }

    return (
        <Html>
            <Head />
            <Preview>Event reminder</Preview>
            <Body style={main}>
                <Container>
                    <Section style={logo}>
                        <Img src={logoUrl} width={48} />
                    </Section>
                    <Section style={content}>
                        <Row>
                            <Img
                                style={image}
                                width={620}
                                src={bgUrl}
                            />
                        </Row>

                        <Row style={{ ...boxInfos, paddingBottom: "0" }}>
                            <Column>
                                <Heading
                                    style={{
                                        fontSize: 32,
                                        fontWeight: "bold",
                                        textAlign: "center",
                                    }}
                                >
                                    Hi {ownerName},
                                </Heading>
                                <Heading
                                    as="h2"
                                    style={{
                                        fontSize: 26,
                                        fontWeight: "bold",
                                        textAlign: "center",
                                    }}
                                >
                                    We would like to remind you of an upcoming event, {event?.name}.
                                </Heading>
                                
                                <Text style={paragraph}>
                                    The details of the event is as specified below:
                                </Text>
                                <Text style={paragraph}>
                                    <b>Time: </b>
                                    {formattedDate} in {timezone} time zone.
                                </Text>
                                <Text style={{ ...paragraph, marginTop: -5 }}>
                                    <b>Location: </b>
                                    {event?.locationName}
                                </Text>
                                <Text
                                    style={{
                                        color: "rgb(0,0,0, 0.5)",
                                        fontSize: 14,
                                        marginTop: -5,
                                    }}
                                >
                                    *Specific details regarding the event will follow.
                                </Text>

                                <Text style={paragraph}>
                                    Below is The QR Code for your ticket, be mindful of your ticket.
                                </Text>
                                <Img
                                    style={image}
                                    width={470}
                                    src={`${qrImgUrl}`}
                                />
                                <Text style={{ ...paragraph, marginTop: -5 }}>
                                    Make sure to keep this email as a backup for your ticket.
                                </Text>
                                <Text style={{ ...paragraph, marginTop: -5 }}>
                                    You can also view your ticket by clicking the button below.
                                </Text>
                                <Text style={{ ...paragraph, marginTop: -5 }}>
                                    If clicking the button does not work, try copying this link into your browser: {ticketLink}
                                </Text>
                            </Column>
                        </Row>
                        <Row style={{ ...boxInfos, paddingTop: "0" }}>
                            <Column style={containerButton} colSpan={2}>
                                <Button style={button} href={ticketLink}>View Ticket</Button>
                            </Column>
                        </Row>
                    </Section>

                    <Text
                        style={{
                            textAlign: "center",
                            fontSize: 12,
                            color: "rgb(0,0,0, 0.7)",
                        }}
                    >
                        © 2024 | Powered by Invetixia.
                    </Text>
                </Container>
            </Body>
        </Html>
    );
};

export default TicketEmail;

const main = {
    backgroundColor: "#fff",
    fontFamily:
        '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const paragraph = {
    fontSize: 16,
};

const logo = {
    padding: "30px 20px",
};

const containerButton = {
    display: "flex",
    justifyContent: "center",
    width: "100%",
};

const button = {
    backgroundColor: "#e00707",
    borderRadius: 3,
    color: "#FFF",
    fontWeight: "bold",
    border: "1px solid rgb(0,0,0, 0.1)",
    cursor: "pointer",
    padding: "12px 30px",
};

const content = {
    border: "1px solid rgb(0,0,0, 0.1)",
    borderRadius: "3px",
    overflow: "hidden",
};

const image = {
    maxWidth: "100%",
};

const boxInfos = {
    padding: "20px",
};
