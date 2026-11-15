const express = require('express');
const request = require('supertest');

jest.mock('../models', () => ({
	ManySide: {
		findByIdAndUpdate: jest.fn()
	}
}));

const { ManySide } = require('../models');
const routes = require('../routes');

const app = express();
app.use(express.json());
app.use('/', routes);

describe('PATCH tesztek', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	test('Meglévő telefon frissítése sikeres', async () => {
		const frissitettTelefon = {
			_id: 999,
			nev: 'Frissített telefon',
			ar: 275000
		};
		ManySide.findByIdAndUpdate.mockResolvedValue(frissitettTelefon);

		const response = await request(app)
			.patch('/manyside/999')
			.send({ nev: 'Frissített telefon', ar: 275000 });

		expect(response.status).toBe(200);
		expect(response.body).toEqual(frissitettTelefon);
	});

	test('A megfelelő azonosítót, adatokat és opciókat adja át a modellnek', async () => {
		ManySide.findByIdAndUpdate.mockResolvedValue({ _id: 1000 });

		await request(app)
			.patch('/manyside/1000')
			.send({ ar: 300000 });

		expect(ManySide.findByIdAndUpdate).toHaveBeenCalledWith(
			'1000',
			{ ar: 300000 },
			{ returnDocument: 'after', runValidators: true }
		);
	});

	test('Nem létező telefon esetén 404-es hibát ad', async () => {
		ManySide.findByIdAndUpdate.mockResolvedValue(null);

		const response = await request(app)
			.patch('/manyside/12345')
			.send({ ar: 100000 });

		expect(response.status).toBe(404);
		expect(response.body).toEqual({
			message: '12345 azonosítóval nem létezik elem!'
		});
	});

	test('Váratlan adatbázishiba esetén 500-as hibát ad', async () => {
		ManySide.findByIdAndUpdate.mockRejectedValue(new Error('Adatbázis hiba'));

		const response = await request(app)
			.patch('/manyside/999')
			.send({ ar: 100000 });

		expect(response.status).toBe(500);
		expect(response.body).toEqual({ message: 'Adatbázis hiba' });
	});

	test('Validációs hiba esetén a kivétel üzenetét 500-as válaszban adja vissza', async () => {
		const error = new Error('A név megadása kötelező!');
		error.name = 'ValidationError';
		ManySide.findByIdAndUpdate.mockRejectedValue(error);

		const response = await request(app)
			.patch('/manyside/999')
			.send({ nev: '' });

		expect(response.status).toBe(500);
		expect(response.body).toEqual({ message: 'A név megadása kötelező!' });
	});

	test('Speciális karaktereket tartalmazó adatokat változatlanul továbbít', async () => {
		const adatok = { nev: 'Ági & Béla telefonja', szin: 'fekete-fehér' };
		ManySide.findByIdAndUpdate.mockResolvedValue({ _id: 999, ...adatok });

		const response = await request(app)
			.patch('/manyside/999')
			.send(adatok);

		expect(response.status).toBe(200);
		expect(response.body).toEqual({ _id: 999, ...adatok });
		expect(ManySide.findByIdAndUpdate).toHaveBeenCalledWith(
			'999',
			adatok,
			{ returnDocument: 'after', runValidators: true }
		);
	});
});
