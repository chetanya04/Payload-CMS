import { CollectionConfig } from "payload";

const Workflows: CollectionConfig = {
  slug: 'workflows',
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'targetCollection',
      type: 'text',
      required: true,
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
    },
  ],
};

export default Workflows;