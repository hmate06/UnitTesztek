const express = require('express');
const request = require('supertest');

jest.mock('../models', () => ({
    ManySide: {
        create: jest.fn()
    }
}));

const { ManySide } = require('../models');
const routes = require('../routes');

const app = express();
app.use(express.json());
app.use('/', routes);

describe('POST tesztek', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('új telefon létrehozása sikeres', async () => {
        ManySide.create.mockResolvedValue({
            _id: 999
        });

        const response = await request(app)
            .post('/new')
            .send({
                _id: 999,
                nev: 'Teszt telefon',
                ar: 250000,
                szin: 'fekete',
                foreignId: 1
            });

        expect(response.status).toBe(201);
        expect(response.body).toEqual({
            _id: 999
        });
    });

   
});