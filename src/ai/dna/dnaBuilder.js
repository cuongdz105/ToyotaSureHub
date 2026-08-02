import company from "./company";
import human from "./human";
import forbidden from "./forbidden";
import facebook from "./facebook";

export function buildDNA(type) {

    let channel = "";

    if(type==="facebook"){
        channel = facebook;
    }

    return `
${company}

${human}

${forbidden}

${channel}
`;
}