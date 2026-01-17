module.exports = (sequelize, DataTypes) => {
    const Schedules = sequelize.define("Schedules",
        {
            day:
            {
                type: DataTypes.STRING,
            },
            start:
            {
                type: DataTypes.TIME,
            },
            end:
            {
                type: DataTypes.TIME,
            },
        },
        {
            timestamps: false
        });

    return Schedules;
}