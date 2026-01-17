module.exports = (sequelize, DataTypes) => {
    const OrderItems = sequelize.define("OrderItems",
        {
            orderId:
            {
                type: DataTypes.UUID,
                allowNull: false,
                references: {
                    model: "Orders",
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
        },
        {
            freezeTableName: true,
            timestamps: false
        });

    OrderItems.associate = (models) =>
    {
        OrderItems.belongsTo(models.Orders, { foreignKey: "orderId", as: "order" });
        OrderItems.belongsTo(models.Menu, { foreignKey: "menuId", as: "menu" });
    }



    return OrderItems;
}