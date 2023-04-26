# coffee

A simple Node Express server with testing provided by Supertest and Tape.

This should have a MongoDB server running from the local `./data` directory,

    $ mongod --dbpath=./data

Reload the test data into MongoDB, and perform spatial indexing by running,

    $ node prep
    
Run some tests using,

    $ npm test
    
Starting the server is done by saying,

    $ npm start
