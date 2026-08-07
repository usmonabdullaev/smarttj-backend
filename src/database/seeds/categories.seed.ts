import { Category, PrismaClient } from '@prisma/client';

import { CATEGORIES, CreateCategoriesDto } from './data/categories.data';

export const seedCategories = async (prisma: PrismaClient) => {
  console.log(' → Seeding categories...');

  const categoriesCount = await prisma.category.count();

  if (categoriesCount === 0) {
    const seedFn = async (
      categories: CreateCategoriesDto[],
      parent?: Category,
    ) => {
      for (let index = 0; index < categories.length; index++) {
        const category = categories[index];

        const created = await prisma.category.create({
          data: {
            name: category.name,
            short_name: category.short_name,
            slug: category.slug,
            order: category.order,
            parentId: parent?.id ?? null,
            parentKey: parent?.id ?? 'ROOT',
          },
        });

        if (category.attributes?.length) {
          for (let j = 0; j < category.attributes.length; j++) {
            const attribute = category.attributes[j];

            await prisma.attribute.create({
              data: {
                categoryId: created.id,
                name: attribute.name,
                type: attribute.type,
                unit: attribute.unit,
                required: attribute.required,
                filterable: attribute.filterable,
                order: attribute.order,
                values: {
                  createMany: {
                    data:
                      attribute.values?.map((v) => ({
                        valueString: v.valueString,
                        valueNumber: v.valueNumber,
                        valueBoolean: v.valueBoolean,
                        label: v.label,
                      })) || [],
                  },
                },
              },
            });
          }
        }

        if (category.children?.length) {
          await seedFn(category.children, created);
        }
      }
    };

    await seedFn(CATEGORIES);
  }
};
