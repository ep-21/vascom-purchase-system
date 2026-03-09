const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.login = async (req,res)=>{

const {email,password} = req.body;

try{

const [rows] = await db.query(
"SELECT * FROM users WHERE email=?",
[email]
);

if(rows.length === 0){
return res.status(404).json({message:"User not found"});
}

const user = rows[0];

const isMatch = await bcrypt.compare(password,user.password);

if(!isMatch){
return res.status(401).json({message:"Invalid credentials"});
}

const token = jwt.sign(
{id:user.id, role:user.role},
process.env.JWT_SECRET,
{expiresIn:"8h"}
);

res.json({
token,
role:user.role,
name:user.name
});

}catch(err){
res.status(500).json(err);
}

};