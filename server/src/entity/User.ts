import { Field, ObjectType } from "type-graphql"
import { Entity, PrimaryGeneratedColumn, Column } from "typeorm"
import { BaseEntity } from "typeorm"

@ObjectType()
@Entity()
export class User {
    @Field({ nullable: true }) 
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    firstName: string

    @Column()
    lastName: string

}
