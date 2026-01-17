module.exports = (sequelize, DataTypes) => {
    const Carts = sequelize.define("Carts",
        {
            userId:
            {
                type: DataTypes.UUID,
                allowNull: false,
                references: {
                    model: "Users",
                    key: "uuid"
                }
            },
            menuId:
            {
                type: DataTypes.CHAR(5),
                allowNull: false,
                references: {
                    model: "Menu",
                    key: "id"
                }
            },
            quantity:
            {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            subPrice:
            {
                type: DataTypes.INTEGER,
                allowNull: false
            }
        });

    Carts.associate = (models) =>
    {
        Carts.belongsTo(models.Users, { foreignKey: "userId", as: "user" });
        Carts.belongsTo(models.Menu, { foreignKey: "menuId", as: "menu" });
    }



    return Carts;
}