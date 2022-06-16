const ipLookupUrl = 'http://ip-api.com/json';

export const ipLookup = async() => await fetch(ipLookupUrl).then(response => response.json());