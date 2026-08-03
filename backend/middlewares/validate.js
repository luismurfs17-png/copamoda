function validateBody(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body);
    if (error) {
      next(error);
      return;
    }

    req.body = value;
    next();
  };
}

function validateParams(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.params);
    if (error) {
      next(error);
      return;
    }

    req.params = value;
    next();
  };
}

function validateQuery(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.query);
    if (error) {
      next(error);
      return;
    }

    req.query = value;
    next();
  };
}

module.exports = {
  validateBody,
  validateParams,
  validateQuery,
};
