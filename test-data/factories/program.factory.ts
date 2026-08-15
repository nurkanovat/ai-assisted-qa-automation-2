import { faker } from '@faker-js/faker';

export type ProgramInput = {
  name: string;
  description: string;
};

/** Happy-path program payload with a unique name safe for parallel runs. */
export function buildProgram(overrides: Partial<ProgramInput> = {}): ProgramInput {
  const topic = faker.helpers.arrayElement([
    'Web Development',
    'Data Science',
    'Computer Science',
  ]);
  const year = faker.number.int({ min: 2024, max: 2030 });

  return {
    name: overrides.name ?? `${topic} ${year}-${faker.string.alphanumeric(6)}`,
    description:
      overrides.description ??
      faker.lorem.sentence({ min: 8, max: 16 }),
    ...overrides,
  };
}
