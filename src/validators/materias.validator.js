import { HttpError } from "../utils/http-error.js";


/** Convierte un valor a tipo booleano y valida que sea correcto
 * @function parseBoolean
 * @param {boolean|string|undefined} value - Valor que se desea convertir
 * @returns {boolean|undefined} - Retorna true, false o undefined si no se envía un valor
 * @throws {HttpError} - Código 422 (VALIDATION_ERROR) si el valor no es true ni false
 */
function parseBoolean(value) {
  if (value === undefined) {
    return undefined;
  }

  if (typeof value === "boolean") {
    return value;
  }

  const normalized = String(value).toLowerCase();

  if (normalized === "true") {
    return true;
  }

  if (normalized === "false") {
    return false;
  }

  throw new HttpError(422, "VALIDATION_ERROR", "El filtro 'activa' debe ser true o false.");
}


/** Convierte un valor a número entero y valida que sea positivo o cero
 * @function parsePositiveInteger
 * @param {string|number|null|undefined} value - Valor que se desea validar
 * @param {string} fieldName - Nombre del campo que se está validando
 * @returns {number|null} - Retorna el número entero o null si no se envía un valor
 * @throws {HttpError} Código 422 (VALIDATION_ERROR) si el valor no es un entero positivo o cero
 */
function parsePositiveInteger(value, fieldName) {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed < 0) {
    throw new HttpError(422, "VALIDATION_ERROR", `El campo '${fieldName}' debe ser un entero positivo o cero.`);
  }

  return parsed;
}


/** Valida que un campo sea un texto y elimina espacios al inicio y al final
 * @function normalizeString
 * @param {string} value - Valor del campo que se desea validar
 * @param {string} fieldName - Nombre del campo que se está validando
 * @returns {string} Retorna el texto sin espacios adicionales
 * @throws {HttpError} Código 422 (VALIDATION_ERROR) si el campo está vacío o no es un texto
 */
function normalizeString(value, fieldName) {
  if (typeof value !== "string" || value.trim() === "") {
    throw new HttpError(422, "VALIDATION_ERROR", `El campo '${fieldName}' es obligatorio.`);
  }

  return value.trim();
}


/** Valida que el color tenga un formato hexadecimal válido
 * @function validateColor
 * @param {string} color - Color en formato hexadecimal (#RRGGBB)
 * @returns {void} - No retorna ningún valor si el color es válido
 * @throws {HttpError} Código 422 (VALIDATION_ERROR) si el formato del color es incorrecto
 */
function validateColor(color) {
  if (!/^#[0-9A-Fa-f]{6}$/.test(color)) {
    throw new HttpError(422, "VALIDATION_ERROR", "El campo 'color' debe tener formato hexadecimal #RRGGBB.");
  }
}


/** Valida los parámetros de consulta utilizados para listar materias
 * @function validateMateriaListQuery
 * @param {Object} query - Parámetros enviados en la consulta de la petición
 * @param {string} [query.activa] - Estado de la materia (true o false)
 * @param {string} [query.search] - Texto para buscar por nombre o código
 * @param {string} [query.sort] - Campo por el cual se ordenarán los resultados
 * @param {string} [query.order] - Dirección del ordenamiento (ASC o DESC)
 * @param {string|number} [query.page] - Número de página
 * @param {string|number} [query.limit] - Cantidad de registros por página.
 * @returns {Object} Retorna los parámetros de consulta validados
 * @throws {HttpError} Código 422 (VALIDATION_ERROR) si page o limit tienen valores inválidos
 */
export function validateMateriaListQuery(query) {
  const page = Number(query.page ?? 1);
  const limit = Number(query.limit ?? 20);

  if (!Number.isInteger(page) || page < 1) {
    throw new HttpError(422, "VALIDATION_ERROR", "El parámetro 'page' debe ser un entero mayor o igual a 1.");
  }

  if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
    throw new HttpError(422, "VALIDATION_ERROR", "El parámetro 'limit' debe ser un entero entre 1 y 100.");
  }

  return {
    activa: parseBoolean(query.activa),
    search: typeof query.search === "string" ? query.search.trim() : "",
    sort: query.sort,
    order: query.order,
    page,
    limit
  };
}


/** Valida que el identificador de una materia sea un número entero mayor que cero
 * @function validateMateriaId
 * @param {string|number} id - Identificador de la materia
 * @returns {number} Retorna el identificador convertido a número
 * @throws {HttpError} Código 400 (INVALID_ID) si el identificador no es válido
 */
export function validateMateriaId(id) {
  const parsedId = Number(id);

  if (!Number.isInteger(parsedId) || parsedId < 1) {
    throw new HttpError(400, "INVALID_ID", "El identificador de materia no es válido.");
  }

  return parsedId;
}


/** Valida los datos necesarios para crear una nueva materia
 * @function validateCreateMateria
 * @param {Object} body - Información enviada en la petición
 * @param {string} body.nombre - Nombre de la materia
 * @param {string} body.codigo - Código de la materia
 * @param {string} body.color - Color de la materia en formato hexadecimal
 * @param {string|number} body.creditos - Cantidad de créditos de la materia
 * @param {boolean|string} [body.activa] - Estado de la materia
 * @returns {Object} - Retorna los datos validados y normalizados.
 * @throws {HttpError} Código 422 (VALIDATION_ERROR) si algún dato es inválido.
 */
export function validateCreateMateria(body) {
  const nombre = normalizeString(body.nombre, "nombre");
  const codigo = normalizeString(body.codigo, "codigo");
  const color = normalizeString(body.color, "color");
  const creditos = parsePositiveInteger(body.creditos, "creditos");
  const activa = body.activa === undefined ? true : parseBoolean(body.activa);

  validateColor(color);

  return {
    nombre,
    codigo,
    color,
    creditos,
    activa
  };
}


/** Valida los datos enviados para actualizar una materia
 * @function validatePatchMateria
 * @param {Object} body - Información enviada en la petición
 * @param {string} [body.nombre] - Nuevo nombre de la materia
 * @param {string} [body.codigo] - Nuevo código de la materia
 * @param {string} [body.color] - Nuevo color en formato hexadecimal
 * @param {string|number} [body.creditos] - Nueva cantidad de créditos
 * @param {boolean|string} [body.activa] - Nuevo estado de la materia
 * @returns {Object} Retorna los campos válidos para actualizar
 * @throws {HttpError} Código 422 (VALIDATION_ERROR) si no se envían campos válidos o algún dato es incorrecto
 */
export function validatePatchMateria(body) {
  const payload = {};

  if (body.nombre !== undefined) {
    payload.nombre = normalizeString(body.nombre, "nombre");
  }

  if (body.codigo !== undefined) {
    payload.codigo = normalizeString(body.codigo, "codigo");
  }

  if (body.color !== undefined) {
    payload.color = normalizeString(body.color, "color");
    validateColor(payload.color);
  }

  if (body.creditos !== undefined) {
    payload.creditos = parsePositiveInteger(body.creditos, "creditos");
  }

  if (body.activa !== undefined) {
    payload.activa = parseBoolean(body.activa);
  }

  if (Object.keys(payload).length === 0) {
    throw new HttpError(422, "VALIDATION_ERROR", "No se enviaron campos válidos para actualizar.");
  }

  return payload;
}
