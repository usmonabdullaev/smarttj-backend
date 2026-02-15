import { CreateAttributeDto } from 'src/modules/attributes/dto/create-attribute.dto';

export const ATTRIBUTES: CreateAttributeDto[] = [
  {
    name: 'Объем встроенной памяти',
    slug: 'obyom-vstroennoy-pamyati',
    type: 'NUMBER',
    unit: 'ГБ',
    order: 1,
    filterable: true,
    values: [
      {
        valueNumber: 64,
      },
      {
        valueNumber: 128,
      },
      {
        valueNumber: 256,
      },
      {
        valueNumber: 512,
      },
      {
        valueNumber: 1024,
      },
      {
        valueNumber: 2048,
      },
    ],
  },
  {
    name: 'Объем оперативной памяти',
    slug: 'obyom-operativnoy-pamyati',
    type: 'NUMBER',
    unit: 'ГБ',
    order: 2,
    filterable: true,
    values: [
      {
        valueNumber: 3,
      },
      {
        valueNumber: 4,
      },
      {
        valueNumber: 6,
      },
      {
        valueNumber: 8,
      },
      {
        valueNumber: 12,
      },
      {
        valueNumber: 16,
      },
      {
        valueNumber: 24,
      },
    ],
  },
  {
    name: 'Операционная система',
    slug: 'operatsionnaya-sistema',
    type: 'STRING',
    order: 3,
    filterable: true,
    values: [
      {
        valueString: 'Android',
      },
      {
        valueString: 'iOS',
      },
    ],
  },
  {
    name: 'Год релиза',
    slug: 'god-reliza',
    type: 'NUMBER',
    order: 4,
    filterable: true,
    values: [
      {
        valueNumber: 2021,
      },
      {
        valueNumber: 2022,
      },
      {
        valueNumber: 2023,
      },
      {
        valueNumber: 2024,
      },
      {
        valueNumber: 2025,
      },
      {
        valueNumber: 2026,
      },
    ],
  },
];
