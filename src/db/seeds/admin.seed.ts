import { ROLE, User } from '../../modules/user/entities';
import { Connection } from 'typeorm';
import { Factory, Seeder } from 'typeorm-seeding';
import * as bcrypt from 'bcryptjs';

export default class CreateAdmin implements Seeder {
  public async run(factory: Factory, connection: Connection): Promise<any> {
    const hashPassword = await bcrypt.hash('ronaldo', 5);
    await connection
      .createQueryBuilder()
      .insert()
      .into(User)
      .values([
        {
          firstName: 'David',
          lastName: 'Meyer',
          email: 'davidmeyer58@outlook.com',
          password: hashPassword,
          role: ROLE.ADMIN,
          emailVerifiedAt: new Date(),
        },
      ])
      .execute();
  }
}
