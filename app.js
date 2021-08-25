const express = require('express')
const app = express()
const ejs = require('ejs')
const cors = require('cors')
const mysql = require('mysql')
const AWS     =   require('aws-sdk')
const source = { host: 'localhost', database: 'db_kbtginspire', user: 'dean', password:'dean123123'}
var pool = mysql.createPool(source)
const bodyParser = express.urlencoded({extended: false})
/*
kmsClient
*/ 

// app.use((req, res, next) => {
//   res.header('Access-Control-Allow-Origin' ,'*')
//   res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization')
//   res.header('Accept', 'application/json')
//   res.header('Content-Type', 'application/json')
//   res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, OPTIONS')
//   next();
// } )

app.engine('html',ejs.renderFile)
app.use(cors())
app.listen(8000, () => { console.log('Server is up on port: 8000')})


app.get('/insert', insertJobs)
app.post('/insert', bodyParser ,saveJobs)

app.get('/api/jobs', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  pool.query('select * from jobs', function(error, result){
    // let data = []
    //  for(let i in result){
    //   let j = result[i].info
    //   data[i] = JSON.parse(j)
    // }
    console.log(result)
 
     res.send(result)
  })
})

function insertJobs(req, res){
  res.header('Access-Control-Allow-Origin', '*');
  res.render('index.html')
}

 
async function saveJobs(req, res){
  res.header('Access-Control-Allow-Origin', '*');
  let title          =   req.body.title
  let level          =   req.body.level
  let description    =   req.body.description  
  let resp           =   req.body.responsibility
  let reqQua         =   req.body.qualification
  let reqSkill       =   req.body.skill
  let reqLoc         =   req.body.location
  let fresh_grad     =   req.body.fresh_grad == "true" ? true : false 

  let r =   resp.replace(/\r\n/g,"\n").split("\n");
  let q =   reqQua.replace(/\r\n/g,"\n").split("\n");
  let s =   reqSkill.replace(/\r\n/g,"\n").split("\n");
  let l =   reqLoc.replace(/\r\n/g,"\n").split("\n");

  let responsibility = r.join('`')
  let qualification  = q.join('`')
  let skill          = s.join('`')
  let location       = l.join('`')

  let data = [title, level, description, responsibility , qualification, skill, location]
 
  let sql =  'INSERT INTO jobs(title , level, description , responsibility, qualification, skill, location, fresh_grad ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
  
  let dataEncode = []
  let i = 0

  
    while (i < data.length) { 
 
    let encryptMySecureText = await encryptString(data[i]);
    dataEncode[i] = encryptMySecureText
    console.log("\n\nEncrypted string : " + encryptMySecureText);

    let decryptMySecureText = await decryptEncodedstring(dataEncode[i]);
    console.log("\n\nDecrypted string : " + decryptMySecureText);
    console.log("----------------------------------------------------------------------------");
    
    i++;
  }

  dataEncode.push(fresh_grad)

  pool.query(sql, dataEncode, function (error, result) {

    if (error) {

      res.status(400).send({status: 'error', data: error, code: 400 })

    } else {

      res.status(201).send(result)
    }
  })
  
} 

async function encryptString(text) {

  const paramsEncrypt = {
    //keyId
    Plaintext: new Buffer.from(text)
  };

  const encryptResult = await kmsClient.encrypt(paramsEncrypt).promise();
  if (Buffer.isBuffer(encryptResult.CiphertextBlob)) {
    return Buffer.from(encryptResult.CiphertextBlob).toString('base64');
  } else {
    throw new Error('error');
  }
}

async function decryptEncodedstring(encoded) {

  const paramsDecrypt = {
    CiphertextBlob: Buffer.from(encoded, 'base64')
  };

  const decryptResult = await kmsClient.decrypt(paramsDecrypt).promise();
  if (Buffer.isBuffer(decryptResult.Plaintext)) {
    return Buffer.from(decryptResult.Plaintext).toString();
  } else {
    throw new Error('error');
  }
}
