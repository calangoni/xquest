'use strict'

const bodyParser = require('body-parser')
const express = require('express')
const app = express()

const Sequelize = require('sequelize')
const sequelize = new Sequelize({
  database: 'ldxequips',
  username: 'root',
  password: null,
  dialect: 'mysql',
  host: 'localhost',
  // port: 3306,

  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },

  // http://docs.sequelizejs.com/manual/tutorial/querying.html#operators
  operatorsAliases: false
})

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

// Evitar problemas com CORS
app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', req.get('Origin') || '*')
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
  res.header('Access-Control-Allow-Credentials', 'true')
  res.header('Access-Control-Allow-Headers', 'Authorization, Origin, X-Requested-With, Content-Type, Accept')
  if (req.method === 'OPTIONS') return res.send('OK')
  next()
})

app.get('/', function (req, res) {
  res.send('Hello World')
})
 
app.get('/api/allCombos', function (req, res) {
  Promise.all([
    sequelize.query("SELECT name as label, id as value FROM Customers", { raw: true, type: Sequelize.QueryTypes.SELECT }),
    sequelize.query("SELECT description as label, id as value FROM EquipmentBrands", { raw: true, type: Sequelize.QueryTypes.SELECT }),
    sequelize.query("SELECT description as label, id as value FROM EquipmentModels", { raw: true, type: Sequelize.QueryTypes.SELECT }),
    sequelize.query("SELECT description as label, id as value FROM EquipmentOS", { raw: true, type: Sequelize.QueryTypes.SELECT }),
    sequelize.query("SELECT description as label, id as value FROM Products", { raw: true, type: Sequelize.QueryTypes.SELECT }),
    sequelize.query("SELECT description as label, id as value FROM OSVersions", { raw: true, type: Sequelize.QueryTypes.SELECT }),
    sequelize.query("SELECT DISTINCT memoryAmount FROM Equipments", { raw: true, type: Sequelize.QueryTypes.SELECT })
  ])
  .then(([Customers, EquipmentBrands, EquipmentModels, EquipmentOS, Products, OSVersions, EquipmentsMemory]) => {
    res.json({
      Cliente: Customers,
      Produto: Products,
      Marca: EquipmentBrands,
      Modelo: EquipmentModels,
      Memoria: EquipmentsMemory.map(x => {return {label: String(x.memoryAmount), value: x.memoryAmount}}),
      SO: OSVersions,
      VersaoSO: EquipmentOS
    })
  })
})

app.post('/api/getpage', function (req, res) {
  let fields = []
  let selects = []
  if (req.body.groupBy.includes('SO')) {fields.push('OSVersions.description');selects.push('OSVersions.description as SO')}
  if (req.body.groupBy.includes('VersaoSO')) {fields.push('EquipmentOS.description');selects.push('EquipmentOS.description as VersaoSO')}
  if (req.body.groupBy.includes('Memoria')) {fields.push('Equipments.memoryAmount');selects.push('Equipments.memoryAmount as Memoria')}
  if (req.body.groupBy.includes('Marca')) {fields.push('EquipmentBrands.description');selects.push('EquipmentBrands.description as Marca')}
  if (req.body.groupBy.includes('Modelo')) {fields.push('EquipmentModels.description');selects.push('EquipmentModels.description as Modelo')}
  if (req.body.groupBy.includes('Produto')) {fields.push('Products.description');selects.push('Products.description as Produto')}
  if (req.body.groupBy.includes('Cliente')) {fields.push('Customers.name');selects.push('Customers.name as Cliente')}
  if (fields.length === 0) {
    return res.status(400).json({message: 'Selecione pelo menos um campo'})
  }

  let filters = []
  if ((req.body.filters.Cliente instanceof Array) && req.body.filters.Cliente.length > 0) filters.push(`Customers.id IN (${req.body.filters.Cliente.join(', ')})`)
  if ((req.body.filters.Produto instanceof Array) && req.body.filters.Produto.length > 0) filters.push(`Products.id IN (${req.body.filters.Produto.join(', ')})`)
  if ((req.body.filters.Marca instanceof Array) && req.body.filters.Marca.length > 0) filters.push(`EquipmentBrands.id IN (${req.body.filters.Marca.join(', ')})`)
  if ((req.body.filters.Modelo instanceof Array) && req.body.filters.Modelo.length > 0) filters.push(`EquipmentModels.id IN (${req.body.filters.Modelo.join(', ')})`)
  if ((req.body.filters.Memoria instanceof Array) && req.body.filters.Memoria.length > 0) filters.push(`Equipments.memoryAmount IN (${req.body.filters.Memoria.join(', ')})`)
  if ((req.body.filters.VersaoSO instanceof Array) && req.body.filters.VersaoSO.length > 0) filters.push(`EquipmentOS.id IN (${req.body.filters.VersaoSO.join(', ')})`)
  if ((req.body.filters.SO instanceof Array) && req.body.filters.SO.length > 0) filters.push(`OSVersions.id IN (${req.body.filters.SO.join(', ')})`)

  const itemsPerPage = 10
  const page = req.body.page ? Number(req.body.page) : 1
  const offset = (page - 1) * itemsPerPage

  const sentenceRows = `
    SELECT
      COUNT(*) as items,
      ${selects.join(', ')}
    FROM
      EquipmentCollected
      INNER JOIN License ON (License.id = EquipmentCollected.licenseId)
      INNER JOIN Equipments ON (Equipments.id = EquipmentCollected.equipmentId)
      INNER JOIN EquipmentModels ON (EquipmentModels.id = Equipments.modelId)
      INNER JOIN EquipmentBrands ON (EquipmentBrands.id = Equipments.brandId)
      INNER JOIN Customers ON (Customers.id = License.customerId)
      INNER JOIN Products ON (Products.id = License.productId)
      INNER JOIN EquipmentOS ON (EquipmentOS.id = Equipments.osId)
      INNER JOIN OSVersions ON (OSVersions.id = EquipmentOS.osId)
    ${(filters.length > 0) ? (' WHERE ' + filters.join(' AND ')) : ''}
    GROUP BY ${fields.join(', ')}
    ORDER BY ${fields.join(', ')}
    LIMIT ${offset},${itemsPerPage}
    `
  const sentenceCount = `
    SELECT COUNT(*) as totalRows, SUM(T.items) as totalItems FROM (
    SELECT COUNT(*) as items
    FROM
      EquipmentCollected
      INNER JOIN License ON (License.id = EquipmentCollected.licenseId)
      INNER JOIN Equipments ON (Equipments.id = EquipmentCollected.equipmentId)
      INNER JOIN EquipmentModels ON (EquipmentModels.id = Equipments.modelId)
      INNER JOIN EquipmentBrands ON (EquipmentBrands.id = Equipments.brandId)
      INNER JOIN Customers ON (Customers.id = License.customerId)
      INNER JOIN Products ON (Products.id = License.productId)
      INNER JOIN EquipmentOS ON (EquipmentOS.id = Equipments.osId)
      INNER JOIN OSVersions ON (OSVersions.id = EquipmentOS.osId)
    ${(filters.length > 0) ? (' WHERE ' + filters.join(' AND ')) : ''}
    GROUP BY ${fields.join(', ')}
    ) T`
  Promise.all([
    sequelize.query(sentenceRows, { raw: true, type: Sequelize.QueryTypes.SELECT }),
    sequelize.query(sentenceCount, { raw: true, type: Sequelize.QueryTypes.SELECT })
  ]).then(([rows, resultContagem]) => {
    res.status(200).json({rows, totalItems: resultContagem[0].totalItems, paginacao: { total: Math.ceil(resultContagem[0].totalRows / itemsPerPage), atual: page }})
  })
})

app.listen(3000)
