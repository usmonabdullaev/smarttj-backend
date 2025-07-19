export class CreateProductDto {
  title: string;

  description: string;

  warranty?: number;

  categoryId: string;

  brandId: string;

  modelId: string;

  regionId: string;

  attributes: {
    attributeId: string;
    attributeValueId: string;
  }[];
}

export class CreateProductVariantDto {
  productId: string;

  price: number;

  discount?: number;

  images: {
    url: string;
    alt?: string;
    order: number;
  }[];

  attributes: {
    attributeId: string;
    attributeValueId: string;
  }[];
}
