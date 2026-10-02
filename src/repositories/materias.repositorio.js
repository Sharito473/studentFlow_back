import { pool } from "../config/database.js";


/** Define los campos de la materia que se pueden utilizar para ordenar los resultados
 * @constant
 * @property {string} id - Campo utilizado para ordenar por identificador de la materia
 * @property {string} nombre - Campo utilizado para ordenar por nombre
 * @property {string} codigo - Campo utilizado para ordenar por código
 * @property {string} creditos - Campo utilizado para ordenar por cantidad de créditos.
 * @property {string} color - Campo utilizado para ordenar por color
 * @property {string} activa - Campo utilizado para ordenar por estado de la materia
 * @property {string} createdAt - Campo utilizado para ordenar por fecha de creación
 * @property {string} updatedAt - Campo utilizado para ordenar por fecha de actualización
 */
const sortableFields = {
  id: "m.id_materia",
  nombre: "m.nombre",
  codigo: "m.codigo",
  creditos: "m.creditos",
  color: "m.color",
  activa: "m.activa",
  createdAt: "m.created_at",
  updatedAt: "m.updated_at"
};


/** Organiza los parámetros de ordenamiento para usarlos en la consulta SQL
 * @function normalizeSort
 * @param {string} sort - Nombre del campo por el cual se desea ordenar
 * @param {string} order - Dirección del ordenamiento, ascendente o descendente
 * @returns {string} - Retorna el nombre de la columna y la dirección del ordenamiento
 */
function normalizeSort(sort, order) {
  const column = sortableFields[sort] || sortableFields.nombre;
  const direction = String(order).toLocaleLowerCase() === "desc" ? "DESC" : "ASC";

  return `${column} ${direction}`
}


/** Convierte los datos obtenidos de la base de datos en un objeto de materia
 * @function mapMateria
 * @param {Object} row - Objeto que contiene los datos de una materia obtenidos de la base de datos
 * @param {number} row.id - Identificador de la materia
 * @param {string} row.nombre - Nombre de la materia
 * @param {string} row.codigo - Código de la materia
 * @param {number} row.creditos - Cantidad de créditos de la materia
 * @param {string} row.color - Color asignado a la materia
 * @param {boolean} row.activa - Indica si la materia está activa
 * @param {Date|string} row.created_at - Fecha de creación de la materia
 * @param {Date|string} row.updated_at - Fecha de última actualización de la materia
 * @returns {Object} Retorna un objeto con la información organizada de la materia.
 */
function mapMateria(row) {
  return{
    id: row.id,
    nombre: row.nombre,
    codigo: row.codigo,
    creditos: row.creditos,
    color: row.color,
    activa: row.activa,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}


/** Obtiene todas las materias pertenecientes a un usuario, aplicando filtros y ordenamiento
 * @async
 * @function findAllByUserId
 * @param {string|number} userId - Identificador del usuario propietario de las materias
 * @param {Object} [filters={}] - Filtros utilizados para consultar las materias
 * @param {boolean} [filters.activa] - Filtra las materias según su estado (activo o inactivo)
 * @param {string} [filters.search] - Texto utilizado para buscar materias por nombre o código.
 * @param {string} [filters.sort] - Campo por el cual se ordenan los resultados
 * @param {string} [filters.order] - Dirección del ordenamiento (ascendente o descendente)
 * @param {number} [filters.limit] - Cantidad máxima de materias que se muestran por página
 * @param {number} [filters.page] - Número de página que se desea consultar
 * @returns {Promise<Object>} - Retorna un objeto con la lista de materias y el total de registros encontrados
 * @returns {Object[]} returns.materias - Lista de materias encontradas
 * @returns {number} returns.total - Cantidad total de materias que cumplen con los filtros
 */
export async function findAllByUserId(userId, filters = {}) {
  const conditions = ["m.id_usuario = ?"];
  const params = [userId];

  if (typeof filters.activa === "boolean") {
    conditions.push("m.activa = ?");
    params.push(filters.activa ? 1 : 0);
  }

  if (filters.search) {
    conditions.push("(m.nombre LIKE ? OR m.codigo LIKE ?)");
    params.push(`%${filters.search}%`, `%${filters.search}%`);
  }

  const [countRows] = await pool.execute(
    `SELECT COUNT(*) AS total
      FROM materia m
      WHERE ${conditions.join(" AND ")}`,
    params
  );

  const orderBy = normalizeSort(filters.sort, filters.order);
  const limit = filters.limit;
  const offset = (filters.page - 1) * limit;

  const [rows] = await pool.execute(
    `SELECT
        m.id_materia AS id,
        m.id_usuario AS usuarioId,
        m.nombre,
        m.codigo,
        m.color,
        m.creditos,
        m.activa,
        m.created_at AS createdAt,
        m.updated_at AS updatedAt
      FROM materia m
      WHERE ${conditions.join(" AND ")}
      ORDER BY ${orderBy}
      LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  return {
    materias: rows.map(mapMateria),
    total: countRows[0].total
  };
}


/** Busca una materia específica perteneciente a un usuario
 * @async
 * @function findByIdAndUseriId
 * @param {string|number} id - Identificador de la materia
 * @param {string|number} userId - Identificador del usuario propietario de la materia
 * @returns {Promise<Object|null>} Retorna la materia encontrada o null si no existe
 */
export async function findByIdAndUseriId(id, userId) {
    const [rows] = await pool.execute(
    `SELECT
        m.id_materia AS id,
        m.id_usuario AS usuarioId,
        m.nombre,
        m.codigo,
        m.color,
        m.creditos,
        m.activa,
        m.created_at AS createdAt,
        m.updated_at AS updatedAt
      FROM materia m
      WHERE m.id_materia = ? AND m.id_usuario = ?`,
    [id, userId]
  );

  return rows[0] ? mapMateria(rows[0]) : null;
}


/** Verifica si existe una materia con un código determinado para un usuario.
 * @async
 * @function existsByCode
 * @param {string|number} userId - Identificador del usuario propietario de la materia
 * @param {string} codigo - Código de la materia que se desea verificar
 * @param {string|number} [excludeId] - Identificador de la materia que se excluye de la búsqueda
 * @returns {Promise<boolean>} - Retorna true si existe una materia con el código indicado y false si no existe
 */
export async function existsByCode(userId, codigo, excludeId) {
  const params = [userId, codigo];
  let sql = "SELECT 1 FROM materia WHERE id_usuario = ? AND codigo = ?";

  if (excludeId) {
    sql += " AND id_materia <> ?";
    params.push(excludeId);
  }

  sql += " LIMIT 1";

  const [rows] = await pool.execute(sql, params);
  return rows.length > 0;
}


/** Verifica si existe una materia con un nombre determinado para un usuario
 * @async
 * @function existsByName
 * @param {string|number} userId - Identificador del usuario propietario de la materia
 * @param {string} nombre - Nombre de la materia que se desea verificar
 * @param {string|number} [excludeId] - Identificador de la materia que se excluye de la búsqueda
 * @returns {Promise<boolean>} - Retorna true si existe una materia con el nombre indicado y false si no existe
 */
export async function existsByName(userId, nombre, excludeId) {
  const params = [userId, nombre];
  let sql = "SELECT 1 FROM materia WHERE id_usuario = ? AND nombre = ?";

  if (excludeId) {
    sql += " AND id_materia <> ?";
    params.push(excludeId);
  }

  sql += " LIMIT 1";

  const [rows] = await pool.execute(sql, params);
  return rows.length > 0;
}


/** Crea una nueva materia asociada a un usuario
 * @async
 * @function createMateria
 * @param {string|number} userId - Identificador del usuario propietario de la materia
 * @param {Object} materia - Contiene la información de la materia
 * @param {string} materia.nombre - Nombre de la materia
 * @param {string} materia.codigo - Código de la materia
 * @param {string} materia.color - Color asignado a la materia
 * @param {number} materia.creditos - Cantidad de créditos de la materia
 * @param {boolean} materia.activa - Indica si la materia se encuentra activa
 * @returns {Promise<Object|null>} - Retorna la materia creada
 */
export async function createMateria(userId, materia) {
  const [result] = await pool.execute(
    `INSERT INTO materia (id_usuario, nombre, codigo, color, creditos, activa)
      VALUES (?, ?, ?, ?, ?, ?)`,
    [
      userId,
      materia.nombre,
      materia.codigo,
      materia.color,
      materia.creditos,
      materia.activa ? 1 : 0
    ]
  );

  return findByIdAndUserId(result.insertId, userId);
}


/** Actualiza los datos de una materia
 * @async
 * @function patchMateria
 * @param {string|number} id - Identificador de la materia que se desea actualizar
 * @param {string|number} userId - Identificador del usuario propietario de la materia
 * @param {Object} partialMateria - Contiene los datos que se desean modificar
 * @param {string} [partialMateria.nombre] - Nuevo nombre de la materia
 * @param {string} [partialMateria.codigo] - Nuevo código de la materia
 * @param {string} [partialMateria.color] - Nuevo color de la materia
 * @param {number} [partialMateria.creditos] - Nueva cantidad de créditos de la materia
 * @param {boolean} [partialMateria.activa] - Nuevo estado de la materia
 * @returns {Promise<Object|null>} Retorna la materia actualizada
 */
export async function patchMateria(id, userId, partialMateria) {
  const fields = [];
  const params = [];

  if (partialMateria.nombre !== undefined) {
    fields.push("nombre = ?");
    params.push(partialMateria.nombre);
  }

  if (partialMateria.codigo !== undefined) {
    fields.push("codigo = ?");
    params.push(partialMateria.codigo);
  }

  if (partialMateria.color !== undefined) {
    fields.push("color = ?");
    params.push(partialMateria.color);
  }

  if (partialMateria.creditos !== undefined) {
    fields.push("creditos = ?");
    params.push(partialMateria.creditos);
  }

  if (partialMateria.activa !== undefined) {
    fields.push("activa = ?");
    params.push(partialMateria.activa ? 1 : 0);
  }

  if (fields.length === 0) {
    return findByIdAndUserId(id, userId);
  }

  params.push(id, userId);

  await pool.execute(
    `UPDATE materia
      SET ${fields.join(", ")}
      WHERE id_materia = ? AND id_usuario = ?`,
    params
  );

  return findByIdAndUserId(id, userId);
}


/** Elimina una materia perteneciente a un usuario
 * @async
 * @function deleteMateria
 * @param {string|number} id - Identificador de la materia que se desea eliminar
 * @param {string|number} userId - Identificador del usuario propietario de la materia
 * @returns {Promise<boolean>} Retorna true si la materia fue eliminada y false si no se encontró una materia que coincida con el identificador y usuario
 */
export async function deleteMateria(id, userId) {
  const [result] = await pool.execute(
    "DELETE FROM materia WHERE id_materia = ? AND id_usuario = ?",
    [id, userId]
  );

  return result.affectedRows > 0;
}


/** Obtiene todas las tareas asociadas a una materia específica
 * @async
 * @function findTareasByMateriaAndUserId
 * @param {number} id - ID de la materia
 * @param {number} userId - ID del usuario
 * @param {string|number} materiaId - Identificador de la materia que se desea consultar
 * @returns {Promise<Array>} - Retorna una lista con las tareas asociadas a la materia
 */
export async function findTareasByMateriaAndUserId(id, userId) {
  const [rows] = await pool.execute(
    `SELECT 
        t.id_tarea AS id,
        t.id_materia AS materiaId,
        t.titulo,
        t.descripcion,
        t.fecha_entrega AS fechaEntrega,
        t.hora_entrega AS horaEntrega,
        t.prioridad,
        t.estado,
        t.carga_estimada_minutos AS cargaEstimadaMinutos,
        t.porcentaje_avance AS porcentajeAvance,
        t.created_at AS createdAt,
        t.updated_at AS updatedAt
      FROM tarea t
      INNER JOIN materia m ON m.id_materia = t.id_materia
      WHERE m.id_materia = ? AND m.id_usuario = ?`,
    [id, userId]
  );

  return rows;
}


/** Consulta los eventos de una materia asignada a un usuario específico
 * @async
 * @function findEventosByMateriaAndUserId
 * @param {number|string} id - Identificador de la materia
 * @param {number|string} userId - Identificador del usuario propietario.
 * @returns {Promise<Array<Object>>} - Revuelve la lista de los eventos encontrados
 */
export async function findEventosByMateriaAndUserId(id, userId) {
  const [rows] = await pool.execute(
    `SELECT
      e.id_evento AS id,
      e.id_materia AS materiaId,
      e.titulo,
      e.descripcion,
      e.fecha,
      e.hora_inicio AS horaInicio,
      e.hora_fin AS horaFin,
      e.tipo,
      e.created_at AS createdAt,
      e.updated_at AS updatedAt
    FROM evento e
    INNER JOIN materia m ON m.id_materia = e.id_materia
    WHERE m.id_materia = ? AND m.id_usuario = ?`,
    [id, userId]
  );

  return rows;
}