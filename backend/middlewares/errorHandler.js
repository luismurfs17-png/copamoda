function notFound(req, res) {
  res.status(404).json({
    success: false,
    data: null,
    message: "Ruta no encontrada",
  });
}

function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    next(err);
    return;
  }

  let status = err.statusCode || 500;
  let message = err.message || "Error interno";
  let data = null;

  if (err.isJoi) {
    status = 400;
    message = "Validacion fallida";
  }

  if (err.code === "SQLITE_CONSTRAINT" || err.code === "ER_DUP_ENTRY") {
    status = 409;
    message = "Registro duplicado";
  }

  if (err.code === "ER_ROW_IS_REFERENCED_2") {
    status = 409;
    message = "No se puede eliminar o modificar por relaciones activas";
  }

  res.status(status).json({
    success: false,
    message,
    data,
  });
}

module.exports = {
  notFound,
  errorHandler,
};
