const UsersService = {
    getAllUsers(knex) {
        return knex.select('*').from('user')
    },


    insertUser (knex, newUser) {
        return knex 
            .insert(newUser)
            .into('user')
            .returning('*')
            .then(rows => {
                return rows[0]
            })
    },

    getById(knex, id) {
        return knex
            .from('user')
            .select('*')
            .where('id', id)
            .first()
    },

    getByLogin(knex, email, password) {
        return knex
            .from('user')
            .select('*')
            .where({
                'email': email,
                'password': password
            })
            // .andWhere('password', password)
            .first()
    },

    deleteUser(knex, id) {
        return knex('user')
            .where({ id })
            .delete()
    },

    updateUser(knex, id, newUserFields) {
        return knex('user')
            .where({ id })
            .update(newUserFields)
    },
}

module.exports = UsersService