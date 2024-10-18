const Node = require('../models/nodeSchema');
const Rule = require('../models/ruleSchema');

const PRECEDENCE = {
    '(': -1,
    ')': -1,
    'or': 1,
    'and': 1,
    '<': 2,
    '>': 2,
    '=': 2,
    '<=': 2,
    '>=': 2
};

const ElemType = {
    LOGICAL: 1,
    COMPARISON: 2,
    STRING: 3,
    INTEGER: 4,
    VARIABLE: 5
};

class ASTNode {
    constructor(elemType, value, left = null, right = null) {
        this.elemType = elemType;
        this.value = value;
        this.left = left;
        this.right = right;
    }
}

function shuntingYard(rule) {
    const tokens = rule.match(/\w+|[><]=?|AND|OR|\(|\)|=/g);
    const stack = [];
    const postfixExpr = [];

    for (let token of tokens) {
        if (!(token.toLowerCase() in PRECEDENCE)) {
            postfixExpr.push(token);
        } else {
            token = token.toLowerCase();
            if (token === '(') {
                stack.push(token);
            } else if (token === ')') {
                while (stack.length > 0 && stack[stack.length - 1] !== '(') {
                    postfixExpr.push(stack.pop());
                }
                stack.pop(); // remove the '('
            } else {
                while (stack.length > 0 && PRECEDENCE[token] <= PRECEDENCE[stack[stack.length - 1]]) {
                    postfixExpr.push(stack.pop());
                }
                stack.push(token);
            }
        }
    }

    while (stack.length > 0) {
        const popped = stack.pop();
        if (PRECEDENCE[popped] === -1) {
            return []; // Invalid expression
        }
        postfixExpr.push(popped);
    }

    return postfixExpr;
}

async function createAST(postfixExpr) {
    const nodestack = [];
    console.log(`Postfix: ${postfixExpr}`);

    for (let token of postfixExpr) {
        if (!(token in PRECEDENCE)) {
            const node = new Node({ elemType: ElemType.STRING, value: token });
            await node.save();
            nodestack.push(node);
        } else {
            const operand1 = nodestack.pop();
            const operand2 = nodestack.pop();
            const node = new Node({
                elemType: token === 'and' || token === 'or' ? ElemType.LOGICAL : ElemType.COMPARISON,
                value: token,
                left: operand2._id,
                right: operand1._id
            });
            await node.save();
            nodestack.push(node);
        }
    }
    
    console.log(nodestack);
    return nodestack.length === 1 ? nodestack[0] : null;
}

const validateRule = (rule) => {
    const rulePattern = /\w+\s*(<|>|=|<=|>=)\s*('[^']*'|\w+)\s*(AND|OR)\s*\w+\s*(<|>|=|<=|>=)\s*('[^']*'|\w+)/i;
    return rulePattern.test(rule);
};

const combineRules = async (req, res) => {
    try {
        const { rule_name, rules } = req.body;

        // Validate input
        if (!rule_name || rule_name.length <= 0) {
            return res.status(400).send({ error: "Rule name can't be null or empty." });
        }
        if (!rules || !Array.isArray(rules) || rules.length === 0) {
            return res.status(400).send({ error: "Rules must be a non-empty array." });
        }

        // Check for existing rule
        const existingRule = await Rule.findOne({ ruleName: rule_name });
        if (existingRule) {
            return res.status(400).send({ error: "A rule with this name already exists." });
        }

        // Validate each rule
        for (let rule of rules) {
            if (!validateRule(rule)) {
                return res.status(400).send({ error: `Invalid rule format: ${rule}` });
            }
        }

        // Combine the rules into an AST
        let combinedRootNode = null;
        for (let rule of rules) {
            const postfixExpr = shuntingYard(rule);
            const root = await createAST(postfixExpr);

            if (!combinedRootNode) {
                combinedRootNode = root;
            } else {
                const combinedNode = new Node({
                    elemType: ElemType.LOGICAL,
                    value: 'and',
                    left: combinedRootNode._id,
                    right: root._id
                });
                await combinedNode.save();
                combinedRootNode = combinedNode;
            }
        }

        if (combinedRootNode) {
            const newRule = new Rule({
                ruleName: rule_name,
                rule: rules.join(' AND '),
                root: combinedRootNode._id,
                postfixExpr: [] // Combined rule doesn't have a single postfix expression
            });
            await newRule.save();
            res.status(201).send({ message: 'Rules combined successfully', rule: newRule });
        } else {
            res.status(500).send({ error: 'Failed to combine rules into AST.' });
        }
    } catch (error) {
        console.error('Error combining rules:', error);
        res.status(500).send({ error: "Internal Server Error", details: error.message });
    }
};

module.exports = { combineRules };
