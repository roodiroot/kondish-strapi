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

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'components.characteristics': ComponentsCharacteristics;
    }
  }
}
