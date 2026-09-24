/** Asigna temporalmente un usuario a la petición HTTP.
 * @function attachTemporaryUser
 * @param {Object} request - La información que llega del usuario
 * @property {Object} request.user - Información del usuario asignado temporalmente
 * @param {Object} _response - La respuesta que se le va a devolver al usuario
 * @param {Function} next - Función que permite continuar con el siguiente middleware
 */
export function attachTemporaryUser(request, _response, next) {
  request.user = {
    id: 1
  };

  next();
}
