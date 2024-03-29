import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './schemas/user.schema';
import { Seeder, DataFactory } from 'nestjs-seeder';

@Injectable()
export class UsersSeeder implements Seeder {
    constructor(@InjectModel(User.name) private readonly user: Model<User>) {}

    async seed(): Promise<any> {
        // Generate 10 users.
        const users = DataFactory.createForClass(User).generate(10);
        users.forEach((user) => {
            console.log(user);
        });

        // Insert into the database.
        return this.user.insertMany(users);
    }

    async drop(): Promise<any> {
        return this.user.deleteMany({});
    }

    async seedWithAmount({ amount = 10 }: { amount?: number }): Promise<any> {
        const users = DataFactory.createForClass(User).generate(amount);

        // Insert into the database.
        return this.user.insertMany(users);
    }
}
