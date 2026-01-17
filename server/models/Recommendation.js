module.exports = (sequelize, DataTypes) => {
    const Recommendation = sequelize.define("Recommendation",
        {
            scanId:
            {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: "ScanMood",
                    key: "id"
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
            }
        },
        {
            freezeTableName: true,
            timestamps: false
        });

    Recommendation.associate = (models) =>
    {
        Recommendation.belongsTo(models.ScanMood, { foreignKey: "scanId", as: "scanMood" });
        Recommendation.belongsTo(models.Menu, { foreignKey: "menuId", as: "menu" });
    }


    return Recommendation;
}