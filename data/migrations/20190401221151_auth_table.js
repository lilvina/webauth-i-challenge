
exports.up = function(knex, Promise) {
  return knex.schema.createTable('user', tbl => {
    tbl.increments()
    tbl.string('username').notNullable().unique()
    tbl.string('password').notNullable()
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTableIfExists('user')
};
