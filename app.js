const express = require('express')
const app = express()
const ejs = require('ejs')
const cors = require('cors')
const bodyParser = express.urlencoded({extended: false})
const jobs = [
  {id:1 , position: "software engineering", level: 'All levels'},
  {id:2 , position: "project manager",  level: 'Junior'},
  {id:3 , position: "tester",  level: 'Middle'},
]


app.engine('html',ejs.renderFile)
app.use(cors())
app.listen(8000, () => { console.log('Server is up on port: 8000')})


app.get('/insert', insertJobs)
app.post('/insert', bodyParser ,saveJobs)

app.get('/api/jobs', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  // res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE'); // If needed
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  res.setHeader('Access-Control-Allow-Credentials', true); 
   res.send(jobs)
})

function insertJobs(req, res){
  res.render('index.html')
}

function saveJobs(req, res){
  let data = [req.body.title, req.body.level, req.body.description, req.body.responsibility]
  if(data){
    res.send(data)
  }
  console.log(data)
}

