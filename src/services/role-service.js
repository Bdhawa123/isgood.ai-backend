const RoleService = {
    getByName(knex, name) {
        return knex('roles')
            .select('id')
            .where({
            'name': name
        }).first()
    },
}

module.exports = RoleService