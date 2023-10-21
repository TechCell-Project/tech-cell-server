export type TTransport = {
    host: string;
    secure?: boolean;
    auth: {
        user: string;
        pass: string;
    };
};
