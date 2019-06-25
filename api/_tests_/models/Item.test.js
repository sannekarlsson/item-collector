'use strict'

//================================================
// Test Database -- start with mongod
//================================================
const mongoose = require('mongoose')
const mongoDB = process.env.TEST_ITEM_DB || 'mongodb://localhost:27017/test-item'
mongoose.connect(mongoDB, { useNewUrlParser: true })
    .catch(err => console.error(err))

const Item = require('../../models/Item')

describe('Item model test', () => {
    afterEach(async () =>
        await Item.deleteMany({})
    )

    afterAll(async () =>
        await mongoose.connection.close()
    )

    test('has a module', () => {
        expect(Item).toBeDefined()
    })

    describe('saves Item', () => {
        test('has properties name, created and _id', async () => {
            expect.assertions(4)
            const newItem = new Item({ name: 'Test' })
            const savedItem = await newItem.save()

            expect(savedItem).toHaveProperty('name')
            expect(savedItem).toHaveProperty('name', 'Test')
            expect(savedItem).toHaveProperty('created')
            expect(savedItem).toHaveProperty('_id')
        })

        test('fails when Item is empty', async () => {
            expect.assertions(2)
            try {
                await new Item().save()
            } catch (error) {
                expect(error.name).toEqual('ValidationError')
                expect(error.message).toMatch('name')
            }
        })

        test('fails without the name property', async () => {
            expect.assertions(2)
            try {
                await new Item({ fail: 'Test fail' }).save()
            } catch (error) {
                expect(error.name).toEqual('ValidationError')
                expect(error.message).toMatch('name')
            }
        })

        test('fails when name is an empty string', async () => {
            expect.assertions(2)
            try {
                await new Item({ name: '' }).save()
            } catch (error) {
                expect(error.name).toEqual('ValidationError')
                expect(error.message).toMatch('name')
            }
        })

        test('fails when name is an array', async () => {
            expect.assertions(2)
            try {
                await new Item({ name: ['Test'] }).save()
            } catch (error) {
                expect(error.name).toEqual('ValidationError')
                expect(error.message).toMatch('name')
            }
        })

        test('fails when name is an object', async () => {
            expect.assertions(2)
            try {
                await new Item({ name: {} }).save()
            } catch (error) {
                expect(error.name).toEqual('ValidationError')
                expect(error.message).toMatch('name')
            }
        })
    })

    describe('gets Item', () => {
        test('gets the saved Item', async () => {
            expect.assertions(1)
            const itemName = 'Test Item'
            const newItem = new Item({ name: itemName })
            const savedItem = await newItem.save()

            const foundItem = await Item.findById(savedItem._id)
            const actual = foundItem['name']
            expect(actual).toEqual(itemName)
        })
    })

    describe('deletes Item', () => {
        test('deletes an Item by id', async () => {
            expect.assertions(1)
            const savedItem = await new Item({ name: 'delete' }).save()
            const savedId = savedItem._id

            await Item.findByIdAndDelete(savedId)
            const deleted = await Item.findById(savedId)
            expect(deleted).toBeNull()
        })

        test('fails to delete non-existent Item', async () => {
            expect.assertions(2)
            try {
                await Item.findByIdAndDelete('testidfail')
            } catch (error) {
                expect(error.name).toEqual('CastError')
                expect(error.message).toMatch('ObjectId')
            }
        })
    })
})
