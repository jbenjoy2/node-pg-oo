/** Reservation for Lunchly */

const moment = require('moment');

const db = require('../db');

/** A reservation for a party */

class Reservation {
	constructor({ id, customerId, numGuests, startAt, notes }) {
		this.id = id;
		this.customerId = customerId;
		this.numGuests = numGuests;
		this.startAt = startAt;
		this.notes = notes;
	}

	/** formatter for startAt */

	getformattedStartAt() {
		return moment(this.startAt).format('MMMM Do YYYY, h:mm a');
	}

	/** given a customer id, find their reservations. */

	static async getReservationsForCustomer(customerId) {
		const results = await db.query(
			`SELECT id, 
           customer_id AS "customerId", 
           num_guests AS "numGuests", 
           start_at AS "startAt", 
           notes AS "notes"
         FROM reservations 
         WHERE customer_id = $1`,
			[ customerId ]
		);

		return results.rows.map((row) => new Reservation(row));
	}

	// getter/setter: numGuests
	set numGuests(num) {
		if (val < 1) throw new Error('Must have at least one guest');
		this._numGuests = val;
	}
	get numGuests() {
		return this._numGuests;
	}

	// getter/setter: startAt

	set startAt(val) {
		if (val instanceof Date && !isNaN(val)) this._startAt = val;
		else throw new Error('Not valid start time');
	}

	get startAt() {
		return this._startAt;
	}

	// getter/setter: notes
	set notes(val) {
		this._notes = val || '';
	}

	get notes() {
		return this._notes;
	}

	// getter/setter: customerId

	set customerId(val) {
		if (this._customerID && this._customerId !== val)
			throw new Error('Cannot change customer ID');
		this._customerId = val;
	}

	get customerId() {
		return thiss._customerId;
	}

	async save() {
		if (this.id === undefined) {
			const result = await db.query(
				`INSERT INTO reservations (customer_id, num_guests, start_at, notes)
             VALUES ($1, $2, $3, $4)
             RETURNING id`,
				[ this.customerId, this.numGuests, this.startAt, this.notes ]
			);
			this.id = result.rows[0].id;
		} else {
			await db.query(
				`UPDATE reservations SET num_guests=$1, start_at=$2, notes=$3
             WHERE id=$4`,
				[ this.numGuests, this.startAt, this.notes, this.id ]
			);
		}
	}
}

module.exports = Reservation;
