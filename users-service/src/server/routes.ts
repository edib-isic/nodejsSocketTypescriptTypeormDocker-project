import config from "config";
import dayjs from "dayjs";
import { Express } from "express";
import omit from "lodash.omit";
import { createQueryBuilder, getConnection, getRepository } from "typeorm";

import User from "#root/db/entities/User";
import UserSession from "#root/db/entities/UserSession";
import generateUUID from "#root/helpers/generateUUID";
import hashPassword from "#root/helpers/hashPassword";
import passwordCompareSync from "#root/helpers/passwordCompareSync";
import Rover from "#root/db/entities/Rover";

const USER_SESSION_EXPIRY_HOURS = <number>(
  config.get("USER_SESSION_EXPIRY_HOURS")
);

const setupRoutes = (app: Express) => {
  const connection = getConnection();
  const userRepository = getRepository(User);
  const userSessionRepository = getRepository(UserSession);
  const roverRepository = getRepository(Rover);

  //GET ALL FREE ROVERS
  app.get("/getFreeRovers", async (req, res, next) => {
    if (!req.body.typ || !req.body.energy || !req.body.status) {
      return next(new Error("Invalid body!"));
    }

    try {
      const rovers = await getRepository(Rover)
        .createQueryBuilder("rover")
        .where("rover.userSessionId = :userSessionId", {
          userSessionId: "NULL",
        })
        .orWhere("rover.userId = :userId", { userId: "NULL" })
        .orWhere("rover.typ != :satellite", { satellite: "satellite" })
        .orWhere("rover.energy >= :energy", { energy: "50" })
        .orWhere("rover.status = :status", { status: "WARNINGS" })
        .getMany();

      if (rovers.length == 0) {
        return next(new Error("no matches found in rovers pool !"));
      }
      return res.json(rovers);
    } catch (err) {
      console.log("Error getFreeRovers " + err);
      return next(err);
    }
  });
  //add new rover
  app.post("/addRover", async (req, res, next) => {
    if (!req.body.typ || !req.body.energy || !req.body.status) {
      return next(new Error("Invalid body!"));
    }
    try {
      const expiresAt = dayjs()
        .add(USER_SESSION_EXPIRY_HOURS, "hour")
        .toISOString();

      const sessionToken = generateUUID();

      const rover = {
        expiresAt,
        id: sessionToken,
        typ: req.body.typ,
        energy: req.body.energy,
        status: req.body.status,
      };

      await connection
        .createQueryBuilder()
        .insert()
        .into(Rover)
        .values([rover])
        .execute();

      return res.json(rover);
    } catch (err) {
      return next(err);
    }
  });

  //start new spaceSession by userId and roverId
  app.post("/startSession", async (req, res, next) => {
    if (!req.body.userId || !req.body.roverId) {
      return next(new Error("Invalid body!"));
    }

    try {
      const user = await userRepository
        .createQueryBuilder("user")
        .where({
          id: req.body.userId,
        })
        .getOne();
      if (!user) return next(new Error("Invalid userId!"));

      const rover = await roverRepository
        .createQueryBuilder("rover")
        .where({ id: req.body.roverId })
        .getOne();
      if (!rover) return next(new Error("Invalid roverId!"));

      rover.user = user;

      const expiresAt = dayjs()
        .add(USER_SESSION_EXPIRY_HOURS, "hour")
        .toISOString();
      const createdAt = dayjs().hour().toString();
      const sessionToken = generateUUID();

      const userSession = {
        createdAt: createdAt,
        expiresAt: expiresAt,
        id: sessionToken,
        user: user,
      };
      rover.userSession = userSession;

      await getConnection()
        .createQueryBuilder()
        .insert()
        .into(UserSession)
        .values({ user: user, createdAt: createdAt, expiresAt: expiresAt })
        .execute();

      await getConnection()
        .createQueryBuilder()
        .update(Rover)
        .set({
          userSession: rover.userSession,
          user: rover.user,
          expiresAt: rover.expiresAt,
          createdAt: rover.createdAt,
        })
        .where("id = :id", { id: rover.id })
        .execute();

      console.log(
        " userSession : " +
          rover.userSession?.id +
          "rover user " +
          rover.user +
          "user typ " +
          rover.typ
      );
      return res.json(rover);
    } catch (err) {
      return next(err);
    }
  });

  //delete sessionById
  app.delete("  ", async (req, res, next) => {
    try {
      const userSession = await userSessionRepository.findOne(
        req.params.sessionId
      );

      if (!userSession) return next(new Error("Invalid session ID"));

      await userSessionRepository.remove(userSession);
      console.log("session with id :req.params.sessionId deleted");
      return res.end();
    } catch (err) {
      return next(err);
    }
  });
  //get a session by sessionId
  app.get("/sessions/:sessionId", async (req, res, next) => {
    try {
      const userSession = await userSessionRepository.findOne(
        req.params.sessionId,
        { relations: ["user"] }
      );

      if (!userSession) return next(new Error("Invalid session ID"));

      return res.status(200).json({userSession, message : "SpaceSession with relations"});
    } catch (err) {
      return res.status(404).json("404 error");
    }
  });
  //create new user
  app.post("/users", async (req, res, next) => {
    if (!req.body.username || !req.body.password) {
      return next(new Error("Invalid body!"));
    }
    try {
      const newUser = {
        id: generateUUID(),
        passwordHash: hashPassword(req.body.password),
        username: req.body.username,
      };
      await connection
        .createQueryBuilder()
        .insert()
        .into(User)
        .values([newUser])
        .execute();
      return res.json(omit(newUser, ["passwordHash"]));
    } catch (err) {
      return next(err);
    }
  });
  //get user by id
  app.get("/users/:userId", async (req, res, next) => {
    try {
      const user = await userRepository
        .createQueryBuilder("user")
        .where("user.id = :id", { id: req.params.userId })
        .getOne();

      if (!user) return next(new Error("Invalid user ID!"));

      return res
        .status(200)
        .json({ user: user, message: "the user name is " + user.username });
    } catch (err) {
      return res.status(404).json({
        message: "user record not found",
      });
    }
  });

  //get all users
  app.get("/users", async (req, res, next) => {
    try {
      const users = await userRepository.find({ relations: ["rovers"] });
      // .createQueryBuilder("user")
      // .leftJoinAndMapMany("user.rovers", "rovers")
      // .select("rovers")
      // .getRawMany();

      if (!users) return next(new Error("No users found!"));

      return res.status(200).json({ users: users, message: "the users are" });
    } catch (err) {
      return res.status(404).json({
        message: "no users records",
      });
    }
  });

  //get rovers by userId
  app.get("/rovers/:userId", async (req, res, next) => {
    try {
      const rovers = await roverRepository
        .createQueryBuilder("rover")
        .where("rover.userId = :id", { id: req.params.userId })
        .getMany();

      if (!rovers) return next(new Error("NO rover for this userID! :userId"));

      return res.json({ rovers, message: "all the rovers from one user" });
    } catch (err) {
      return next(err);
    }
  });

  //cancellSession by sessionId
  app.delete("/cancellSession", async (req, res, next) => {
    try {
      const userSession = await userSessionRepository
        .createQueryBuilder("userSession")
        .delete()
        .from(UserSession)
        .where("id = :id", { id: req.body.sessionId })
        .execute();

      const rover = await roverRepository
        .createQueryBuilder("rover")
        .update(Rover)
        .set({ userSession: undefined, user: undefined })
        .where("userSessionId = :userSessionId", {
          userSessionId: req.body.sessionId,
        })
        .execute();
      return res.status(200).json({ rover, message: "spaceSession deleted" });
    } catch (err) {
      return next(err);
    }
  });
};

export default setupRoutes;
