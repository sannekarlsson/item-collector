'use strict'

//================================================
// Test Database -- start with mongod
//================================================
const mongoose = require('mongoose')
const mongoDB = process.env.TEST_API_DB || 'mongodb://localhost:27017/test-api'
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true })
    .catch(err => console.error(err))


const app = require('../app')
const request = require('supertest')

const itemsApi = '/api/items'
const Item = require('../models/Item')

describe('Api test', () => {
    test('has a module', () => {
        expect(app).toBeDefined()
    })

    let server

    beforeAll(() => {
        server = app.listen(5002)
    })

    afterEach(async () => {
        await Item.deleteMany({})
    })

    afterAll(async () => {
        await mongoose.connection.close()
        await server.close()
    })

    // Assert the endpoints exist and function as expected
    describe('Item routes test', () => {

        //================================================
        //  GET /api/items
        //================================================
        describe(`GET ${itemsApi}`, () => {
            test('lists items', async () => {
                await request(server)
                    .get(itemsApi)
                    .expect(200)
            })

            test('returns an array', async () => {
                expect.assertions(1)
                const response = await request(server)
                    .get(itemsApi)
                    .expect(200)

                expect(response.body).toEqual(expect.any(Array))
            })
        })

        //================================================
        //  POST /api/items
        //================================================
        describe(`POST ${itemsApi}`, () => {
            test('creates an item', async () => {
                await request(server)
                    .post(itemsApi)
                    .send({ name: 'Test Apple' })
                    .expect(200)
            })

            test('created item has properties name, created and _id', async () => {
                expect.assertions(3)
                const { body } = await request(server)
                    .post(itemsApi)
                    .send({ name: 'Test Orange' })
                    .expect(200)

                expect(body).toHaveProperty('name')
                expect(body).toHaveProperty('created')
                expect(body).toHaveProperty('_id')
            })

            test('fails creating an empty item', async () => {
                await request(server)
                    .post(itemsApi)
                    .send({})
                    .expect(422)
            })

            test('fails creating an item with incorrect property', async () => {
                await request(server)
                    .post(itemsApi)
                    .send({ testOther: 1 })
                    .expect(422)
            })

            test('fails creating an item where name is only white spaces', async () => {
                await request(server)
                    .post(itemsApi)
                    .send({ name: '     ' })
                    .expect(422)
            })

            test('escapes tags', async () => {
                expect.assertions(2)

                const { body } = await request(server)
                    .post(itemsApi)
                    .send({ name: '<img src=n onerror="alert(\'XSS\')">' })
                    .expect(200)

                expect(body).toHaveProperty('name')
                expect(body.name).toEqual('&lt;img src=n onerror=&quot;alert(&#x27;XSS&#x27;)&quot;&gt;')
            })
        })

        //================================================
        //  DELETE /api/items
        //================================================
        describe(`DELETE ${itemsApi}`, () => {
            test('deletes all items', async () => {

                expect.assertions(2)

                const items = ['Apple', 'Orange', 'Pineapple'];

                // Add some items
                // https://stackoverflow.com/a/37576787
                await Promise.all(items.map(async (item) => {
                    await request(server)
                        .post(itemsApi)
                        .send({ name: item })
                        .expect(200)
                }))

                // Delete all items
                const { body } = await request(server)
                    .delete(itemsApi)
                    .expect(200)

                expect(body).toHaveProperty('deletedCount')
                expect(body.deletedCount).toEqual(items.length)
            })

            test('deletes zero items', async () => {

                await request(server)
                    .delete(itemsApi)
                    .expect(404)
            })
        })

        //================================================
        //  GET /api/items/:id
        //================================================
        describe(`GET ${itemsApi}/:id`, () => {
            test('get an existing item by id', async () => {
                expect.assertions(4)
                const name = 'Test GET item'
                // Create the item
                const newItem = await request(server)
                    .post(itemsApi)
                    .send({ name })
                    .expect(200)

                // Get the item by its id
                const { body } = await request(server)
                    .get(`${itemsApi}/${newItem.body._id}`)
                    .expect(200)

                expect(body).toHaveProperty('name')
                expect(body.name).toEqual(name)
                expect(body).toHaveProperty('created')
                expect(body).toHaveProperty('_id')
            })

            test('fails getting a non-existent item', async () => {
                await request(server)
                    .get(`${itemsApi}/5cf6c217295cfd2f44477221`)
                    .expect(404)
            })
        })

        //================================================
        //  PUT /api/items/:id
        //================================================
        describe(`PUT ${itemsApi}/:id`, () => {
            test('updates an item by id', async () => {
                expect.assertions(1)
                const newItem = await request(server)
                    .post(itemsApi)
                    .send({ name: 'First name' })
                    .expect(200)

                const newName = 'New name'
                const { body } = await request(server)
                    .put(`${itemsApi}/${newItem.body._id}`)
                    .send({ name: newName })
                    .expect(200)

                expect(body.name).toEqual(newName)
            })

            test('fails updating a non-existent item', async () => {
                await request(server)
                    .put(`${itemsApi}/5ccb1fac5572f3b82688dc40`)
                    .send({ name: 'New name' })
                    .expect(404)
            })

            test('fails updating an invalid id', async () => {
                await request(server)
                    .put(itemsApi + '/not an id')
                    .send({ name: 'Invalid id' })
                    .expect(400)
            })

            test('fails updating to an empty string', async () => {
                const newItem = await request(server)
                    .post(itemsApi)
                    .send({ name: 'Orange' })
                    .expect(200)

                await request(server)
                    .put(`${itemsApi}/${newItem.body._id}`)
                    .send({ name: '' })
                    .expect(422)
            })

            test('fails updating to a string of only white spaces', async () => {
                // Create a valid item
                const newItem = await request(server)
                    .post(itemsApi)
                    .send({ name: 'Orange' })
                    .expect(200)

                // Update to only white spaces
                await request(server)
                    .put(`${itemsApi}/${newItem.body._id}`)
                    .send({ name: '     ' })
                    .expect(422)
            })
        })

        //================================================
        //  DELETE /api/items/:id
        //================================================
        describe(`DELETE ${itemsApi}/:id`, () => {
            test('deletes an item', async () => {
                const { body } = await request(server)
                    .post(itemsApi)
                    .send({ name: 'Test Kiwi' })
                    .expect(200)

                await request(server)
                    .delete(`${itemsApi}/${body._id}`)
                    .expect(200)
            })

            test('fails deleting an invalid id', async () => {
                await request(server)
                    .delete(`${itemsApi}/testinvalid`)
                    .expect(400)
            })

            test('fails deleting an already deleted Item', async () => {
                await request(server)
                    .delete(`${itemsApi}/5ccb1fac5572f3b82688dc40`)
                    .expect(404)
            })
        })
    })


    describe('Not Found Error', () => {
        test('returns 404 at non-existent path', async () => {
            await request(server)
                .get('/testinvalid')
                .expect(404)
        })
    })

})
