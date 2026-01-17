module.exports = (sequelize, DataTypes) => {
    const Transactions = sequelize.define("Transactions",
        {
            uuid:
            {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                allowNull: false,
                primaryKey: true
            },
            orderId:
            {
                type: DataTypes.UUID,
                allowNull: false,
                references: {
                    model: "Orders",
                    key: "uuid"
                }
            },
            adminId:
            {
                type: DataTypes.UUID,
                allowNull: false,
                references: {
                    model: "Admin",
                    key: "uuid"
                }
            },
            tempPrice:
            {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            discount:
            {
                type: DataTypes.INTEGER,
                allowNull: true
            },
            tax:
            {
                type: DataTypes.INTEGER,
                allowNull: true
            },
            totalPrice:
            {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            paymentMethod:
            {
                type: DataTypes.STRING,
                allowNull: false
            }
        });

    Transactions.associate = (models) =>
    {
        Transactions.belongsTo(models.Orders, { foreignKey: "orderId", as: "order" });
        Transactions.belongsTo(models.Admin, { foreignKey: "adminId", as: "admin" });
    }

    return Transactions;
}