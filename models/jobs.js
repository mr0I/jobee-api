import mongoose from "mongoose";
import validator from "validator";
import slugify from "slugify";
// import { geoCoder } from "../utils/geocoder.js";


const jobSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please enter Job title.'],
        trim: true,
        maxlength: [100, 'Job title can not exceed 100 characters.']
    },
    slug: String,
    description: {
        type: String,
        required: [true, 'Please enter Job description.'],
        maxlength: [1000, 'Job description can not exceed 1000 characters.']
    },
    email: {
        type: String,
        validate: [validator.isEmail, 'Please add a valid email address.']
    },
    address: {
        type: String,
        required: [true, 'Please add an address.']
    },
    location: {
        type: {
            type: String,
            enum: ['Point']
        },
        coordinates: {
            type: [Number],
            index: '2dsphere'
        },
        formattedAddress: String,
        city: String,
        state: String,
        zipcode: String,
        country: String
    },
    company: {
        type: String,
        required: [true, 'Please add Company name.']
    },
    industry: {
        type: [String],
        required: [true, 'Please enter industry for this job.'],
        enum: {
            values: [
                'Business',
                'Information Technology',
                'Banking',
                'Education/Training',
                'Telecommunication',
                'Others'
            ],
            message: 'Please select correct options for industry.'
        }
    },
    jobType: {
        type: String,
        required: [true, 'Please enter job type.'],
        enum: {
            values: [
                'Permanent',
                'Temporary',
                'Internship'
            ],
            message: 'Please select correct options for job type.'
        }
    },
    minEducation: {
        type: String,
        required: [true, 'Please enter minimum education for this job.'],
        enum: {
            values: [
                'Bachelors',
                'Masters',
                'Phd'
            ],
            message: 'Please select correct options for Education.'
        }
    },
    positions: {
        type: Number,
        default: 1
    },
    experience: {
        type: String,
        required: [true, 'Please enter experience required for this job.'],
        enum: {
            values: [
                'No Experience',
                '1 Year - 2 Years',
                '2 Year - 5 Years',
                '5 Years+'
            ],
            message: 'Please select correct options for Experience.'
        }
    },
    salary: {
        type: Number,
        required: [true, 'Please enter expected salary for this job.']
    },
    postingDate: {
        type: Date,
        default: Date.now
    },
    lastDate: {
        type: Date,
        default: new Date().setDate(new Date().getDate() + 7)
    },
    applicantsApplied: {
        type: [Object],
        select: false
    }
});

jobSchema.pre('save', function (next) {
    this.slug = slugify(this.title, {
        lower: true
    });
    next();
});


jobSchema.pre('save', async function (next) {
    // const loc = await geoCoder.geocode(this.address);
    const loc = [
        {
            "street": "651 N 2nd St",
            "adminArea6": "",
            "adminArea6Type": "Neighborhood",
            "adminArea5": "Oquawka",
            "adminArea5Type": "City",
            "adminArea4": "Henderson",
            "adminArea4Type": "County",
            "adminArea3": "IL",
            "adminArea3Type": "State",
            "adminArea1": "US",
            "adminArea1Type": "Country",
            "postalCode": "61469-8910",
            "geocodeQualityCode": "L1CAA",
            "geocodeQuality": "ADDRESS",
            "dragPoint": false,
            "sideOfStreet": "L",
            "linkId": "0",
            "unknownInput": "",
            "type": "s",
            "latLng": {
                "lat": 40.94134,
                "lng": -90.95292
            },
            "displayLatLng": {
                "lat": 40.94139,
                "lng": -90.95309
            },
            "mapUrl": ""
        }
    ];

    const formattedAddress = `${loc[0].street},${loc[0].adminArea1Type},${loc[0].adminArea1}`;
    this.location = {
        type: 'Point',
        coordinates: [loc[0].latLng.lng, loc[0].latLng.lat],
        formattedAddress,
        city: loc[0].adminArea5,
        state: loc[0].adminArea3Type,
        zipcode: loc[0].postalCode,
        country: loc[0].adminArea1
    }
    // next();
})

export const Job = mongoose.model('Job', jobSchema);