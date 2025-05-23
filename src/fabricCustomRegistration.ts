import { fabric } from 'fabric';

declare module 'fabric/fabric-impl' {
  interface Circle {
    attributes?: {
      number?: string | number;
      price?: string | number;
      category?: string;
      status?: string;
      currencySymbol?: string;
      currencyCode?: string;
      currencyCountry?: string;
    };
    seatNumber?: string | number;
    price?: string | number;
    category?: string;
    status?: string;
    currencySymbol?: string;
    currencyCode?: string;
    currencyCountry?: string;
  }
}

// Extend Circle (seat) to include attributes object
fabric.Circle.prototype.toObject = (function (toObject) {
  return function (this: fabric.Circle, propertiesToInclude = []) {
    return {
      ...toObject.call(this, propertiesToInclude),
      attributes: {
        number: this.attributes?.number ?? this.seatNumber ?? '',
        price: this.attributes?.price ?? this.price ?? '',
        category: this.attributes?.category ?? this.category ?? '',
        status: this.attributes?.status ?? this.status ?? '',
        currencySymbol:
          this.attributes?.currencySymbol ?? this.currencySymbol ?? '',
        currencyCode: this.attributes?.currencyCode ?? this.currencyCode ?? '',
        currencyCountry:
          this.attributes?.currencyCountry ?? this.currencyCountry ?? '',
      },
    };
  };
})(fabric.Circle.prototype.toObject);

// Restore attributes on fromObject/initialize
const origInitialize = fabric.Circle.prototype.initialize;
fabric.Circle.prototype.initialize = function (
  this: fabric.Circle,
  options: any
) {
  origInitialize.call(this, options);
  if (options && options.attributes) {
    this.attributes = { ...options.attributes };
    this.seatNumber = options.attributes.number;
    this.price = options.attributes.price;
    this.category = options.attributes.category;
    this.status = options.attributes.status;
    this.currencySymbol = options.attributes.currencySymbol;
    this.currencyCode = options.attributes.currencyCode;
    this.currencyCountry = options.attributes.currencyCountry;
  }
  return this;
};
