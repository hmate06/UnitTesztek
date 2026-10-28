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

    test('Új telefon létrehozása sikeres', async () => {
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
        expect(ManySide.create).toHaveBeenCalledWith({
            _id: 999,
            nev: 'Teszt telefon',
            ar: 250000,
            szin: 'fekete',
            foreignId: 1
        });
    });

    test('Létrehozáskor csak az új telefon azonosítóját adja vissza', async () => {
        ManySide.create.mockResolvedValue({
            _id: 1003,
            nev: 'Másik telefon',
            ar: 300000
        });

        const response = await request(app)
            .post('/new')
            .send({
                _id: 1003,
                nev: 'Másik telefon',
                ar: 300000
            });

        expect(response.status).toBe(201);
        expect(response.body).toEqual({
            _id: 1003
        });
    });

    test('Érvénytelen adatok esetén 400-as hibát ad', async () => {
        const error = new Error('A név megadása kötelező!');
        error.name = 'ValidationError';
        ManySide.create.mockRejectedValue(error);

        const response = await request(app)
            .post('/new')
            .send({
                _id: 1000,
                ar: 250000
            });

        expect(response.status).toBe(400);
        expect(response.body).toEqual({
            message: 'Hiányos vagy érvénytelen adatok'
        });
    });

    test('Duplikált telefon esetén 409-es hibát ad', async () => {
        ManySide.create.mockRejectedValue({ code: 11000 });

        const response = await request(app)
            .post('/new')
            .send({
                _id: 1001,
                nev: 'Már létező telefon'
            });

        expect(response.status).toBe(409);
        expect(response.body).toEqual({
            message: 'Már létezik ilyen telefon'
        });
    });

    test('Váratlan hiba esetén 500-as hibát ad', async () => {
        ManySide.create.mockRejectedValue(new Error('Adatbázis hiba'));

        const response = await request(app)
            .post('/new')
            .send({
                _id: 1002,
                nev: 'Hibás teszt telefon'
            });

        expect(response.status).toBe(500);
        expect(response.body).toEqual({
            message: 'Szerver hiba'
        });
    });
});