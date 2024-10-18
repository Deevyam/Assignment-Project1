# Rule Engine ATS

A rule engine that processes and evaluates business rules based on Abstract Syntax Trees (AST) and logical operators. Rules are stored in MongoDB with their AST structure, and they can be created, combined, evaluated, and deleted using the API.

## Features

- **Create Rules**: Convert logical expressions into ASTs and store them in MongoDB.
- **Evaluate Rules**: Evaluate stored rules against dynamic input conditions.
- **Combine Rules**: Combine multiple rules using logical `AND` or `OR` operators.
- **Delete Rules**: Delete rules and their corresponding ASTs from the database.
- **View All Rules**: Retrieve all the stored rules and their AST structures.

## Technologies Used

- **Node.js**
- **Express.js**
- **MongoDB**
- **Mongoose** (for schema-based data modeling)

## Getting Started

### Prerequisites

Ensure you have the following installed:

- [Node.js](https://nodejs.org/)
- [MongoDB](https://www.mongodb.com/)

### Installation

1. Clone the repository:

Install dependencies:

 
cd rule-engine-ats
npm install
Set up your MongoDB connection in a .env file:

 
MONGO_URI=Atlus link
PORT=5000
Start the server:

 
npm start


## API Endpoints
1. Create Rule
Endpoint: /api/rules/create-rule

Method: POST

Request Body:

json
```bash
{
  "rule_name": "rule 1",
  "rule": "((age > 30 AND department = 'Sales') OR (age < 25 AND department = 'Marketing')) AND (salary > 50000 OR experience > 5)"
}
Response (Success):

json
```bash
{
  "success": true,
  "message": "Rule created successfully",
  "rule_id": "rule1_id",
  "rule_ast": {...}
}
2. Evaluate Rule
Endpoint: /api/rules/evaluate

Method: POST

Request Body:

json
```bash
{
  "rule_name": "rule 1",
  "conditions": {
    "age": 35,
    "department": "Sales",
    "salary": 60000,
    "experience": 3
  }
}
Response (Success):

json
```bash
{
  "success": true,
  "message": "Rule evaluation successful",
  "result": true
}
3. Combine Rules
Endpoint: /api/rules/combine-rules

Method: POST

Request Body:

json
```bash
{
  "rule_name": "Combined Rules",
  "rules": [
    "age > 30 AND department = 'Sales'",
    "salary > 50000 OR experience > 5"
  ]
}
Response (Success):

json
```bash
{
  "success": true,
  "message": "Rules combined successfully",
  "combined_rule": "(age > 30 AND department = 'Sales') AND (salary > 50000 OR experience > 5)"
}
4. Get All Rules
Endpoint: /api/rules/all-rules

Method: GET

Response (Success):

json
```bash
{
  "success": true,
  "rules": [
    {
      "rule_name": "rule 1",
      "rule_ast": {...}
    },
    {
      "rule_name": "rule 2",
      "rule_ast": {...}
    }
  ]
}


5. Delete Rule
Endpoint: /api/rules/deleteRule

Method: DELETE

Request Body:

json
```bash
{
  "rule_name": "Example Rule"
}
Response (Success):

json
```bash
{
  "message": "Rule deleted successfully"
}


##Project Structure
```bash
.
├── controllers
│   └── ruleController.js       # Handles rule-related API logic
├── models
│   ├── nodeSchema.js           # Schema for AST nodes
│   └── ruleSchema.js           # Schema for rule structure
├── routes
│   └── rulePath.js             # Defines API routes for rule operations
├── index.js                    # Main server file
├── package.json
└── README.md                   # Project documentation


Node Schema
The AST is built using a recursive node structure, where each node is stored as a document in MongoDB.

javascript
```bash
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const nodeSchema = new Schema({
    elemType: Number,  // Operand or Operator type
    value: String,     // Node value (e.g., ">", "age", 30)
    left: { type: Schema.Types.ObjectId, ref: 'Node' },  // Left child node
    right: { type: Schema.Types.ObjectId, ref: 'Node' }  // Right child node
});
module.exports = mongoose.model('Node', nodeSchema);


Rule Schema
Each rule references the root of its AST and stores a human-readable string and a postfix expression.

javascript
```bash
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ruleSchema = new Schema({
    ruleName: String,  // Name of the rule
    rule: String,      // Rule string (e.g., "(age > 30 AND department = 'Sales')")
    root: { type: Schema.Types.ObjectId, ref: 'Node' },  // Root node of the AST
    postfixExpr: [String]  // Postfix notation for debugging
});

module.exports = mongoose.model('Rule', ruleSchema);
