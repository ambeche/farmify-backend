# farmify-backend

A smart farm application. All your farm data from different sensors and metrics are powered, organised and analysed for you. This backend provides REST APIs for the data and the statistical anlaysis, while the frontend allows the Farmer to monitor the data.

## [Live Demo](https://farmify-api.herokuapp.com/farms)   &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;      [ Link to the Frontend Repo](https://github.com/ambeche/farmify)
<hr/>

# [APIs and Usage](#examples)
### ```base url = https://farmify-api.herokuapp.com```

| Endpoint   | GET         |   POST |
| :-------- | :--------- | ---------- |
| **```/farms```**    | returns a json array of Farm objects with nested data | creates a new farm for a given user with the given data, check usage below |
| **```/farms/data```** | returns and array of records for all available farm data     |   adds new records to the data table of and existing farm |
| **```/farms/statistics```**    |   aggregation endpoint    | - |
| **```/users```**    |   gets and authenticated user    | registers a new user into the db |
| **```/login```**   |  -     | route for autheticating users |

# Filter Options

Data filtering is offered through query string parameters. The data from all endpoints can be filtered by **year, month and metrictype**. Server pagination is achieved through **limit , offset and page** options. These options are applied by passing them as key-value pairs to the desired endpoint URL. Firstly, a **?** is appended to the endpoint url followed by the key-value pair options. Each key-value pair should be separated by an **&**. All the options can be applied at once, and the server will respond accordingly. Invalid keys or values will be ignored by the server. If nothing match your query, and empty list will be returned.

| Name(key)   |    Type [value]     |     Description    | Example|
| :-------- | :---------    | :---------- | :----------       | 
| month    |  `number [1,12`]   |  filter results by the month of the year. A month must be a value between 1 and 12, 1 = January, |   2    |  
| year |    `number [YYYY]`  |   filter by year |    2020          | 
| metrictype |   `string [rainfall, pH, temperature ]`  |   filter by the type of measurement taken |   ` ?metrictype=rainfall` |  
| limit |    `number [>=0]`  |  limits the data returned from the server by the set limit , default is 25|   2 => only 2 items are returned |  
| page |    `number [>0]`  |   used for pagination, check examples in the options section below |   `1,2,3,....1000`         |  
| offset |    `number [>=0]`  |  skips a number of items specified by the offset and returns the request items after the skip |  |  
| farmname |    `string ['farm name']`  |   filter by the name of the farm |    `Sari's Farm`         | 

Examples for optoins are provided in the subsections below


# Usage Examples

## GET &nbsp;&nbsp;&nbsp;```/farms ```

The returned data can be quite large, hence the need for setting a limit as a query parameter.

```
https://farmify-api.herokuapp.com/farms
```

returns:

```js
[
{},
...
{ ↩
farmname: "PartialTech Research Farm",
owner: "Sarita-Munkki-1642324035548",
farmdata: [
{
id: 1723,
farmname: "PartialTech Research Farm",
datetime: "2018-12-31",
metrictype: "temperature",
value: -13
},
...
{
id: 1724,
farmname: "PartialTech Research Farm",
datetime: "2019-01-01",
metrictype: "temperature",
value: -10.9
},
}
]
},
..
{},↩
..
{}↩
]
```

## GET with query options &nbsp;&nbsp;&nbsp; ```farms/data```

```
https://farmify-api.herokuapp.com/farms/data?year=2019&month=4&metrictype=ph&limit=2&offset=4
```

returns:

```js
[
  {
    id: 668,
    farmname: "Noora's farm",
    datetime: '2019-04-01',
    metrictype: 'pH',
    value: 6,
    farmFarmname: "Noora's farm",
  },
  {
    id: 671,
    farmname: "Noora's farm",
    datetime: '2019-04-02',
    metrictype: 'pH',
    value: 5.87,
    farmFarmname: "Noora's farm",
  },
];
```

## GET with query options &nbsp;&nbsp;&nbsp;```/farms/statistics```

```
https://farmify-api.herokuapp.com/farms/statistics?year=2020&month=10&limit=2
```

returns:

```js
[
  {
    numberofRecords: '31',
    month: '2019-10-01T00:00:00.000Z',
    metrictype: 'pH',
    farmname: 'Friman Metsola collective',
    min: 5.76,
    max: 6.67,
    average: 6.179032258064516,
  },
  {
    numberofRecords: '31',
    month: '2019-10-01T00:00:00.000Z',
    metrictype: 'rainFall',
    farmname: 'Friman Metsola collective',
    min: 0,
    max: 7.5,
    average: 2.2483870967741937,
  },
];
```

## POST &nbsp;&nbsp;&nbsp;```/farms/``` - adds a new farm with it associated data to db

Only an authenticated user can add a farm. The farm input data is provide as a comma separated csv file containing different records of the farm.
`Accepted input = [farm name] [datetime] [metric type] [metric value]` where metric type is rainfall, ph or temperature (case insensitive, are converted to rainFall, pH and temperature respectively by the server). Invalid and all other type of data will be discarded by the server. farms are unique. file is sent as multipart/form to the server.

```
https://farmify-api.herokuapp.com/farms
```

returns:

```json
[
  {
    "id": 31677,
    "farmname": "Sari's farm",
    "datetime": "2019-01-05",
    "metrictype": "rainFall",
    "value": 0,
    "farmFarmname": "Sari's farm"
  },
  {
    "id": 31678,
    "farmname": "Sari's farm",
    "datetime": "2019-01-05",
    "metrictype": "temperature",
    "value": -8.1,
    "farmFarmname": "Sari's farm"
  },
  {
    "id": 31679,
    "farmname": "Sari's farm",
    "datetime": "2019-01-05",
    "metrictype": "temperature",
    "value": -8.4,
    "farmFarmname": "Sari's farm"
  }
]
```

## POST &nbsp;&nbsp;&nbsp;```/farms/data``` - Add data to an Existing Farm

only authorized user (owner of farm) can add more records to the farm data set. On success, the newly added dat is returned to the user; same as above.

```
https://farmify-api.herokuapp.com/farms/data
```

returns:

## POST &nbsp;&nbsp;&nbsp;```/users``` -User Registration

username and password required. username must be unique!

```
https://farmify-api.herokuapp.com/users
```
```json
{
    "username": "martin",
    "password": "testing-password"
   
}
```     

returns:

 ```json
{
    "username": "martin",
}
```     

## POST &nbsp;&nbsp;&nbsp;```/users``` - Login

username and password required!

```
https://farmify-api.herokuapp.com/users
```
```json
{
    "username": "martin",
    "password": "testing-password"
   
}
```                                                  
returns:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6Im1hcnRpbiIsInBhc3N3b3JkIjoiJDJiJDEwJDlYNElwTVdrYXAucEdOTlBzeUx4Y2VIYmczbm45WE5HR0ovZGRxOVZHb1VMQkh4U1dGSnkuIiwiaWF0IjoxNjQyMzIwNDczfQ.Jnia_T8c_sNjvBiwqC3gG7t4HXHZgTF2eq4haRXqkgo",
  "username": "martin"
}
```

## Server Pagination

When **limit** and **page** options are set, the **offset** is calculated as ```(page - 1) * limit```
so for ```limit = 2; page = 2```, ```offset = 2 => skip the first 2 items and count 2 items from item number 3```
If the offset option is explicitly set a user, then the above calculation is overriden.

```
https://farmify-api.herokuapp.com/farms/data/limit=2
```

returns:
      
```js
[
{           ↩
id: 1,
farmname: "Noora's farm",
datetime: "2018-12-31",
metrictype: "pH",
value: 5.88,
farmFarmname: "Noora's farm"
},
{
id: 2,
farmname: "Noora's farm",
datetime: "2018-12-31",
metrictype: "rainFall",
value: 3.1,
farmFarmname: "Noora's farm"
}
]
```
```
https://farmify-api.herokuapp.com/farms/data/limit=2
```

 ```js
 [
{           ↩
id: 3,
farmname: "Noora's farm",
datetime: "2019-01-01",
metrictype: "temperature",
value: -8.3,
farmFarmname: "Noora's farm"
},
{
id: 4,
farmname: "Noora's farm",
datetime: "2019-01-02",
metrictype: "pH",
value: 6.21,
farmFarmname: "Noora's farm"
}
]
 ```

# Technologies Used

| Name                    | Usage in Project           |  
| :--------               | :---------             | 
| [Express](https://expressjs.com/) | simplified server implementation with Nodejs ( Js runtime)   |          
| [csv-parser](https://www.npmjs.com/package/csv-parser)   | used for streaming and parsing csv data files       | 
| [Sequelize](https://sequelize.org/) |  allowed the usage of Javascript object for querying Postgres db instead of using sql directly |  
| [multer](https://github.com/expressjs/multer) |   used for uploading csv data files to the server   |  
| [jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken)    |    generates a signed token for a user after a successful login |  
| [bcrypt](https://www.npmjs.com/package/bcrypt)              |   for hashing user's password, keeping it secure                   |
| [pg](https://www.npmjs.com/package/supertest)  |  A Postgres client for Nodejs, for communication with the relational database    |  
| [umzug](https://github.com/sequelize/umzug)           |   usesed for database migration          |      
| [GitHub Actions](https://docs.github.com/en/actions) |  used for continuous integration and deployment to Heroku, and test runs        |
| [Jest](https://jestjs.io/)   |   for testing       |  
| [SuperTest]()       |   intended for integration testing (api)   |  
| [TypeScript](https://www.typescriptlang.org/)    |  used for strict type checking to minimize coding errors       |  
| [Postgres](https://www.postgresql.org/)    |    for persisting data to db   |           


# Installations
You can test the backend from the APIs provided above, since the service is already deployed to [Heroku](heroku.com). If your choose to run the application locally, the following set up is required:

## Prerequisites
* [Node.js](https://nodejs.org/en/) is required, at least version **14.16**; node version **16.x** was used for this project
* [Postgres database setup](https://www.postgresqltutorial.com/install-postgresql/) for Windows, Mac and Linux. This project was done on Windows

## Configurations
The following evvironment varialble should be configured before running the server. this setup should be implemented after the project has been cloned.
**create a .env file at the root of the project with the following content**
```js
PORT=['Your port number here'] // e.g 3001
TOKEN_SECRET="specify your secret word here" // this will be used by jsonwebtoken for generating a signed token
// these credentials are used to create a farm onwner and farm for the existing csv data files used for initializing the database
// when the application is first run
FAKE_FARMER="your name or any name" // e.g Sarita
FAKE_FARMER_PASSWORD="some password" 
DATABASE_URL="your database url connection string" // Connection URL format: postgres://username:password@hostname/databasename 

```
## Clone and Run the Server
Clone or download the project to your local device and navigate to the root directory of the project using the terminal
```bash
git clone https://github.com/ambeche/farmify-backend.git
cd farmify-backend
npm install // add .env file before running npm install to install all the project dependencies
// remember to add the .env file containing your configs at the root of this project
```
### Start Script  ```npm start```
Will run the server in production mode. If you forgot to add the .env file before npm install for the first time, this will fail.
**Run** **```npm run postinstall```** to rebuild the project, then **```npm start```**.
Or **```npm run tsc && npm start```**

### ```npm run dev``` will run the service in development mode
When running in dev mode, the run might fail due to a db migration file that exits if tables have been created already.
a temporal fix is to **comment out the ```runDbMigration``` function in file ./src/utils/db.ts and run again**

### ```npm run test``` will run the tests
Not all the desired tests where implemented due to time constrain.

The local server will run at address **```http://localhost:3001/farms```** assuming your set the **```PORT```** to **```3001```**

--- **Viola!** ---
