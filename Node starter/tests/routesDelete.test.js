const express = require('express');
const request = require('supertest');

jest.mock('../models', () => ({
    ManySide: {
        findByIdAndDelete: jest.fn()
    }
}));

const { ManySide } = require('../models');
const routes = require('../routes');

const app = express();
app.use(express.json());
app.use('/', routes);

describe('DELETE tesztek', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('Telefon törlése sikeres', async () => {
        ManySide.findByIdAndDelete.mockResolvedValue({
            _id: 999,
            nev: 'Teszt telefon'
        });

        const response = await request(app)
            .delete('/manyside/999');

        expect(response.status).toBe(200);
        expect(response.text).toBe('A Teszt telefon nevű elem törölve lett.');
        expect(ManySide.findByIdAndDelete).toHaveBeenCalledWith('999');
    });

    test('Váratlan hiba esetén 500-as hibát ad', async () => {
        ManySide.findByIdAndDelete.mockRejectedValue(new Error('Adatbázis hiba'));

        const response = await request(app)
            .delete('/manyside/1000');

        expect(response.status).toBe(500);
        expect(response.body).toEqual({
            message: 'Adatbázis hiba'
        });
        expect(ManySide.findByIdAndDelete).toHaveBeenCalledWith('1000');
    });

    test('Másik azonosító törlésekor is továbbítja az azonosítót', async () => {
        ManySide.findByIdAndDelete.mockResolvedValue({
            _id: 'abc123',
            nev: 'Másik telefon'
        });

        const response = await request(app)
            .delete('/manyside/abc123');

        expect(response.status).toBe(200);
        expect(response.text).toBe('A Másik telefon nevű elem törölve lett.');
        expect(ManySide.findByIdAndDelete).toHaveBeenCalledTimes(1);
        expect(ManySide.findByIdAndDelete).toHaveBeenCalledWith('abc123');
    });

    test('Különleges karaktereket tartalmazó névvel is sikeres a törlés', async () => {
        ManySide.findByIdAndDelete.mockResolvedValue({
            _id: 42,
            nev: 'Ági & Béla telefonja'
        });

        const response = await request(app)
            .delete('/manyside/42');

        expect(response.status).toBe(200);
        expect(response.text).toBe('A Ági & Béla telefonja nevű elem törölve lett.');
    });

    test('Nem létező elem esetén 404-es hibát ad', async () => {
        ManySide.findByIdAndDelete.mockResolvedValue(null);

        const response = await request(app)
            .delete('/manyside/404');

        expect(response.status).toBe(404);
        expect(response.body).toEqual({
            message: 'Nincs ilyen azonosítóval rendelkező elem.'
        });
        expect(ManySide.findByIdAndDelete).toHaveBeenCalledWith('404');
    });

    test('Kötőjelet tartalmazó azonosítót is helyesen továbbít', async () => {
        ManySide.findByIdAndDelete.mockResolvedValue({
            _id: 'telefon-2025',
            nev: 'Különleges telefon'
        });

        const response = await request(app)
            .delete('/manyside/telefon-2025');

        expect(response.status).toBe(200);
        expect(response.text).toBe('A Különleges telefon nevű elem törölve lett.');
        expect(ManySide.findByIdAndDelete).toHaveBeenCalledWith('telefon-2025');
    });
});