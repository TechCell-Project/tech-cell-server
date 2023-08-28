export function formatLogsDiscord(message: string) {
    const jsonData = JSON.parse(message);
    const messageLogs = {
        content: '```json\n' + JSON.stringify(jsonData, null, 2) + '\n```',
    };
    return messageLogs;
}
