'use strict';
/* Data Access Object (DAO) module for accessing questions and answers */

const sqlite = require('sqlite3');
const dayjs = require('dayjs');






// open the database
const db = new sqlite.Database('films.db', (err) => {
    if (err) throw err;
});


// get all film
exports.listFilms = (filter,userId) => {

    return new Promise((resolve, reject) => {


        let sql = "";
        switch (filter) {

            case "filter-favorite":
                sql = "SELECT * FROM films  where user=? AND favorite=1"
                break;
            case "filter-best":
                sql = "SELECT * FROM films  where user=? AND rating=5"
                break;
            case "filter-unseen":
                sql = "SELECT * FROM films WHERE user=? AND watchdate IS NULL OR watchdate = ''"
                break;
            case "filter-lastmonth":
                sql="SELECT * FROM films  WHERE user=? AND watchdate IS NOT NULL AND watchdate >= DATE('now', '-30 day')"
                break;
            default:
                sql = "SELECT * FROM films WHERE user=?"
                break;
        }
        
        db.all(sql, [userId], (err, rows) => {
            if (err) {
                reject(err);
                return;
            }
            const films = rows.map((e) => ({ id: e.id, title: e.title, favorite: e.favorite, watchDate: e.watchdate, rating: e.rating, userId: e.user }));
            resolve(films);
        });
    });
};


// get the question identified by {id}
exports.getFilm = (id) => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM films WHERE id=?';
        db.get(sql, [id], (err, row) => {
            if (err) {
                reject(err);
                return;
            }
            if (row == undefined) {
                console.log(1);
                resolve({ error: 'Film not found.' });
            } else {
                const film = { id: row.id, title: row.title, favorite: row.favorite, watchDate: row.watchdate, rating: row.rating, userId: row.user };
                resolve(film);
            }
        });
    });
};


exports.addFilm = (film) => {

    console.log(film);
    return new Promise((resolve, reject) => {
        const sql = 'INSERT INTO films(title, favorite, watchdate, rating, user) VALUES(?, ?, DATE(?),?, ?)';
        db.run(sql, [film.title, film.favorite, film.watchDate, film.rating, film.userId], function (err) {
            if (err) {
                reject(err);
                return;
            }
            resolve(this.lastID);
        });
    });
};


exports.updateFilm = (film) => {

    return new Promise((resolve, reject) => {
        const sql = "UPDATE films SET title=?, favorite=?, watchdate=?, rating=?, user=? WHERE id=?";
        db.run(sql, [film.title, film.favorite, film.watchDate, film.rating, film.userId, film.id], function (err) {
            if (err) {
                console.error(err);
                reject(err);
                return;
            }
            resolve(this.changes);
        });
    });
};

exports.updateRating = (id, rating) => {
    return new Promise((resolve, reject) => {
        const sql = "UPDATE films SET rating =? WHERE id=?";
        db.run(sql, [rating, id], (err, rows) => {
            if (err) {
                console.error(err);
                reject(err);
                return;
            }
            resolve(this.changes);
        });
    })
}


exports.markFavorite = (id, favorite) => {
    return new Promise((resolve, reject) => {
        const sql = "UPDATE films SET favorite =? WHERE id=?";
        db.run(sql, [favorite, id], (err, rows) => {
            if (err) {
                console.error(err);
                reject(err);
                return;
            }
            resolve(this.changes);
        });
    })
}


exports.deleteFilm = (id) => {
    return new Promise((resolve, reject) => {
        const sql = 'DELETE FROM films WHERE id = ?';
        db.run(sql, [id], (err, rows) => {
            if (err) {
                console.error(err);
                reject(err);
                return;
            }
            resolve({ message: `cancellato film con id= ${id}` });

        });
    })
}



