import nominatim from 'nominatim-client';


export const nominatimClient = nominatim.createClient({
    useragent: "JobeeApi",             // The name of your application
    referer: 'http://example.com',  // The referer link
});