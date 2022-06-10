import { Field, ObjectType } from "type-graphql"
import { Entity, PrimaryGeneratedColumn, Column, EntityRepository, CreateDateColumn, UpdateDateColumn } from "typeorm"

@ObjectType()
@Entity()
export class User {
    @Field({ nullable: true })
    @PrimaryGeneratedColumn()
    id: number

    @Field()
    @Column({ unique: true, nullable: true })
    email!: string;

    @Column({ nullable: true })
    password!: string;

    @Field({ nullable: true })
    @Column({ nullable: true })
    firstName: string

    @Field({ nullable: true })
    @Column({ nullable: true })
    lastName: string

    @Field(() => String)
    @CreateDateColumn()
    createdAt: Date;

    @Field(() => String)
    @UpdateDateColumn()
    updatedAt: Date;
}
