module.exports = (sequelize, DataTypes) => {
    const Orders = sequelize.define("Orders",
        {
            uuid:
            {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                allowNull: false,
                primaryKey: true
            },
            uniqueCode:
            {
                type: DataTypes.CHAR(10),
                allowNull: true,
                unique: true
            },
            userId:
            {
                type: DataTypes.UUID,
                allowNull: true,
                references: {
                    model: "Users",
                    key: "uuid"
                }
            },
            recipientName:
            {
                type: DataTypes.STRING,
                allowNull: false,
            },
            paymentStatus:
            {
                type: DataTypes.BOOLEAN,
                defaultValue: false
            }
        },
        {
            freezeTableName: true
        });

    Orders.associate = (models) => {
        Orders.hasOne(models.Transactions, { foreignKey: "orderId", as: "transaction" });
        Orders.hasMany(models.OrderItems, { foreignKey: "orderId", as: "orderItems" });
        Orders.belongsTo(models.Users, { foreignKey: "userId", as: "user" });
    }

    return Orders;
}