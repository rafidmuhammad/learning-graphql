const express = require("express")
const { graphqlHTTP } = require("express-graphql")
const { buildSchema } = require("graphql")
const RandomDie = require('./randomDie.js');

// Construct a schema, using GraphQL schema language
var schema = buildSchema(`
  type RandomDie{
    numSides : Int!
    rollOnce : Int!
    roll(numRolls : Int!) : [Int]
  }


  type Query {
    quoteOfTheDay : String
    random : Float!
    rollThreeDice: [Int]
    hello: String
    rollDice(numDice: Int!, numSides: Int) : [Int]
    getDie(numSides : Int) : RandomDie
  }
`)

// The root provides a resolver function for each API endpoint
var root = {
  hello: () => {
    return "Hello world!"
  },
  quoteOfTheDay : () => {return Math.random() < 0.5 ? "Take it easy" : "Salvation lies within"},
  random : () => {return Math.random()},
  rollThreeDice : () => {
    return [1,2,3].map(_=> 1 + Math.floor(Math.random() * 6))
  },
  rollDice : ({numDice, numSides}) => {
    let output = [];
    for (let i = 0; i < numDice; i++) {
        output.push(1 + Math.floor(Math.random() * (numSides || 6)));
        
    }
    return output
  }, 
  getDie: ({numSides}) => {
    return new RandomDie(numSides || 6);
  },
}

var app = express()
app.use(
  "/graphql",
  graphqlHTTP({
    schema: schema,
    rootValue: root,
    graphiql: false,
  })
)
app.listen(4000)
console.log("Running a GraphQL API server at http://localhost:4000/graphql")