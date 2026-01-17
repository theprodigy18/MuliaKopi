module.exports = (sequelize, DataTypes) => {
    const ScanMood = sequelize.define("ScanMood",
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
            mood:
            {
                type: DataTypes.STRING,
                allowNull: false,
            }
        },
        {
            freezeTableName: true
        });

    ScanMood.associate = (models) =>
    {
        ScanMood.belongsTo(models.Users, { foreignKey: "userId", as: "user" });
        ScanMood.hasMany(models.Recommendation, { foreignKey: "scanId", as: "Recommendations" });
    }


    return ScanMood;
}