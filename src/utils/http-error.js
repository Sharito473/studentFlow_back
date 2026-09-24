/** Representa un error HTTP personalizado para la aplicación
 * @class HttpError
 * @extends Error
 * @param {number} statusCode - Código de estado HTTP del error
 * @param {string} code - Código que identifica el tipo de error
 * @param {string} message - Mensaje descriptivo del error
 */
export class HttpError extends Error {
    constructor(statusCode, code, message) {
    super(message);
    this.name = "HttpError";
    this.statusCode = statusCode;
    this.code = code;
    }
}