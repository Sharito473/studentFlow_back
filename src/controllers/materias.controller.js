// Controlador para gestionar las peticiones HTTP relacionadas con las materias del usuario

import { request } from "express";
import * as materiasService from "../services/materias.service.js";
import { sendNoContent, sendSuccess } from "../utils/api-response.js";

import {
    validateCreateMateria,
    validateMateriaId,
    validateMateriaListQuery,
    validatePatchMateria
} from "../validators/materias.validator.js";


/** Obtiene la lista de materias registradas por el usuario
 * @async
 * @function listMaterias
 * @param {Object} request - La información que llega del usuario
 * @param {Object} request.query - Parámetros de consulta para filtrar o listar materias
 * @param {Object} request.user - Información del usuario
 * @param {string|number} request.user.id - Identificador del usuario autenticado
 * @param {Object} response - La respuesta que se le va a devolver al usuario
 * @param {Function} next - Si algo sale mal, esta función se llama para avisarle al manejador de errores (middleware)
 * @returns {Promise<Object>} Retorna la lista de materias del usuario
 * @throws {Error} Envía cualquier error al middleware de manejo de errores
 *  
*/
export async function listMaterias(request, response, next) {
    try{
        const filters = validateMateriaListQuery(request.query);
        const materia = await materiasService.listMaterias(request.user.id, filters);
        return sendSuccess(response, materia);
    } catch(error) {
        return next(error);
    }
} 


/** Obtiene una materia específica a partir de su identificador
 * @async
 * @function getMaterias
 * @param {Object} request - La información que llega del usuario
 * @param {Object} request.params - Datos que se envían en la dirección web para identificar un recurso específico
 * @param {string|number} request.params.id - Identificador de la materia
 * @param {Object} request.user - Información del usuario autenticado
 * @param {string|number} request.user.id - Identificador del usuario
 * @param {Object} response - La respuesta que se le va a devolver al usuario
 * @param {Function} next - Función que envía el error al siguiente middleware(manejo de errores)
 * @returns {Promise<Object>} Retorna la información de la materia solicitada
 * @throws {Error} Envía cualquier error al middleware de manejo de errores
*/
export async function getMaterias(request, response, next) {
    try {
        const id = validateMateriaId(request.params.id)
        const materia = await materiasService.getMateriaById(id, request.user.id);
        return sendSuccess(response, materia)
    } catch (error) {
        return next(error); 
    }
}


/** Crea una nueva materia para el usuario autenticado.
 * @async
 * @function createMateria
 * @param {Object} request - La información que llega del usuario
 * @param {Object} request.body - Datos de la materia a crear
 * @param {Object} request.user - Información del usuario autenticado
 * @param {string|number} request.user.id - Identificador del usuario
 * @param {Object} response - La respuesta que se le va a devolver al usuario
 * @param {Function} next - Función que envía el error al siguiente middleware
 * @returns {Promise<Object>} - Devuelve la materia creada y confirma la operación con el código de estado 201
 * @throws {Error} Envía cualquier error al middleware de manejo de errores
 */
export async function createMateria(request, response, next) {
    try {
        const payload = validateCreateMateria(request.body);
        const materia = await materiasService.createMateria(request.user.id, payload);
        return sendSuccess(response, materia, 201);
    } catch (error) {
        return next(error);
    }
}


/** Reemplaza completamente la información de una materia existente.
 * @async
 * @function replaceMateria
 * @param {Object} request - La información que llega del usuario
 * @param {Object} request.params - Datos para identificar un recurso específico
 * @param {string|number} request.params.id - Identificador de la materia
 * @param {Object} request.body - Nuevos datos de la materia
 * @param {Object} request.user - Información del usuario autenticado
 * @param {string|number} request.user.id - Identificador del usuario
 * @param {Object} response - La respuesta que se le va a devolver al usuario
 * @param {Function} next - Función que envía el error al siguiente middleware
 * @returns {Promise<Object>} Retorna la materia actualizada
 * @throws {Error} Envía cualquier error al middleware de manejo de errores
 */
export async function replaceMateria(request, response, next) {
    try {
        const id = validateMateriaId(request.params.id);
        const payload = validateCreateMateria(request.body);
        const materia = await materiasService.replaceMateria(id, request.user.id, payload);
        return sendSuccess(response, materia);
    } catch (error) {
        return next(error);
    }
}


/** Actualiza la información de una materia existente.
 * @async
 * @function updateMateria
 * @param {Object} request - La información que llega del usuario
 * @param {Object} request.params - Datos para identificar un recurso específico
 * @param {string|number} request.params.id - Identificador de la materia
 * @param {Object} request.body - Datos de la materia que se van a modificar
 * @param {Object} request.user - Información del usuario autenticado
 * @param {string|number} request.user.id - Identificador del usuario
 * @param {Object} response - La respuesta que se le va a devolver al usuario
 * @param {Function} next - Función que envía el error al siguiente middleware
 * @returns {Promise<Object>} Retorna la materia con la información actualizada
 * @throws {Error} Envía cualquier error al middleware de manejo de errores.
 */
export async function updateMateria(request, response, next) {
    try {
        const id = validateMateriaId(request.params.id);
        const payload = validatePatchMateria(request.body);
        const materia = await materiasService.updateMateria(id, request.user.id, payload);
        return sendSuccess(response, materia);
    } catch (error) {
    return next(error);
    } 
}


/** Elimina una materia del usuario autenticado.
 * @async
 * @function deleteMateria
 * @param {Object} request - La información que llega del usuario
 * @param {Object} request.params - Datos para identificar un recurso específico
 * @param {string|number} request.params.id - Identificador de la materia
 * @param {Object} request.user - Información del usuario autenticado
 * @param {string|number} request.user.id - Identificador del usuario
 * @param {Object} response - La respuesta que se le va a devolver al usuario
 * @param {Function} next - Función que envía el error al siguiente middleware
 * @returns {Promise<void>} No retorna contenido cuando la eliminación es exitosa
 * @throws {Error} Envía cualquier error al middleware de manejo de errores
 */
export async function deleteMateria(request, response, next) {
    try {
        const id = validateMateriaId(request.params.id);
        await materiasService.removeMateria(id, request.user.id);
        return sendNoContent(response);
    } catch (error) {
        return next(error);
    }
}


/** Obtiene las tareas asociadas a una materia y envía la respuesta al usuario
 * @async * @function getTareasByMateriaId
 * @param {Object} request - La información que llega del usuario
 * @param {Object} response - La respuesta que se le va a devolver al usuario
 * @param {Function} next - Permite pasar los errores al siguiente middleware
 * @returns {Object} Retorna una respuesta HTTP con las tareas de la materia
 * @throws {Error} Pasa el error al middleware encargado de manejar los errores
 */
export async function getTareasByMateriaId(request, response, next) {
    try {
        const { id } = request.params;
        const userId = request.user.id;

        const result = await materiasService.getTareasByMateriaId(id, userId);

        response.status(200).json({
            success: true,
            ...result
        });
    } catch (error) {
        next(error);
    }
}