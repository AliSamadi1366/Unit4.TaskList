import { faker } from "@faker-js/faker";
import db from "#db/client";

import { createTask } from "#db/queries/tasks";
import { createUser } from "#db/queries/users";

await db.connect();
await seed();
await db.end();
console.log("🌱 Database seeded.");

async function seed() {
  for (let i = 0; i < 5; i++) {
    const fakeUser = {
      username: faker.person.fullName(),
      password: faker.string.sample(),
    };
    const user = await createUser(fakeUser.username, fakeUser.password);
    for (let e = 0; e < 20; e++) {
      const task = {
        title: faker.book.title(),
        done: false,
        userId: user.id,
      };
      await createTask(task);
    }
  }
}
