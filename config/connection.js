const mongoose = require('mongoose')
mongoose.connect("mongodb+srv://vebpath:DfyOoEePJ0cfCUrS@vebpath.n0fpsbf.mongodb.net/friendfeed")
.then(function(){
console.log("connected to db")
})
.catch(function(err){

})

module.exports = mongoose.connection