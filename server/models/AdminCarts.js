module.exports = (sequelize, DataTypes) => {
    const AdminCarts = sequelize.define("AdminCarts",
        {
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

    AdminCarts.associate = (models) =>
    {
        AdminCarts.belongsTo(models.Menu, { foreignKey: "menuId", as: "menu" });
    }



    return AdminCarts;
}