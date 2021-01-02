import {Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class Evoucher {

    @PrimaryGeneratedColumn()
    id: number;

	@Column()
	title: string;

	@Column({ nullable: true })
    description: string;
    
    @Column()
    expiry_date: Date

    @Column({ nullable: true })
    image: string;

    @Column()
    amount: number;

    @Column()
    discount_method: number;

    @Column()
	discount_percent: number;

	@Column()
    total_quantity: number;

    @Column({ nullable: true })
    current_quantity: number;

    @Column({default: false})
    is_gift: boolean;    

    @Column({ default: 0 })
    user_limit: number;

    @Column({ default: 0 })
    gift_limit: number;

    @Column({default: true})
    is_active: boolean;

    @Column()
    @CreateDateColumn()
    createdAt: Date;
  
    @Column()
    @UpdateDateColumn()
    updatedAt: Date;

}
