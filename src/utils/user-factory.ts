import { User } from '../interfaces/interfaces';

export const generateUserData = async (isFull: boolean = false, customSeed?: number): Promise<User> => {
  const { faker } = await import('@faker-js/faker');

  const envSeed = process.env.TEST_DATA_SEED?.trim();
  const seedValue = customSeed ?? (envSeed ? Number(envSeed) : Math.floor(Math.random() * 1_000_000));

  // Seed used for data generation
  console.log(`[DATA GENERATION] Seed used: ${seedValue}`);

  faker.seed(seedValue);

  const user: User = {
    name: faker.person.fullName(),
    email: `${faker.internet.username().toLowerCase()}.${Date.now()}@example.com`,
    password: faker.internet.password({ length: 12 }),
    first_name: faker.person.firstName(),
    last_name: faker.person.lastName(),
    address1: faker.location.streetAddress(),
    country: faker.helpers.arrayElement(['India', 'United States', 'Canada', 'Australia', 'Israel', 'New Zealand', 'Singapore']),
    zipcode: faker.location.zipCode(),
    state: faker.location.state(),
    city: faker.location.city(),
    mobile_number: faker.phone.number()
  };

  if (isFull) {
    const birthFullDate = faker.date.birthdate({ min: 18, max: 65, mode: 'age' });

    return {
      ...user,
      title: faker.helpers.arrayElement(['Mr.', 'Mrs.']),
      birth_day: birthFullDate.getDate().toString(),
      birth_month: (birthFullDate.getMonth() + 1).toString(),
      birth_year: birthFullDate.getFullYear().toString(),
      company: faker.company.name(),
      address2: faker.location.secondaryAddress(),
      newsletter: true,
      offers: true
    };
  }

  return user;
};
