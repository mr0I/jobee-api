import Joi from "joi";

export const userCreateSchema = Joi.object({
  name: Joi.string().alphanum().min(3).max(30).required(),
  email: Joi.string()
    .email({
      minDomainSegments: 2,
      tlds: {
        allow: ["com", "net"],
      },
    })
    .required(),
  password: Joi.string().pattern(new RegExp("^[a-zA-Z0-9]{3,30}$")),
  // repeat_password: Joi.ref('password'),
  role: Joi.string().optional(),
  // native_attributes: Joi.object({
  //   price: Joi.object({
  //     min: Joi.number().optional(),
  //     max: Joi.number().optional(),
  //   }).optional(),
  //   inStock: Joi.bool().optional(),
  // }).optional(),
  // attributes: Joi.array()
  //   .items(
  //     Joi.object({
  //       key: Joi.string().required(),
  //       range_value: Joi.object({
  //         min: Joi.number().required(),
  //         max: Joi.number().required(),
  //       }).optional(),
  //       value: Joi.alternatives([Joi.number(), Joi.string()]).optional(),
  //     }).required()
  //   )
  //   .optional(),
});
