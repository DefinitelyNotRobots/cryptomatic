const { dropCollection } = require('../util/db');
const app = require('../../lib/app');
const Account = require('../../lib/models/Account');
const request = require('supertest');
const Chance = require('chance');
const chance = new Chance();
const { checkStatus, signUp, signIn, applyUsers } = require('../util/helpers');


const users = applyUsers(1);


describe('transaction routes', () => {
        
    let createdUsers;
    let createdAccounts;
    let token;

    beforeEach(async() => {
        await Promise.all([
            dropCollection('users'),
            dropCollection('accounts'),
            dropCollection('transactions')
        ]);
        await Promise.all(users.map(signUp))
            .then(cs => createdUsers = cs);
        await signIn(users[0])
            .then(createdToken => token = createdToken);
    });

    beforeEach(async() => {
        let accountData = {
            user: createdUsers[0]._id,
            exchange: 'Fake Market',
        };

        let holdingsData = { name: 'BTC', quantity: 12 };

        await request(app)
            .post('/accounts')
            .set('Authorization', `Bearer ${token}`)            
            .send(accountData);

        await request(app)
            .post('/accounts/holdings')
            .set('Authorization', `Bearer ${token}`)            
            .send(holdingsData);
    });

    it('creates a transaction', async() => {
        
        let newTransaction = {
            action: 'buy',
            currency: 'BTC',
            exchange: 'Fake Market',
            price: chance.natural(),
            quantity: chance.natural()
        };

        await request(app)
            .post('/transactions')
            .set('Authorization', `Bearer ${token}`)            
            .send(newTransaction)
            .then(res => {
                // checkStatus(200)(res);
                expect(res.body).toEqual({ 
                    ...newTransaction,
                    _id: expect.any(String),
                    user: createdUsers[0]._id.toString(),
                    time: expect.any(String)
                });
            });
    });



});
