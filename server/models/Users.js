module.exports = (sequelize, DataTypes) => {
    const Users = sequelize.define("Users",
        {
            uuid:
            {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true,
            },
            email:
            {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true,
            },
            name:
            {
                type: DataTypes.STRING,
                allowNull: false,
            },
            password:
            {
                type: DataTypes.STRING,
                allowNull: false,
            },
            status:
            {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
            },
            recoveryToken:
            {
                type: DataTypes.STRING,
                allowNull: true
            }
        });

    Users.associate = (models) => {
        Users.hasMany(models.Carts, { foreignKey: "userId", as: "carts" });
        Users.hasMany(models.ScanMood, { foreignKey: "userId", as: "scanMoods" });
        Users.hasMany(models.Orders, { foreignKey: "userId", as: "orders" });
    }


    return Users;
}