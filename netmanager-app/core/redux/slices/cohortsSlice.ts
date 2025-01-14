interface Device {
    _id: string;
    name: string;
    network: string;
    groups: string[];
    authRequired: boolean;
    serial_number: string;
    api_code: string;
    long_name: string;
}

interface Cohort {
    _id: string;
    visibility: boolean;
    cohort_tags: string[];
    cohort_codes: string[];
    name: string;
    network: string;
    groups: string[];
    numberOfDevices: number;
    devices: Device[];
}