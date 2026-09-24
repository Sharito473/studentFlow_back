/** Maneja las rutas que no existen dentro de la aplicación
 * @function notFoundHandler
 * @param {Object} _request - La información que llega del usuario
 * @param {Object} _response - La respuesta que se le va a devolver al usuario
 * @param {Function} next - Función que pasa el error al siguiente middleware
 * @returns {void} No retorna ningún valor directamente
 * @throws {Error} Genera un error con código de estado 404 cuando la ruta no existe
 */
export function notFoundHandler(_request, _response, next) {
  const error = new Error("Ruta no encontrada");
  error.statusCode = 404;
  error.code = "NOT_FOUND";
  next(error);
}


/** Maneja los errores generados durante las peticiones HTTP
 * @function errorHandler
 * @param {Error} error - Error generado durante el procesamiento de la petición
 * @param {Object} _request - La información que llega del usuario
 * @param {Object} response - La respuesta que se le va a devolver al usuario
 * @param {Function} _next - Función que permite continuar con el siguiente middleware
 * @property {boolean} success - Indica que la petición no fue exitosa
 * @property {Object} error - Contiene la información del error (codigo y mensaje)
 * @property {string} error.code - Código que identifica el tipo de error
 * @property {string} error.message - Mensaje que describe el error
 */
export function errorHandler(error, _request, response, _next) {
  const isJsonSyntaxError = error instanceof SyntaxError && error.status === 400 && "body" in error;
  const statusCode = isJsonSyntaxError ? 400 : error.statusCode || 500;
  const code = isJsonSyntaxError
    ? "INVALID_JSON"
    : error.code || (statusCode === 404 ? "NOT_FOUND" : "INTERNAL_ERROR");
  const message = isJsonSyntaxError
    ? "El cuerpo JSON enviado no es válido."
    : error.message || "Error interno del servidor";

  response.status(statusCode).json({
    success: false,
    error: {
      code,
      message
    }
  });
}