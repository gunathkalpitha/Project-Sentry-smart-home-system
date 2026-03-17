const Joi = require("joi");

// Reusable validation middleware factory
function validate(schema) {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
      // Log the failing payload and detailed messages to help debug client 400s
      try {
        console.warn('Validation failed for route', req.originalUrl, 'payload:', JSON.stringify(req.body));
      } catch (e) {
        console.warn('Validation failed (payload not serializable) for route', req.originalUrl);
      }
      console.warn('Validation errors:', error.details.map(d => d.message));
      return res.status(400).json({
        errors: error.details.map(d => d.message),
      });
    }
    next();
  };
}


// Device schema
const deviceSchema = Joi.object({
  name: Joi.string().min(3).max(100).required(),
  // Allow espId as either a plain alphanumeric id or a MAC address with colons
  espId: Joi.alternatives().try(
    Joi.string().alphanum().min(3).max(50),
    Joi.string().pattern(/^([0-9A-Fa-f]{2}:){5}[0-9A-Fa-f]{2}$/)
  ).required(),
  // Frontend sends `room` and `type`; ensure they exist
  type: Joi.string().valid('outlet', 'switch').required(),
  room: Joi.string().min(1).max(50).required(),
  maxCurrent: Joi.number().min(0).optional(),
  maxVoltage: Joi.number().min(0).optional(),
});
const validateDevice = validate(deviceSchema);

// User registration schema
const userSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(128).required(),
  phone: Joi.string().min(7).max(20).optional(),
});
const validateUser = validate(userSchema);

// User login schema
const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(128).required(),
});
const validateLogin = validate(loginSchema);


// Raspberry Pi registration schema
const raspberryPiSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  piId: Joi.string().min(3).max(100).required(),
  ipAddress: Joi.string().ip({ version: ['ipv4'], cidr: 'forbidden' }).required(),
  macAddress: Joi.string().pattern(/^([0-9A-Fa-f]{2}:){5}[0-9A-Fa-f]{2}$/).required(),
  location: Joi.string().min(2).max(100).required(),
  version: Joi.string().optional(),
  // Optional fields for advanced registration
  connectedESPs: Joi.array().items(Joi.object({
    espId: Joi.string(),
    status: Joi.string(),
    lastSeen: Joi.date(),
    signalStrength: Joi.number()
  })).optional(),
  systemInfo: Joi.object().optional(),
  networkInfo: Joi.object().optional(),
  configuration: Joi.object().optional(),
});
const validateRaspberryPi = validate(raspberryPiSchema);

module.exports = {
  validateDevice,
  validateUser,
  validateLogin,
  validateRaspberryPi,
  validate,
};
