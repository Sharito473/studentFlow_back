import * as materiasRepository from "../repositories/materias.repositorio.js";
import { HttpError } from "../utils/http-error.js";


/** Obtiene las materias de un usuario aplicando filtros
 * @async
 * @function listMaterias
 * @param {string|number} userId - Identificador del usuario propietario de las materias
 * @param {Object} filters - Filtros para consultar las materias
 * @param {number} filters.page - Número de página que se desea consultar
 * @param {number} filters.limit - Cantidad de materias que se muestran por página
 * @returns {Promise<Object>} - Devuelve las materias junto con la información
 */
export async function listMaterias(userId, filters){
    const { materias, total } = await materiasRepository.findAllByUserId(userId, filters);
    return {
    data: materias,
    meta: {
        page: filters.page,
        limit: filters.limit,
        total,
        pages: Math.ceil(total / filters.limit)
    }
    };
}


/** Obtiene una materia específica perteneciente a un usuario
 * @async
 * @function getMateriaById
 * @param {string|number} id - Identificador de la materia
 * @param {string|number} userId - Identificador del usuario propietario de la materia
 * @returns {Promise<Object>} - Retorna la materia encontrada
 * @throws {HttpError} - Código 404 (MATERIA_NOT_FOUND) si la materia no existe o no pertenece al usuario indicado
 */
export async function getMateriaById(id, userId) {
    const materia = await materiasRepository.findByIdAndUseriId(id, userId)
    if(!materia){
        throw new HttpError(404, "MATERIA_NOT_FOUND", "La materia no fue encontrada");
    }
    return materia;
}


/** Crea una nueva materia para un usuario.
 * @async
 * @function createMateria
 * @param {string|number} userId - Identificador del usuario propietario de la materia
 * @param {Object} materia - Datos de la materia que se desea crear
 * @returns {Promise<Object>} Retorna la materia creada
 */
export async function createMateria(userId, materia) {
    await ensureUniqueFields(userId, materia);
    return materiasRepository.createMateria(userId, materia);
}

/** Valida que el código y el nombre de una materia sean únicos para un usuario específico
* @async
* @function ensureUniqueFields
* @param {string|number} userId - Identificador único del usuario propietario de la materia
* @param {Object} materia - Contiene los datos de la materia a validar
* @param {string} [materia.codigo] - Código identificador de la materia (opcional)
* @param {string} [materia.nombre] - Nombre de la materia (opcional)
* @param {string|number} [excludeId] - ID de una materia existente a excluir de la validación (útil en actualizaciones)
* @returns {Promise} - No retorna ningún valor si las validaciones son exitosas
* @throws {HttpError} - Código 409 (DUPLICATE_CODE) si el código ya está registrado para el usuario
*/
async function ensureUniqueFields(userId, materia, excludeId) {
  if (materia.codigo) {
    const duplicatedCode = await materiasRepository.existsByCode(userId, materia.codigo, excludeId);

    if (duplicatedCode) {
      throw new HttpError(409, "DUPLICATE_CODE", "Ya existe una materia con ese código.");
    }
  }

  if (materia.nombre) {
    const duplicatedName = await materiasRepository.existsByName(userId, materia.nombre, excludeId);

    if (duplicatedName) {
      throw new HttpError(409, "DUPLICATE_NAME", "Ya existe una materia con ese nombre.");
    }
  }
}


/** Reemplaza los datos de una materia existente.
 * @async
 * @function replaceMateria
 * @param {string|number} id - Identificador de la materia que se desea reemplazar
 * @param {string|number} userId - Identificador del usuario propietario de la materia
 * @param {Object} materia - Nuevos datos de la materia
 * @returns {Promise<Object>} - Retorna la materia actualizada
 * @throws {HttpError} Código 404 (MATERIA_NOT_FOUND) si la materia no existe
 * @throws {HttpError} Código 409 (DUPLICATE_CODE) si el código ya está registrado
 * @throws {HttpError} Código 409 (DUPLICATE_NAME) si el nombre ya está registrado
 */
export async function replaceMateria(id, userId, materia) {
  await getMateriaById(id, userId);
  await ensureUniqueFields(userId, materia, id);
  return materiasRepository.updateMateria(id, userId, materia);
}


/** Actualiza los datos de una materia existente
 * @async
 * @function updateMateria
 * @param {string|number} id - Identificador de la materia que se desea actualizar
 * @param {string|number} userId - Identificador del usuario propietario de la materia
 * @param {Object} partialMateria - Datos de la materia que se desean modificar
 * @param {string} [partialMateria.codigo] - Nuevo código de la materia
 * @param {string} [partialMateria.nombre] - Nuevo nombre de la materia
 * @returns {Promise<Object>} - Retorna la materia con los datos actualizados
 * @throws {HttpError} Código 404 (MATERIA_NOT_FOUND) si la materia no existe
 * @throws {HttpError} Código 409 (DUPLICATE_CODE) si el código ya está registrado
 * @throws {HttpError} Código 409 (DUPLICATE_NAME) si el nombre ya está registrado
 */
export async function updateMateria(id, userId, partialMateria) {
  await getMateriaById(id, userId);
  await ensureUniqueFields(userId, partialMateria, id);
  return materiasRepository.patchMateria(id, userId, partialMateria);
}


/** Elimina una materia perteneciente a un usuario
 * @async
 * @function removeMateria
 * @param {string|number} id - Identificador de la materia que se desea eliminar
 * @param {string|number} userId - Identificador del usuario propietario de la materia
 * @returns {Promise<void>}  No retorna ningún valor si la materia es eliminada correctamente
 * @throws {HttpError} Código 404 (MATERIA_NOT_FOUND) si la materia no existe
 */
export async function removeMateria(id, userId) {
  await getMateriaById(id, userId);
  await materiasRepository.deleteMateria(id, userId);
}

/** Obtiene las tareas asociadas a una materia perteneciente a un usuario
 * @async
 * @function getTareasByMateriaId
 * @param {string|number} materiaId - Identificador de la materia que se desea consultar
 * @param {string|number} userId - Identificador del usuario propietario de la materia
 * @returns {Promise<Object>} Retorna las tareas de la materia o un mensaje cuando no tiene tareas asignadas
 * @returns {string} [returns.message] - Mensaje que indica que la materia no tiene tareas asignadas
 * @returns {Array} returns.data - Lista de tareas asociadas a la materia
 * @throws {HttpError} Código 404 (MATERIA_NOT_FOUND) si la materia no existe o no pertenece al usuario
 */
export async function getTareasByMateriaId(materiaId, userId) {
  await getMateriaById(materiaId, userId);

  const tareas = await materiasRepository.getTareasByMateriaId(materiaId);

  if (tareas.length === 0) {
    return {
      message: "La materia no tiene tareas asignadas.",
      data: []
    };
  }

  return {
    data: tareas
  };
}