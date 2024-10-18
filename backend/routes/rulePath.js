const express = require('express');
const router = express.Router();
const { createRule } = require('../controllers/createRule');
const { combineRules } = require('../controllers/combineRule');
const { evaluateRule } = require('../controllers/evaluateRule');
const getAllRules = require('../controllers/rules');
const { deleteRule } = require('../controllers/deleteRule');

router.post('/create-rule', createRule);// create a new rule
router.post('/combine-rules', combineRules);//  combine rules
router.post('/evaluate', evaluateRule);// evaluate a rule
router.get('/all-rules', getAllRules);// get all rules
router.delete('/deleteRule', deleteRule);
module.exports = router;
