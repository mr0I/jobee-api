import validator from "validator";


export const sanitizeInput = async (input) => {
    return validator.escape(input);
}

export const sanitizeObject = async (obj) => {
    let sanitizedObj = {};
    Object.entries(obj).forEach((entry) => {
        sanitizedObj[entry[0]] = validator.escape(entry[1]);
    })

    return sanitizedObj;
}