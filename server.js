/* eslint-disable no-console */
const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql');
const crypto = require('crypto');
const RandomDie = require('./randomDie');
const Message = require('./message');

// Construct a schema, using GraphQL schema language
const schema = buildSchema(`
  type RandomDie{
    numSides : Int!
    rollOnce : Int!
    roll(numRolls : Int!) : [Int]
  }

  type Message{
    id : ID!
    content : String
    author : String
  }

  input MessageInput{
    content : String
    author : String
  }

  type Mutation{
    createMessage(input : MessageInput) : Message
    updateMessage(id:ID!, input : MessageInput) : Message
  }


  type Query {
    quoteOfTheDay : String
    random : Float!
    rollThreeDice: [Int]
    hello: String
    rollDice(numDice: Int!, numSides: Int) : [Int]
    getDie(numSides : Int) : RandomDie
    getMessage(id:ID!) : Message
  }
`);

const fakeDatabase = {};

// The root provides a resolver function for each API endpoint
const root = {
  hello: () => 'Hello world!',
  //
  quoteOfTheDay: () => (Math.random() < 0.5 ? 'Take it easy' : 'Salvation lies within'),
  //
  random: () => Math.random(),
  //
  rollThreeDice: () => [1, 2, 3].map(() => 1 + Math.floor(Math.random() * 6)),
  //
  rollDice: ({ numDice, numSides }) => {
    const output = [];
    for (let i = 0; i < numDice; i += 1) {
      output.push(1 + Math.floor(Math.random() * (numSides || 6)));
    }
    return output;
  },
  //
  getDie: ({ numSides }) => new RandomDie(numSides || 6),
  //
  getMessage: ({ id }) => {
    if (!fakeDatabase[id]) {
      throw new Error(`No message exist for id:${id}`);
    }
    return new Message(id, fakeDatabase[id]);
  },
  //
  createMessage: ({ input }) => {
    const id = crypto.randomBytes(10).toString('hex');
    fakeDatabase[id] = input;
    return new Message(id, input);
  },
  //
  updateMessage: ({ id, input }) => {
    if (!fakeDatabase[id]) {
      throw new Error(`No message exist for id:${id}`);
    }
    fakeDatabase[id] = input;
    return new Message(id, input);
  },
};

const app = express();
app.use(
  '/graphql',
  graphqlHTTP({
    schema,
    rootValue: root,
    graphiql: false,
  }),
);
app.listen(4000);
console.log('Running a GraphQL API server at http://localhost:4000/graphql');
