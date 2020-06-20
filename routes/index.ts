import { check, validationResult } from "express-validator";
import express from "express";

export const ROUTER = express.Router();

/* GET home page. */
ROUTER.get('/', function (req, res, next) {
    res.render('index', { title: 'Express' });
});