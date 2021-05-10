import {Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn} from "typeorm";
import Rover from "./Rover";
import UserSession from "./UserSession";

@Entity("users")
export default class User {

    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    username: string;

    @Column({ select:false})
    passwordHash: string;

    @CreateDateColumn()
    createdAt: string;

    @OneToMany(() => Rover, rover => rover.user, { cascade: true })
    rovers: Rover[];
 
    @OneToMany(type => UserSession, userSession => userSession.user, { cascade: true })
    userSessions: UserSession[];
}