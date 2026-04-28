import {config} from "../config.js"

export async function displayAllBati() {
    try {
        const res = await fetch(`${config.api_url}/api/bati`)
        return await res.json();
    } catch(err) {
        console.log("ERROR API:", err)
    }
};