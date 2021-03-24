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

    getById(knex, userId) {
        return knex
            .from('user')
            .select('*')
            .where('userId', userId)
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

    deleteUser(knex, userId) {
        return knex('user')
            .where({ userId })
            .delete()
    },

    updateUser(knex, userId, newUserFields) {
        return knex('user')
            .where({ userId })
            .update(newUserFields)
    },
}

module.exports = UsersService