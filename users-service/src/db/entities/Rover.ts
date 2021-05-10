import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToOne,
  JoinColumn,
} from "typeorm";
import User from "./User";
import UserSession from "./UserSession";

@Entity("rovers")
export default class Rover {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  //   @Column("char", { length: 36 })
  //   sessionId: string;

  @CreateDateColumn()
  createdAt: string;

  @Column("datetime")
  expiresAt: string;

  @ManyToOne(() => User, (user) => user.rovers)
  user: User;

  @OneToOne(() => UserSession)
  @JoinColumn()
  userSession: UserSession;

  @Column("char", { length: 64 })
  typ: string;

  @Column("bigint")
  energy: BigInteger;

  @Column("char", { length: 64 })
  status: string;
}
