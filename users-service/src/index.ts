import "reflect-metadata";

import { initConnection } from "#root/db/connection";

import startServer from "#root/server/startServer";

initConnection().then(() => {
    startServer();
    // console.log("DB Connection established");
  });