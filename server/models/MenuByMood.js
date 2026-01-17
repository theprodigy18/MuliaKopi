module.exports = (sequelize, DataTypes) => {
    const MenuByMood = sequelize.define("MenuByMood",
        {
            mood:
            {
                type: DataTypes.STRING,
                allowNull: false,
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
            freezeTableName: true
        });

    MenuByMood.associate = (models) =>
    {
        MenuByMood.belongsTo(models.Menu, { foreignKey: "menuId", as: "menu" });
    }


    return MenuByMood;
}