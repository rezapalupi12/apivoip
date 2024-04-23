import { Router } from "express";
import { body, param } from "express-validator";
import Controller from "./Controller.js";

const routes = Router({ strict: true });


// Create Data
routes.post(
    "/create",
    [
        body("ip", "Must not be empty.").trim().not().isEmpty().escape(),
        body("status", "Must not be empty.").trim().not().isEmpty().escape(),
        body("time", "Must not be empty.").trim().not().isEmpty().escape(),
        body("durasidown", "Must not be empty.").trim().not().isEmpty().escape(),
    ],
    Controller.validation,
    Controller.create
);




export default routes;