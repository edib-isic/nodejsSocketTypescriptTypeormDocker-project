import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import User from "./User";

@Entity("userSessions")
export default class UserSession {
  @PrimaryGeneratedColumn("uuid")
  id: string;
  @CreateDateColumn()
  createdAt: string;

  @Column("datetime")
  expiresAt: string;

  @ManyToOne(() => User, (user) => user.userSessions)
  user: User;
}
