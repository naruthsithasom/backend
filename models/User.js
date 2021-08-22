module.exports = (sequelize, DataTypes) => {
  const model = sequelize.define('User',{
    username:{
      type: DataTypes.STRING(255),
      unique: true
    },
    password: {
      type: DataTypes.STRING(511)
    },
  })
}