import { Router } from "express"

import {
    listMaterias,
    getMaterias,
    createMateria,
    replaceMateria,
    updateMateria,
    deleteMateria,
    getTareasByMateriaId
}from "../controllers/materias.controller.js"


/**
 * Crea las rutas relacionadas con las materias
 * @constant
 * @type {Router}
 */
const router = Router();

router.get("/", listMaterias); //Obtiene la lista de materias 
router.get("/:id", getMaterias) // Obtiene una materia específica
router.post("/", createMateria); // Crea una nueva materia
router.put("/:id", replaceMateria); //Reemplaza una materia
router.patch("/:id", updateMateria); // Actualiza una materia
router.delete("/:id", deleteMateria); // Elimina una materia
router.get("/:id/tareas", getTareasByMateriaId); //Obtiene las tareas pertenecientes a una materia específica

export default router;