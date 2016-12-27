# Установка
Тестировалось под **node === 4.6.0 and npm === 2.15.9**.

```bash
# Клонирование в текущую папку
$ git clone http://elem-gitlab.elem.ru/maps/ppm-map.git

# Переходим в корень проекта
$ cd ppm-map

# Установка зависимостей
$ npm i && cd sap-mongo && npm i && cd ../public && npm i

# Переходим в корень проекта
$ cd ../ppm-map

# Запуск через pm2
$ pm2 start ppm-map-server.js && pm2 start sap-mongo.js 
```

# Установка индексов в БД
Если не поставить индексы, то через пару месяцев приложение будет тормозить

```bash
db.sap_data.createIndex({"timestamp" : 1});
db.sap_data.createIndex({"MATNR_CPH_PPM" : 1, N_KART: 1});
db.sap_data.createIndex({"N_KART" : 1, LGORT: 1});
db.sap_data.createIndex({"PR_NUMBER_ACT" : 1});
```