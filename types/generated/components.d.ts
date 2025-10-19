import type { Schema, Struct } from '@strapi/strapi';

export interface ComponentsCharacteristics extends Struct.ComponentSchema {
  collectionName: 'components_components_characteristics';
  info: {
    displayName: 'Characteristics';
    icon: 'apps';
  };
  attributes: {
    description: Schema.Attribute.String;
    Title: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Unique;
  };
}

export interface ComponentsReviews extends Struct.ComponentSchema {
  collectionName: 'components_components_reviews';
  info: {
    displayName: 'reviews';
    icon: 'feather';
  };
  attributes: {
    count: Schema.Attribute.Integer;
    grade: Schema.Attribute.Decimal &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMax<
        {
          max: 5;
          min: 0;
        },
        number
      > &
      Schema.Attribute.DefaultTo<0>;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'components.characteristics': ComponentsCharacteristics;
      'components.reviews': ComponentsReviews;
    }
  }
}
