import {Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn} from "typeorm";

@Entity()
export class Purchase {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    evoucher: number

    @Column({ nullable: true })
    name: string;

    @Column()
    user: string;

    @Column()
    phone: string;

    @Column()
    is_gift: boolean;

    @Column()
    quantity: number;

    @Column()
    amount: number;

    @Column()
    @CreateDateColumn()
    createdAt: Date;
  
    @Column()
    @UpdateDateColumn()
    updatedAt: Date;

}
