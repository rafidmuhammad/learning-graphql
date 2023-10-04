const {graphql, buildSchema} = require('graphql');

let schema = buildSchema(`
    type Query{
            hello:String
    }
`)

let rootValue = {
    hello: () => {
        return "Hello world!"
    },
}

graphql({
    schema,
    source:"{hello}",
    rootValue,
}).then(response => {console.log(response);});