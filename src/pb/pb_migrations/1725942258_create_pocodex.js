migrate(
  (app) => {
    const collection = new Collection({
      "id": "kxhogh0nu8cyokn",
      "name": "pocodex",
      "type": "base",
      "system": false,
      "fields": [
        {
          "autogeneratePattern": "",
          "hidden": false,
          "id": "avyam89v",
          "max": 4096,
          "min": 0,
          "name": "owner",
          "pattern": "",
          "presentable": false,
          "primaryKey": false,
          "required": true,
          "system": false,
          "type": "text"
        },
        {
          "autogeneratePattern": "",
          "hidden": false,
          "id": "adbqji6s",
          "max": 4096,
          "min": 0,
          "name": "type",
          "pattern": "",
          "presentable": false,
          "primaryKey": false,
          "required": true,
          "system": false,
          "type": "text"
        },
        {
          "autogeneratePattern": "",
          "hidden": false,
          "id": "ebc7jrha",
          "max": 4096,
          "min": 0,
          "name": "key",
          "pattern": "",
          "presentable": false,
          "primaryKey": false,
          "required": true,
          "system": false,
          "type": "text"
        },
        {
          "hidden": false,
          "id": "w8tqpoan",
          "maxSize": 0,
          "name": "value",
          "presentable": false,
          "required": false,
          "system": false,
          "type": "json"
        }
      ],
      "indexes": [
        "CREATE UNIQUE INDEX `idx_5XsQQRe` ON `pocodex` (`owner`, `type`, `key`)",
        "CREATE INDEX `idx_jRx0x6O` ON `pocodex` (`owner`)",
        "CREATE INDEX `idx_MQTYsG2` ON `pocodex` (`owner`, `type`)"
      ],
      "listRule": null,
      "viewRule": null,
      "createRule": null,
      "updateRule": null,
      "deleteRule": null,
    })

    return app.save(collection)
  },
  (app) => {
    const collection = app.findCollectionByNameOrId("kxhogh0nu8cyokn")

    return app.delete(collection)
  }
)
