var express = require('express');
var cors = require('cors');
var bodyParser = require('body-parser');
const request = require('request');
var http = require('http')

var app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json())

app.use(cors())

app.use(express.static('public'))


var n_request_done = 0
var data = {}

app.get('/',function(req,res){
    res.sendFile('public/index.html')
})

app.post("/allinfo", function(req,res){
    request('https://galaxylifereborn.com/api/userinfo?u='+ req.body.uName +'&t=i', (err,response,body) => {
        if (err) {return console.log(err)}
        n_request_done ++
        if (body){
            data.userID = body
            getAllinfoFromApi(body, req.body.uName, res, 6)
        } else {
            request('https://galaxylifereborn.com/api/userinfo?u='+ req.body.uName +'&t=n', (err, response2, body)=> {
                if (err) {return console.log(err)}
                n_request_done ++
                if (body) {
                    data.userName = body
                    getAllinfoFromApi(req.body.uName, body, res, 7)
                } else {
                    data.error = 'userNotFound'
                    res.json(data)
                    n_request_done = 0
                    data = {}
                }
            })
        }
        
    })
})

/*app.post("/friend", function(req,res){
    var data = []
    var nrequest = 0
    var test = JSON.parse(req.body.test)
    test.forEach(element => {
        request('https://galaxylifereborn.com/api/userinfo?u='+ element +'&t=n', (err, response, body) => {
            if (err) {return console.log(err)}
            nrequest ++
            if (body) {
                data.push(body)
                if (nrequest === test.length) {
                    res.json(data)
                    data = []
                    nrequest = 0
                }
            }
        })
        
    })
})*/

function checkNumberOfRequest(ntotalrequest, res){
    if (n_request_done === ntotalrequest){
        res.json(data)
        n_request_done = 0
        data = {}
    }
}
function getAllinfoFromApi(userID, username, res, ntotalrequest){
    request('https://galaxylifereborn.com/api/userinfo?u='+ userID +'&t=t', (err, response, body) => {
        if (err) {return console.log(err)}
        n_request_done ++
        if (body){
            data.role = body  
        }
        checkNumberOfRequest(ntotalrequest, res)
    })
    request('https://galaxylifereborn.com/api/userinfo?u='+ userID +'&t=f_new', (err, response, body) => {
        if (err) {return console.log(err)}
        n_request_done ++
        if (body) {
            data.friends = body
        } else {
            data.friends = 'noFriend'
        }
        checkNumberOfRequest(ntotalrequest, res)
    })
    request('https://galaxylifereborn.com/api/userinfo?u='+ userID +'&t=r', (err, response, body) => {
        if (err) {return console.log(err)}
        n_request_done ++
        if (body) {
            data.inRequest = body
        } else {
            data.inRequest = 'noInRequest'
        }
        checkNumberOfRequest(ntotalrequest, res)
    })
    request('https://galaxylifereborn.com/api/userinfo?u='+ userID +'&t=s', (err, response, body) => {
        if (err) {return console.log(err)}
        n_request_done ++
        if (body) {
            data.outRequest = body
        } else {
            data.outRequest = 'noOutRequest'
        }
        checkNumberOfRequest(ntotalrequest, res)
    })
    request('https://galaxylifereborn.com/api/userinfo?u='+ userID +'&t=c', (err, response, body) => {
        if (err) {return console.log(err)}
        var temp = body.split('-')
        var date = new Date(temp[0], temp[1]-1, temp[2])
        const options = { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' }
        var date = date.toLocaleDateString('en-EN', options)
        n_request_done ++
        data.createdAt = date
        checkNumberOfRequest(ntotalrequest, res)
    })
    var profilelink = 'https://galaxylifereborn.com/profile/' + username
    data.profileLink = profilelink
    var pfp = 'https://galaxylifereborn.com/uploads/avatars/'+ userID + '.png?t='+ Math.round(new Date().getTime() / 1000)
    data.pfp = pfp
}
app.listen(5000)