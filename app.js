  const express =   require('express')
  const ejs     =   require('ejs')
  const cors    =   require('cors')
  const mysql   =   require('mysql')
  const AWS     =   require('aws-sdk')
  const app     =   express()

  const source = { host: 'localhost', database: 'db_kbtginspire', user: 'dean', password:'dean123123'}
  const pool   = mysql.createPool(source)
  // const jobs   = require('./json/jobs')
  const jobs   = require('./jobs')
  const bodyParser = express.urlencoded({extended: false})
  
  const kmsClient = new AWS.KMS({
    /**
     * 
     * 
     */
 
  });


  app.engine('html',ejs.renderFile)
  app.use(cors())
  app.listen(8000, () => { console.log('Server is up on port: 8000')})

  app.get('/insert', insertJobs)
  app.post('/insert', bodyParser ,saveJobs)

  app.get('/add-faq', insertFAQ)
  app.post('/add-faq', bodyParser ,saveFAQ)


  app.get('/api/v1/jobs', showEncrypt)
  app.get('/api/v2/jobs', showJobs)

  app.get('/api/faq', showFaq)
  function showFaq(req, res){
    res.header('Access-Control-Allow-Origin', '*')
    pool.query('select * from faq', function(error, data) {
      res.send(data)
    })
  }
  function showJobs(req, res){
    res.header('Access-Control-Allow-Origin', '*');
    res.send(jobs.jobs)
  }
  function insertJobs(req, res){
    res.header('Access-Control-Allow-Origin', '*');
    res.render('index.html')
  }
  function insertFAQ(req, res){
    res.header('Access-Control-Allow-Origin', '*');
    res.render('faq.html')
  }
  function insertJobs(req, res){
    res.header('Access-Control-Allow-Origin', '*');
    res.render('index.html')
  }

  function  showEncrypt(req, res){
    res.header('Access-Control-Allow-Origin', '*');
    pool.query('select * from jobs', async function(error, result){
      if(error == null){
        let data = []
        for(let i in result){
    
          let title          = await decryptEncodedstring(result[i].title)
          let level          = await decryptEncodedstring(result[i].level)
          let description    = await decryptEncodedstring(result[i].description)
          let responsibility = await decryptEncodedstring(result[i].responsibility)
          let qualification  = await decryptEncodedstring(result[i].qualification)
          let skill          = await decryptEncodedstring(result[i].skill)
          let location       = await decryptEncodedstring(result[i].location)
    
          data.push({ id: String(result[i].id) ,title: title, level: level, description: description, responsibility: responsibility, qualification: qualification, skill: skill, location: location, fresh_grad: String(result[i].fresh_grad) })
        }
        console.log(data)
        res.send(data)
      }
    })
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
  function saveFAQ(req, res){
    let data = [req.body.question_en, req.body.question_th, req.body.answer_en, req.body.answer_th]
    let sql = 'INSERT INTO faq (question_en, question_th, answer_en, answer_th) VALUES (?, ?,?,?)'
    // res.send(data)
    // var data = [req.body.email, req.body.password, req.body.name]
    pool.query(sql, data, function(error, result) {

      if (error == null) {
        res.status(201).send({status:'success', data: data})
      } else {
        res.status(400).send({status:'error', data: error})
      }

    })
  }
  async function encryptString(text) {

    const paramsEncrypt = {
    // KeyId:  
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
