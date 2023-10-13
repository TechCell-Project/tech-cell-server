export const UtilityMessagePattern = {
    getUtility: { cmd: 'get_utility' },
    getUtilityAuth: { cmd: 'get_utility_auth' },
};

export const UtilityEventPattern = {
    writeLogsToDiscord: { event: 'utility.writeLogsToDiscord' },
    writeLogsToFile: { event: 'utility.writeLogsToFile' },
};
