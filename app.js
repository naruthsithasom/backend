const express = require('express')
const app = express()
const ejs = require('ejs')
const bodyParser = express.urlencoded({extended: false})

app.engine('html',ejs.renderFile)
const jobs = [
  {id:1 , position: "software engineering", res:['sdf','xcv']},
  {id:2 , position: "software engineering", res:['sdf','xcv']},
  {id:3 , position: "software engineering", res:['sdf','xcv']},
]

app.get('/insert', insertJobs)
app.post('/insert', bodyParser ,saveJobs)

app.get('/api/jobs', (req, res) => {
  res.header('Access-Control-Allow-Origin','application/json')
   res.send(jobs)
})

app.listen(8000, () => {
  console.log('Server is up on port: 8000')
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