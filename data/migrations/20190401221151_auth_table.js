
exports.up = function(knex, Promise) {
  return knex.schema.createTable('user', tbl => {
    tbl.increments()
    tbl.string('username', 128).notNullable().unique()
    tbl.string('password', 128).notNullable()
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTableIfExists('user')
};
