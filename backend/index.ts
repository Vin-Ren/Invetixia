import { env } from "process";
import app from "./app";

let { BACKEND_PORT } = env;
BACKEND_PORT = BACKEND_PORT !== undefined ? BACKEND_PORT : "8080";

app.listen(parseInt(BACKEND_PORT), async () => {
    console.log(`Backend listening on localhost:${BACKEND_PORT}`)
})
