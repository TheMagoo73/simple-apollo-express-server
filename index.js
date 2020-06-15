const port = process.env.PORT || 9000
const {relaySort, relayPager} = require('super-relay')

const express = require('express')
const { ApolloServer, gql } = require('apollo-server-express')
const voyagerMiddleware = require('graphql-voyager/middleware').express

const authors = [
    { name: "John"},
    { name: "Brian"}
]

const posts = [
    { id: 1, name: "The Power of Foo!", content: "Foo is awesome.", author: "John"},
    { id: 2, name: "Don't use Foo!", content: "Foo sucks, Bar is so much better.", author: "Brian"},
    { id: 3, name: "Brian is an idiot!", content: "Everyone knows that Foo is the best.", author: "John"},
]

const comments = [
    { poster: "Brian", comment: "This is total rubbish :(", post: 1}
]

/*
const typeDefs = gql`
    type Comment{
        poster: String!
        comment: String!
        post: Int!
    }

    type Post{
        id: Int!
        name: String!
        content: String!
        author: Author!    
    }

    type Author{
        name: String!
        posts: [Post]
    }

    type Query{
        author(name: String!): Author
    }

    input inputAuthor{
        name: String!
    }

    type Mutation{
        addAuthor(newAuthor: inputAuthor!): Author!
    }
`
*/

const typeDefs = gql`
    input Sort {
        fields:[String!]!
        order: [String]
    }

    type Comment{
        poster: String!
        comment: String!
        post: Int!
    }

    type Post{
        id: Int!
        name: String!
        content: String!
        author: Author!
    }

    type Author{
        name: String!
        allPosts(
            limit: Int
            skip: Int
            sort: Sort
        ): AuthorPostsConnection
    }

    type PageInfo{
        hasNextPage: Boolean
    }

    type AuthorPostsConnection{
        edges: [AuthorPostsEdge]
        pageInfo: PageInfo
    }

    type AuthorPostsEdge{
        node: Post
        next: Post
        previous: Post   
    }

    type Query{
        author(name: String!): Author
    }
`

const resolvers = {
    Query: {
        author: (parent, args) => authors.find(a => a.name === args.name),
    },
    Author: {
        allPosts: (parent, args) => {
            const authorPosts = posts.filter(p => p.author === parent.name)

            const {skip, limit, sort} = args

            if(sort) {
                services = relaySort(services, {sort})
            }

            const pages = relayPager(authorPosts, {skip, limit, addPaging: true})

            return {
                edges: pages.data,
                pageInfo: pages.pageInfo
            }  
        },
    },
    Post: {
        author: (parent, args) => authors.find(a => a.name === parent.author)
    }
}


const server = new ApolloServer({ typeDefs, resolvers})

const app = express()

server.applyMiddleware({ app })

app.use('/visualise', voyagerMiddleware({ endpointUrl: '/graphql' }))

app.listen({ port: port }, (err) => {
    if(err){
        console.log(err.message)
    } else {
        console.log(`Your API is running on port ${port}`)
    }
})