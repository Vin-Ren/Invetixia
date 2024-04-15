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

interface InvitationEmailProps {
    event?: {
        name?: string
    };
    bgUrl?: string;
    logoUrl?: string;
    qrImgUrl?: string;
    invitationLink?: string;
}

export const InvitationEmail = ({
    event,
    bgUrl,
    logoUrl,
    qrImgUrl,
    invitationLink = ''
}: InvitationEmailProps) => {
    return (
        <Html>
            <Head />
            <Preview>Event Invitation</Preview>
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
                                    Hello there!
                                </Heading>
                                <Heading
                                    as="h2"
                                    style={{
                                        fontSize: 26,
                                        fontWeight: "bold",
                                        textAlign: "center",
                                    }}
                                >
                                    We are inviting you to {event?.name}.
                                </Heading>
                                
                                <Text style={paragraph}>
                                    The details of the event will be announced later.
                                </Text>

                                <Text style={paragraph}>
                                    Below is The QR Code for your invitation. Please register by scanning the QR Code and entering your information.
                                </Text>
                                <Img
                                    style={image}
                                    width={470}
                                    src={`${qrImgUrl}`}
                                />
                                <Text style={{ ...paragraph, marginTop: -5 }}>
                                    You can also register by clicking the button below.
                                </Text>
                                <Text style={{ ...paragraph, marginTop: -5 }}>
                                    If clicking the button does not work, try copying this link into your browser: {invitationLink}
                                </Text>
                            </Column>
                        </Row>
                        <Row style={{ ...boxInfos, paddingTop: "0" }}>
                            <Column style={containerButton} colSpan={2}>
                                <Button style={button} href={invitationLink}>View Invitation</Button>
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

export default InvitationEmail;

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
