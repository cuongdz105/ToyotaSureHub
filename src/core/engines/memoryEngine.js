import rules from "../memory/rules.json";

export function getMemories(type) {

    return rules.filter(rule => rule.type === type);

}