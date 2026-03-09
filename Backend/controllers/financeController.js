const db = require("../config/db");

exports.forwardToManager = async(req,res)=>{

const {id} = req.params;
const {finance_comment} = req.body;

await db.query(
`UPDATE requests
SET finance_comment=?, status='sent_to_manager'
WHERE id=?`,
[finance_comment,id]
);

res.json({message:"Request forwarded to manager"});

};