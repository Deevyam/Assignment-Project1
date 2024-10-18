const Node = require('../models/nodeSchema');
const Rule = require('../models/ruleSchema');

// Function to delete all nodes associated with the rule's AST
const deleteASTNodes = async (nodeId) => {
    try {
        if (!nodeId) {
            return;
        }

        // Find the node by its ID
        const node = await Node.findById(nodeId).exec();
        if (!node) {
            return;
        }

        // Recursively delete left and right nodes
        await deleteASTNodes(node.left);
        await deleteASTNodes(node.right);

        // Finally, delete the current node
        await Node.findByIdAndDelete(nodeId);
    } catch (error) {
        console.error('Error deleting AST nodes:', error);
        throw new Error('Failed to delete AST nodes');
    }
};

// Controller function to delete a rule by rule name
const deleteRule = async (req, res) => {
    try {
        const { rule_name } = req.body;

        // Validate input
        if (!rule_name || rule_name.length === 0) {
            return res.status(400).send({ error: "rule_name can't be null or empty" });
        }

        // Find the rule by its name
        const rule = await Rule.findOne({ ruleName: rule_name }).exec();
        if (!rule) {
            return res.status(404).send({ error: "Rule not found" });
        }

        // Delete all nodes associated with the AST of the rule
        await deleteASTNodes(rule.root);

        // Delete the rule itself
        await Rule.findByIdAndDelete(rule._id);

        res.status(200).send({ message: 'Rule deleted successfully' });
    } catch (error) {
        console.error('Error deleting rule:', error);
        res.status(500).send({ error: "Internal Server Error" });
    }
};

module.exports = { deleteRule };
