import { Entity, Column, Generated, PrimaryGeneratedColumn, BaseEntity } from "typeorm";

@Entity()
export class Plugins extends BaseEntity {

    @Column()
    @Generated("increment")
    id!: number;

    @PrimaryGeneratedColumn("uuid")
    pluginId!: number;

    @Column({
        length: 50
    })
    name!: string;

    @Column()
    version!: string;

    @Column()
    isActive!: boolean;

    @Column()
    created!: number;

    @Column()
    updated!: number;

}