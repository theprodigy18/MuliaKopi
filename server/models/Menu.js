module.exports = (sequelize, DataTypes) => {
    const Menu = sequelize.define("Menu",
        {
            id:
            {
                type: DataTypes.CHAR(5),
                primaryKey: true,
                allowNull: false,
            },
            name:
            {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true,
            },
            category:
            {
                type: DataTypes.STRING,
                allowNull: false,
            },
            image:
            {
                type: DataTypes.STRING,
                allowNull: true,
            },
            description:
            {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            price:
            {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            stock:
            {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            isActive:
            {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
            }

        },
        {
            freezeTableName: true
        });

        Menu.associate = (models) =>
        {
            Menu.hasMany(models.Recommendation, { foreignKey: "menuId", as: "recommendations" });
            Menu.hasMany(models.Carts, { foreignKey: "menuId", as: "carts" });
            Menu.hasMany(models.AdminCarts, { foreignKey: "menuId", as: "adminCarts" });
            Menu.hasMany(models.MenuByMood, { foreignKey: "menuId", as: "menuByMoods" });
            Menu.hasMany(models.OrderItems, { foreignKey: "menuId", as: "orderItems" });
        }


    return Menu;
};