import {Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Unique} from "typeorm";

@Entity()
@Unique(["code"])
export class Code {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    evoucher: number

    @Column()
    user: string;

    @Column()
    phone: string;

    @Column()
    code: string;

    @Column({ nullable: true }) 
    qr: string;

    @Column()
    amount: number;

    @Column({ default: false })
	used: boolean;

    @Column()
    @CreateDateColumn()
    createdAt: Date;
  
    @Column()
    @UpdateDateColumn()
    updatedAt: Date;

}
