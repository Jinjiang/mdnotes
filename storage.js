/// storage ///

function Store(callback) {
    var CREATE_SQL = 'CREATE TABLE IF NOT EXISTS entries (id unique, title, content)';
    var ID_SQL = 'SELECT id, title, content FROM entries WHERE id = ?';
    var DATE_SQL = 'SELECT id, title, content FROM entries WHERE id > ? AND id < ? ORDER BY id DESC LIMIT ?, 5';
    var TITLE_SQL = 'SELECT id, title, content FROM entries WHERE title = ?';
    var SEARCH_SQL = 'SELECT id, title, content FROM entries WHERE title LIKE ? OR content LIKE ? ORDER BY id DESC LIMIT ?, 5';
    var INSERT_SQL = 'INSERT OR REPLACE INTO entries(id, title, content) VALUES (?, ?, ?)';
    var DELETE_SQL = 'DELETE FROM entries WHERE id = ?';
    var COUNT_REG_EXP = /^(SELECT) id, title, content (.+) ORDER BY id DESC LIMIT \?, 5$/;

    var DATE_MAX = '20461231240000';
    var DATE_MIN = '10000101000000';

    var db = openDatabase('mdblog', '1.0', 'Markdown Blog', 2 * 1024 * 1024);
    db.transaction(function (tx) {tx.executeSql(CREATE_SQL, [], load);});

    var that = this;

    function getRows(rows) {
        var result = [];
        for (var i = 0; i < rows.length; i++) {
            result.push(rows.item(i));
        }
        return result;
    }
    function load() {
        that.getByDate = function (range, page, callback) {
            range.min = range.min || DATE_MIN;
            range.max = range.max || DATE_MAX;

            if (range.max == range.min) {
                db.transaction(function (tx) {
                    tx.executeSql(ID_SQL, [range.max],
                    function (transaction, result) {
                        var rows = getRows(result.rows);
                        callback && callback(rows);
                    });
                });
            }
            else {
                db.transaction(function (tx) {
                    tx.executeSql(DATE_SQL, [range.min, range.max, page * 5 - 5],
                    function (transaction, result) {
                        var rows = getRows(result.rows);
                        var sql = DATE_SQL.replace(COUNT_REG_EXP, '$1 count(*) as c $2');
                        tx.executeSql(sql, [range.min, range.max], function (transaction, result) {
                            var count = result.rows.item(0).c;
                            callback && callback(rows, Math.ceil(count / 5));
                        })
                    });
                });
            }
        };
        that.getByStr = function (str, page, callback) {
            db.transaction(function (tx) {
                tx.executeSql(ID_SQL, [str, page * 5 - 5],
                    function (transaction, result) {
                        // TODO
                        callback && callback(getRows(result.rows));
                    });
            });
        };
        that.put = function (data, callback) {
            db.transaction(function (tx) {
                tx.executeSql(INSERT_SQL, [data.datetime, data.title, data.content],
                    function (transaction, result) {
                        callback && callback(result.insertId);
                    });
            });
        };
        that.remove = function (id, callback) {
            db.transaction(function (tx) {
                tx.executeSql(DELETE_SQL, [id],
                    function (transaction, result) {
                        callback && callback(result.rowsAffected);
                    });
            });
        };
        callback && callback();
    }
}


