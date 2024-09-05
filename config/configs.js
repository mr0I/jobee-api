import joi from "joi";
import dotenv from "dotenv";
dotenv.config({ path: ".env" });

const envSchema = joi
  .object({
    DB_URL: joi.string().required(),
    PORT: joi.number().positive().default(3000),
  })
  .unknown();
const { value, error } = envSchema.validate(process.env);
if (error) console.error(`envSchema error: ${error}`);
const { DB_URL, PORT } = value;

export { DB_URL, PORT };
