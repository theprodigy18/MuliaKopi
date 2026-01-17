module.exports = (sequelize, DataTypes) => {
    const Admin = sequelize.define("Admin",
        {
            uuid:
            {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true
            },
            name:
            {
                type: DataTypes.STRING,
                allowNull: false,
            },
            username:
            {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true,
            },
            password:
            {
                type: DataTypes.STRING,
                allowNull: false,
            }
        },
        {
            freezeTableName: true
        });

    Admin.associate = (models) =>
    {
        Admin.hasMany(models.Transactions, { foreignKey: "adminId", as: "transactions" });
    }

    return Admin;
}