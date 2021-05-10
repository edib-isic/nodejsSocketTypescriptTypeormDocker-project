import config from "config";
import { Connection, createConnection } from "typeorm";
let connection: Connection;

export const initConnection = async () => {
  connection = await createConnection({
    type: "mysql",
    host: "users-service-db",
    username: "root",
    password: "password",
    database: "db",
    synchronize: false,
    logging: false,
    entities: ["src/db/entities/*.ts"],
    migrations: ["src/db/migrations/*.ts"],
    cli: {
      entitiesDir: "src/db/entities",
      migrationsDir: "src/db/migrations",
    },
  });
};




const getConnection = () => connection;

export default getConnection;
