const express = require('express');
const request = require('supertest');

jest.mock('../models', () => ({
    ManySide: {
        find: jest.fn(),
        findById: jest.fn()
    }
}));

const { ManySide } = require('../models');
const routes = require('../routes');

const app = express();
app.use(express.json());
app.use('/', routes);

describe('GET /manyside tesztek', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('Minden telefon lekérése sikeres', async () => {
        const telefonok = [
            { _id: 1, nev: 'Első telefon', ar: 100000 },
            { _id: 2, nev: 'Második telefon', ar: 200000 }
        ];
        const populate = jest.fn().mockResolvedValue(telefonok);
        ManySide.find.mockReturnValue({ populate });

        const response = await request(app).get('/manyside');

        expect(response.status).toBe(200);
        expect(response.body).toEqual(telefonok);
        expect(ManySide.find).toHaveBeenCalledWith();
        expect(populate).toHaveBeenCalledWith('foreignId', '-_id');
    });

    test('Üres eredmény esetén üres tömböt ad vissza', async () => {
        const populate = jest.fn().mockResolvedValue([]);
        ManySide.find.mockReturnValue({ populate });

        const response = await request(app).get('/manyside');

        expect(response.status).toBe(200);
        expect(response.body).toEqual([]);
    });

    test('A kapcsolt adatokat is változatlanul visszaadja', async () => {
        const telefonok = [{
            _id: 10,
            nev: 'Kapcsolt telefon',
            foreignId: { nev: 'Gyártó' }
        }];
        const populate = jest.fn().mockResolvedValue(telefonok);
        ManySide.find.mockReturnValue({ populate });

        const response = await request(app).get('/manyside');

        expect(response.body).toEqual(telefonok);
    });

    test('Speciális karaktereket tartalmazó adatokat is visszaad', async () => {
        const telefonok = [{
            _id: 11,
            nev: 'Ági & Béla telefonja',
            szin: 'fekete-fehér'
        }];
        const populate = jest.fn().mockResolvedValue(telefonok);
        ManySide.find.mockReturnValue({ populate });

        const response = await request(app).get('/manyside');

        expect(response.status).toBe(200);
        expect(response.body).toEqual(telefonok);
    });

    test('Adatbázishiba esetén 500-as hibát ad', async () => {
        const populate = jest.fn().mockRejectedValue(new Error('Adatbázis hiba'));
        ManySide.find.mockReturnValue({ populate });

        const response = await request(app).get('/manyside');

        expect(response.status).toBe(500);
        expect(response.body).toEqual({ message: 'Adatbázis hiba' });
    });

    test('A lekérdezés csak egyszer fut le', async () => {
        const populate = jest.fn().mockResolvedValue([{ _id: 12, nev: 'Egyedi telefon' }]);
        ManySide.find.mockReturnValue({ populate });

        await request(app).get('/manyside');

        expect(ManySide.find).toHaveBeenCalledTimes(1);
        expect(populate).toHaveBeenCalledTimes(1);
    });
});

describe('GET /manyside/:id tesztek', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('Telefon lekérése azonosító alapján sikeres', async () => {
        const telefon = { _id: 1, nev: 'Teszt telefon', ar: 250000 };
        const populate = jest.fn().mockResolvedValue(telefon);
        ManySide.findById.mockReturnValue({ populate });

        const response = await request(app).get('/manyside/1');

        expect(response.status).toBe(200);
        expect(response.body).toEqual(telefon);
        expect(ManySide.findById).toHaveBeenCalledWith('1');
        expect(populate).toHaveBeenCalledWith('foreignId', '-_id');
    });

    test('Nem létező azonosító esetén 404-es hibát ad', async () => {
        const populate = jest.fn().mockResolvedValue(null);
        ManySide.findById.mockReturnValue({ populate });

        const response = await request(app).get('/manyside/404');

        expect(response.status).toBe(404);
        expect(response.body).toEqual({
            message: 'Nincs ilyen azonosítóval rendelkező elem.'
        });
    });

    test('Adatbázishiba esetén 500-as hibát ad', async () => {
        const populate = jest.fn().mockRejectedValue(new Error('Adatbázis hiba'));
        ManySide.findById.mockReturnValue({ populate });

        const response = await request(app).get('/manyside/2');

        expect(response.status).toBe(500);
        expect(response.body).toEqual({ message: 'Adatbázis hiba' });
    });

    test('Az azonosítót szövegként továbbítja a modellnek', async () => {
        const populate = jest.fn().mockResolvedValue({ _id: 'abc123', nev: 'Másik telefon' });
        ManySide.findById.mockReturnValue({ populate });

        await request(app).get('/manyside/abc123');

        expect(ManySide.findById).toHaveBeenCalledWith('abc123');
    });

    test('A teljes telefont a kapcsolt adattal együtt adja vissza', async () => {
        const telefon = {
            _id: 3,
            nev: 'Kapcsolt telefon',
            ar: 300000,
            szin: 'kék',
            foreignId: { nev: 'Gyártó' }
        };
        const populate = jest.fn().mockResolvedValue(telefon);
        ManySide.findById.mockReturnValue({ populate });

        const response = await request(app).get('/manyside/3');

        expect(response.body).toEqual(telefon);
    });

    test('Speciális karaktereket tartalmazó telefont is visszaad', async () => {
        const telefon = {
            _id: 4,
            nev: 'Ági & Béla telefonja',
            szin: 'fekete-fehér'
        };
        const populate = jest.fn().mockResolvedValue(telefon);
        ManySide.findById.mockReturnValue({ populate });

        const response = await request(app).get('/manyside/4');

        expect(response.status).toBe(200);
        expect(response.body).toEqual(telefon);
    });
});