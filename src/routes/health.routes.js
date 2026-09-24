import { Router } from "express";
import { getHealth } from "../controllers/health.controller.js";

const router = Router(); // Crea las rutas relacionadas con el estado de la aplicación

router.get("/", getHealth); //Define la ruta GET principal para consultar el estado de la aplicación

export default router;