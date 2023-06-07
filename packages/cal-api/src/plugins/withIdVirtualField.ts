const withIdVirtualField = (schema) => {
  schema.set("toJSON", {
    virtuals: true,
    transform: (_doc, ret) => {
      ret.id = ret._id;
    },
  });
};

export { withIdVirtualField };
