import nodeGeocoder from "node-geocoder";
import dotenv from "dotenv";
dotenv.config({ path: '.env' });


export const geoCoder = nodeGeocoder({
    provider: process.env.GEOCODER_PROVIDER,
    httpAdapter: 'https',
    apiKey: process.env.GEOCODER_API_KEY,
    formatter: null
});