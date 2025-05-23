import { fabric } from 'fabric';

// Extend Circle (seat) to include attributes object
fabric.Circle.prototype.toObject = (function (toObject) {
  return function (propertiesToInclude = []) {
    return {
      ...toObject.call(this, propertiesToInclude),
      attributes: {
        number: this.attributes?.number ?? this.seatNumber ?? '',
        price: this.attributes?.price ?? this.price ?? '',
        category: this.attributes?.category ?? this.category ?? '',
        status: this.attributes?.status ?? this.status ?? '',
        currencySymbol: this.attributes?.currencySymbol ?? this.currencySymbol ?? '',
        // add more as needed
      }
    };
  };
})(fabric.Circle.prototype.toObject);

// Restore attributes on fromObject/initialize
const origInitialize = fabric.Circle.prototype.initialize;
fabric.Circle.prototype.initialize = function (options: any) {
  origInitialize.call(this, options);
  if (options && options.attributes) {
    this.attributes = { ...options.attributes };
    // Optionally, for backward compatibility, set top-level props too:
    this.seatNumber = options.attributes.number;
    this.price = options.attributes.price;
    this.category = options.attributes.category;
    this.status = options.attributes.status;
    this.currencySymbol = options.attributes.currencySymbol;
  }
}; 