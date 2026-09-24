/** Envía una respuesta HTTP indicando que la operación se realizó correctamente
 * @function sendSuccess
 * @param {Object} response - La respuesta que se le va a devolver al usuario
 * @param {Object|Array} data - Información que se enviará en la respuesta
 * @param {number} [statusCode=200] - Código de estado HTTP de la respuesta
 * @param {Object} [meta] - Información adicional de la respuesta
 * @returns {Object} - Retorna la respuesta HTTP en formato JSON con los datos enviados.
 */
export function sendSuccess(response, data, statusCode = 200, meta) { 
  const payload = {
    success: true,
    data
  };

  if (meta) {
    payload.meta = meta;
  }

  return response.status(statusCode).json(payload);
}


/** Envía una respuesta sin contenido cuando una operación se realiza correctamente
 * @function sendNoContent
 * @param {Object} response - La respuesta que se le va a devolver al usuario
 * @returns {Object} - Retorna una respuesta HTTP con código de estado 204 y sin contenido
 */
export function sendNoContent(response) {
  return response.status(204).send();
}