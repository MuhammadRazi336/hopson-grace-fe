/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable eslint-comments/no-unlimited-disable */
/* eslint-disable */
import type * as StorefrontAPI from '@shopify/hydrogen/storefront-api-types';

export type MoneyFragment = Pick<
  StorefrontAPI.MoneyV2,
  'currencyCode' | 'amount'
>;

export type CartLineFragment = Pick<
  StorefrontAPI.CartLine,
  'id' | 'quantity'
> & {
  attributes: Array<Pick<StorefrontAPI.Attribute, 'key' | 'value'>>;
  cost: {
    totalAmount: Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>;
    amountPerQuantity: Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>;
    compareAtAmountPerQuantity?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>
    >;
  };
  merchandise: Pick<
    StorefrontAPI.ProductVariant,
    'id' | 'availableForSale' | 'requiresShipping' | 'title'
  > & {
    compareAtPrice?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>
    >;
    price: Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>;
    image?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.Image, 'id' | 'url' | 'altText' | 'width' | 'height'>
    >;
    product: Pick<StorefrontAPI.Product, 'handle' | 'title' | 'id' | 'vendor'>;
    selectedOptions: Array<
      Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
    >;
  };
};

export type CartLineComponentFragment = Pick<
  StorefrontAPI.ComponentizableCartLine,
  'id' | 'quantity'
> & {
  attributes: Array<Pick<StorefrontAPI.Attribute, 'key' | 'value'>>;
  cost: {
    totalAmount: Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>;
    amountPerQuantity: Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>;
    compareAtAmountPerQuantity?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>
    >;
  };
  merchandise: Pick<
    StorefrontAPI.ProductVariant,
    'id' | 'availableForSale' | 'requiresShipping' | 'title'
  > & {
    compareAtPrice?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>
    >;
    price: Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>;
    image?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.Image, 'id' | 'url' | 'altText' | 'width' | 'height'>
    >;
    product: Pick<StorefrontAPI.Product, 'handle' | 'title' | 'id' | 'vendor'>;
    selectedOptions: Array<
      Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
    >;
  };
};

export type CartApiQueryFragment = Pick<
  StorefrontAPI.Cart,
  'updatedAt' | 'id' | 'checkoutUrl' | 'totalQuantity' | 'note'
> & {
  appliedGiftCards: Array<
    Pick<StorefrontAPI.AppliedGiftCard, 'lastCharacters'> & {
      amountUsed: Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>;
    }
  >;
  buyerIdentity: Pick<
    StorefrontAPI.CartBuyerIdentity,
    'countryCode' | 'email' | 'phone'
  > & {
    customer?: StorefrontAPI.Maybe<
      Pick<
        StorefrontAPI.Customer,
        'id' | 'email' | 'firstName' | 'lastName' | 'displayName'
      >
    >;
  };
  lines: {
    nodes: Array<
      | (Pick<StorefrontAPI.CartLine, 'id' | 'quantity'> & {
          attributes: Array<Pick<StorefrontAPI.Attribute, 'key' | 'value'>>;
          cost: {
            totalAmount: Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>;
            amountPerQuantity: Pick<
              StorefrontAPI.MoneyV2,
              'currencyCode' | 'amount'
            >;
            compareAtAmountPerQuantity?: StorefrontAPI.Maybe<
              Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>
            >;
          };
          merchandise: Pick<
            StorefrontAPI.ProductVariant,
            'id' | 'availableForSale' | 'requiresShipping' | 'title'
          > & {
            compareAtPrice?: StorefrontAPI.Maybe<
              Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>
            >;
            price: Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>;
            image?: StorefrontAPI.Maybe<
              Pick<
                StorefrontAPI.Image,
                'id' | 'url' | 'altText' | 'width' | 'height'
              >
            >;
            product: Pick<
              StorefrontAPI.Product,
              'handle' | 'title' | 'id' | 'vendor'
            >;
            selectedOptions: Array<
              Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
            >;
          };
        })
      | (Pick<StorefrontAPI.ComponentizableCartLine, 'id' | 'quantity'> & {
          attributes: Array<Pick<StorefrontAPI.Attribute, 'key' | 'value'>>;
          cost: {
            totalAmount: Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>;
            amountPerQuantity: Pick<
              StorefrontAPI.MoneyV2,
              'currencyCode' | 'amount'
            >;
            compareAtAmountPerQuantity?: StorefrontAPI.Maybe<
              Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>
            >;
          };
          merchandise: Pick<
            StorefrontAPI.ProductVariant,
            'id' | 'availableForSale' | 'requiresShipping' | 'title'
          > & {
            compareAtPrice?: StorefrontAPI.Maybe<
              Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>
            >;
            price: Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>;
            image?: StorefrontAPI.Maybe<
              Pick<
                StorefrontAPI.Image,
                'id' | 'url' | 'altText' | 'width' | 'height'
              >
            >;
            product: Pick<
              StorefrontAPI.Product,
              'handle' | 'title' | 'id' | 'vendor'
            >;
            selectedOptions: Array<
              Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
            >;
          };
        })
    >;
  };
  cost: {
    subtotalAmount: Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>;
    totalAmount: Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>;
    totalDutyAmount?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>
    >;
    totalTaxAmount?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>
    >;
  };
  attributes: Array<Pick<StorefrontAPI.Attribute, 'key' | 'value'>>;
  discountCodes: Array<
    Pick<StorefrontAPI.CartDiscountCode, 'code' | 'applicable'>
  >;
};

export type MenuItemFragment = Pick<
  StorefrontAPI.MenuItem,
  'id' | 'resourceId' | 'tags' | 'title' | 'type' | 'url'
>;

export type ChildMenuItemFragment = Pick<
  StorefrontAPI.MenuItem,
  'id' | 'resourceId' | 'tags' | 'title' | 'type' | 'url'
>;

export type ParentMenuItemFragment = Pick<
  StorefrontAPI.MenuItem,
  'id' | 'resourceId' | 'tags' | 'title' | 'type' | 'url'
> & {
  items: Array<
    Pick<
      StorefrontAPI.MenuItem,
      'id' | 'resourceId' | 'tags' | 'title' | 'type' | 'url'
    >
  >;
};

export type MenuFragment = Pick<StorefrontAPI.Menu, 'id'> & {
  items: Array<
    Pick<
      StorefrontAPI.MenuItem,
      'id' | 'resourceId' | 'tags' | 'title' | 'type' | 'url'
    > & {
      items: Array<
        Pick<
          StorefrontAPI.MenuItem,
          'id' | 'resourceId' | 'tags' | 'title' | 'type' | 'url'
        >
      >;
    }
  >;
};

export type ShopFragment = Pick<
  StorefrontAPI.Shop,
  'id' | 'name' | 'description'
> & {
  primaryDomain: Pick<StorefrontAPI.Domain, 'url'>;
  brand?: StorefrontAPI.Maybe<{
    logo?: StorefrontAPI.Maybe<{
      image?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Image, 'url'>>;
    }>;
  }>;
};

export type HeaderQueryVariables = StorefrontAPI.Exact<{
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  headerMenuHandle: StorefrontAPI.Scalars['String']['input'];
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
}>;

export type HeaderQuery = {
  shop: Pick<StorefrontAPI.Shop, 'id' | 'name' | 'description'> & {
    primaryDomain: Pick<StorefrontAPI.Domain, 'url'>;
    brand?: StorefrontAPI.Maybe<{
      logo?: StorefrontAPI.Maybe<{
        image?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Image, 'url'>>;
      }>;
    }>;
  };
  menu?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Menu, 'id'> & {
      items: Array<
        Pick<
          StorefrontAPI.MenuItem,
          'id' | 'resourceId' | 'tags' | 'title' | 'type' | 'url'
        > & {
          items: Array<
            Pick<
              StorefrontAPI.MenuItem,
              'id' | 'resourceId' | 'tags' | 'title' | 'type' | 'url'
            >
          >;
        }
      >;
    }
  >;
};

export type FooterQueryVariables = StorefrontAPI.Exact<{
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  footerMenuHandle: StorefrontAPI.Scalars['String']['input'];
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
}>;

export type FooterQuery = {
  menu?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Menu, 'id'> & {
      items: Array<
        Pick<
          StorefrontAPI.MenuItem,
          'id' | 'resourceId' | 'tags' | 'title' | 'type' | 'url'
        > & {
          items: Array<
            Pick<
              StorefrontAPI.MenuItem,
              'id' | 'resourceId' | 'tags' | 'title' | 'type' | 'url'
            >
          >;
        }
      >;
    }
  >;
};

export type GetCollectionsForNavQueryVariables = StorefrontAPI.Exact<{
  [key: string]: never;
}>;

export type GetCollectionsForNavQuery = {
  collections: {
    nodes: Array<
      Pick<
        StorefrontAPI.Collection,
        'id' | 'title' | 'handle' | 'description'
      > & {
        image?: StorefrontAPI.Maybe<
          Pick<
            StorefrontAPI.Image,
            'id' | 'url' | 'altText' | 'width' | 'height'
          >
        >;
        parentCollectionMetafield?: StorefrontAPI.Maybe<
          Pick<StorefrontAPI.Metafield, 'id' | 'value'>
        >;
        readyMadeMetafield?: StorefrontAPI.Maybe<
          Pick<StorefrontAPI.Metafield, 'id' | 'value'>
        >;
      }
    >;
  };
};

export type StoreRobotsQueryVariables = StorefrontAPI.Exact<{
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
}>;

export type StoreRobotsQuery = {shop: Pick<StorefrontAPI.Shop, 'id'>};

export type GetSubCollectionsQueryVariables = StorefrontAPI.Exact<{
  ids:
    | Array<StorefrontAPI.Scalars['ID']['input']>
    | StorefrontAPI.Scalars['ID']['input'];
}>;

export type GetSubCollectionsQuery = {
  nodes: Array<
    StorefrontAPI.Maybe<
      Pick<
        StorefrontAPI.Collection,
        'id' | 'title' | 'handle' | 'description'
      > & {
        image?: StorefrontAPI.Maybe<
          Pick<
            StorefrontAPI.Image,
            'id' | 'url' | 'altText' | 'width' | 'height'
          >
        >;
      }
    >
  >;
};

export type GetNavigationBrandsQueryVariables = StorefrontAPI.Exact<{
  [key: string]: never;
}>;

export type GetNavigationBrandsQuery = {
  collections: {
    nodes: Array<
      Pick<
        StorefrontAPI.Collection,
        'id' | 'title' | 'handle' | 'description'
      > & {
        image?: StorefrontAPI.Maybe<
          Pick<
            StorefrontAPI.Image,
            'id' | 'url' | 'altText' | 'width' | 'height'
          >
        >;
        metafield?: StorefrontAPI.Maybe<
          Pick<StorefrontAPI.Metafield, 'id' | 'value'>
        >;
      }
    >;
  };
};

export type GetNavigationCollectionsQueryVariables = StorefrontAPI.Exact<{
  [key: string]: never;
}>;

export type GetNavigationCollectionsQuery = {
  collections: {
    nodes: Array<
      Pick<
        StorefrontAPI.Collection,
        'id' | 'title' | 'handle' | 'description'
      > & {
        image?: StorefrontAPI.Maybe<
          Pick<
            StorefrontAPI.Image,
            'id' | 'url' | 'altText' | 'width' | 'height'
          >
        >;
        parentCollectionMetafield?: StorefrontAPI.Maybe<
          Pick<StorefrontAPI.Metafield, 'id' | 'value'>
        >;
        readyMadeMetafield?: StorefrontAPI.Maybe<
          Pick<StorefrontAPI.Metafield, 'id' | 'value'>
        >;
      }
    >;
  };
};

export type ArticleQueryVariables = StorefrontAPI.Exact<{
  articleHandle: StorefrontAPI.Scalars['String']['input'];
  blogHandle: StorefrontAPI.Scalars['String']['input'];
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
}>;

export type ArticleQuery = {
  blog?: StorefrontAPI.Maybe<{
    articleByHandle?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.Article, 'title' | 'contentHtml' | 'publishedAt'> & {
        author?: StorefrontAPI.Maybe<Pick<StorefrontAPI.ArticleAuthor, 'name'>>;
        image?: StorefrontAPI.Maybe<
          Pick<
            StorefrontAPI.Image,
            'id' | 'altText' | 'url' | 'width' | 'height'
          >
        >;
        metafield?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Metafield, 'value'>>;
        seo?: StorefrontAPI.Maybe<
          Pick<StorefrontAPI.Seo, 'description' | 'title'>
        >;
      }
    >;
  }>;
};

export type BlogsQueryVariables = StorefrontAPI.Exact<{
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  endCursor?: StorefrontAPI.InputMaybe<
    StorefrontAPI.Scalars['String']['input']
  >;
  first?: StorefrontAPI.InputMaybe<StorefrontAPI.Scalars['Int']['input']>;
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
  last?: StorefrontAPI.InputMaybe<StorefrontAPI.Scalars['Int']['input']>;
  startCursor?: StorefrontAPI.InputMaybe<
    StorefrontAPI.Scalars['String']['input']
  >;
}>;

export type BlogsQuery = {
  blogs: {
    pageInfo: Pick<
      StorefrontAPI.PageInfo,
      'hasNextPage' | 'hasPreviousPage' | 'startCursor' | 'endCursor'
    >;
    nodes: Array<
      Pick<StorefrontAPI.Blog, 'title' | 'handle'> & {
        seo?: StorefrontAPI.Maybe<
          Pick<StorefrontAPI.Seo, 'title' | 'description'>
        >;
      }
    >;
  };
};

export type GetBrandQueryVariables = StorefrontAPI.Exact<{
  handle: StorefrontAPI.Scalars['String']['input'];
}>;

export type GetBrandQuery = {
  collection?: StorefrontAPI.Maybe<
    Pick<
      StorefrontAPI.Collection,
      'id' | 'title' | 'handle' | 'description'
    > & {
      image?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.Image, 'id' | 'url' | 'altText' | 'width' | 'height'>
      >;
      metafield?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.Metafield, 'id' | 'value'>
      >;
      products: {
        pageInfo: Pick<
          StorefrontAPI.PageInfo,
          'hasNextPage' | 'hasPreviousPage'
        >;
        edges: Array<{
          node: Pick<
            StorefrontAPI.Product,
            'id' | 'title' | 'handle' | 'description'
          > & {
            images: {
              edges: Array<{
                node: Pick<
                  StorefrontAPI.Image,
                  'id' | 'url' | 'altText' | 'width' | 'height'
                >;
              }>;
            };
            variants: {
              edges: Array<{
                node: Pick<
                  StorefrontAPI.ProductVariant,
                  'id' | 'availableForSale'
                > & {
                  priceV2: Pick<
                    StorefrontAPI.MoneyV2,
                    'amount' | 'currencyCode'
                  >;
                };
              }>;
            };
          };
        }>;
      };
    }
  >;
};

export type GetBrandsForMarqueeQueryVariables = StorefrontAPI.Exact<{
  [key: string]: never;
}>;

export type GetBrandsForMarqueeQuery = {
  collections: {
    nodes: Array<
      Pick<
        StorefrontAPI.Collection,
        'id' | 'title' | 'handle' | 'description'
      > & {
        image?: StorefrontAPI.Maybe<
          Pick<
            StorefrontAPI.Image,
            'id' | 'url' | 'altText' | 'width' | 'height'
          >
        >;
        metafield?: StorefrontAPI.Maybe<
          Pick<StorefrontAPI.Metafield, 'id' | 'value'>
        >;
      }
    >;
  };
};

export type GetCashFundsForCashFundsQueryVariables = StorefrontAPI.Exact<{
  [key: string]: never;
}>;

export type GetCashFundsForCashFundsQuery = {
  collections: {
    nodes: Array<
      Pick<
        StorefrontAPI.Collection,
        'id' | 'title' | 'handle' | 'description'
      > & {
        image?: StorefrontAPI.Maybe<
          Pick<
            StorefrontAPI.Image,
            'id' | 'url' | 'altText' | 'width' | 'height'
          >
        >;
        metafield?: StorefrontAPI.Maybe<
          Pick<StorefrontAPI.Metafield, 'id' | 'value'>
        >;
        products: {
          edges: Array<{
            node: Pick<
              StorefrontAPI.Product,
              'id' | 'title' | 'handle' | 'description'
            > & {
              images: {
                edges: Array<{
                  node: Pick<
                    StorefrontAPI.Image,
                    'id' | 'url' | 'altText' | 'width' | 'height'
                  >;
                }>;
              };
              variants: {
                edges: Array<{
                  node: Pick<
                    StorefrontAPI.ProductVariant,
                    'id' | 'availableForSale'
                  > & {
                    priceV2: Pick<
                      StorefrontAPI.MoneyV2,
                      'amount' | 'currencyCode'
                    >;
                  };
                }>;
              };
            };
          }>;
        };
      }
    >;
  };
};

export type MoneyProductItemFragment = Pick<
  StorefrontAPI.MoneyV2,
  'amount' | 'currencyCode'
>;

export type ProductItemFragment = Pick<
  StorefrontAPI.Product,
  'id' | 'handle' | 'title'
> & {
  featuredImage?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Image, 'id' | 'altText' | 'url' | 'width' | 'height'>
  >;
  priceRange: {
    minVariantPrice: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
    maxVariantPrice: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
  };
  variants: {
    nodes: Array<{
      selectedOptions: Array<
        Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
      >;
    }>;
  };
};

export type CollectionQueryVariables = StorefrontAPI.Exact<{
  handle: StorefrontAPI.Scalars['String']['input'];
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
  first?: StorefrontAPI.InputMaybe<StorefrontAPI.Scalars['Int']['input']>;
  last?: StorefrontAPI.InputMaybe<StorefrontAPI.Scalars['Int']['input']>;
  startCursor?: StorefrontAPI.InputMaybe<
    StorefrontAPI.Scalars['String']['input']
  >;
  endCursor?: StorefrontAPI.InputMaybe<
    StorefrontAPI.Scalars['String']['input']
  >;
}>;

export type CollectionQuery = {
  collection?: StorefrontAPI.Maybe<
    Pick<
      StorefrontAPI.Collection,
      'id' | 'handle' | 'title' | 'description'
    > & {
      products: {
        nodes: Array<
          Pick<StorefrontAPI.Product, 'id' | 'handle' | 'title'> & {
            featuredImage?: StorefrontAPI.Maybe<
              Pick<
                StorefrontAPI.Image,
                'id' | 'altText' | 'url' | 'width' | 'height'
              >
            >;
            priceRange: {
              minVariantPrice: Pick<
                StorefrontAPI.MoneyV2,
                'amount' | 'currencyCode'
              >;
              maxVariantPrice: Pick<
                StorefrontAPI.MoneyV2,
                'amount' | 'currencyCode'
              >;
            };
            variants: {
              nodes: Array<{
                selectedOptions: Array<
                  Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
                >;
              }>;
            };
          }
        >;
        pageInfo: Pick<
          StorefrontAPI.PageInfo,
          'hasPreviousPage' | 'hasNextPage' | 'endCursor' | 'startCursor'
        >;
      };
    }
  >;
};

export type CollectionFragment = Pick<
  StorefrontAPI.Collection,
  'id' | 'title' | 'handle'
> & {
  image?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Image, 'id' | 'url' | 'altText' | 'width' | 'height'>
  >;
};

export type StoreCollectionsQueryVariables = StorefrontAPI.Exact<{
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  endCursor?: StorefrontAPI.InputMaybe<
    StorefrontAPI.Scalars['String']['input']
  >;
  first?: StorefrontAPI.InputMaybe<StorefrontAPI.Scalars['Int']['input']>;
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
  last?: StorefrontAPI.InputMaybe<StorefrontAPI.Scalars['Int']['input']>;
  startCursor?: StorefrontAPI.InputMaybe<
    StorefrontAPI.Scalars['String']['input']
  >;
}>;

export type StoreCollectionsQuery = {
  collections: {
    nodes: Array<
      Pick<StorefrontAPI.Collection, 'id' | 'title' | 'handle'> & {
        image?: StorefrontAPI.Maybe<
          Pick<
            StorefrontAPI.Image,
            'id' | 'url' | 'altText' | 'width' | 'height'
          >
        >;
      }
    >;
    pageInfo: Pick<
      StorefrontAPI.PageInfo,
      'hasNextPage' | 'hasPreviousPage' | 'startCursor' | 'endCursor'
    >;
  };
};

export type CatalogQueryVariables = StorefrontAPI.Exact<{
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
  first?: StorefrontAPI.InputMaybe<StorefrontAPI.Scalars['Int']['input']>;
  last?: StorefrontAPI.InputMaybe<StorefrontAPI.Scalars['Int']['input']>;
  startCursor?: StorefrontAPI.InputMaybe<
    StorefrontAPI.Scalars['String']['input']
  >;
  endCursor?: StorefrontAPI.InputMaybe<
    StorefrontAPI.Scalars['String']['input']
  >;
}>;

export type CatalogQuery = {
  products: {
    nodes: Array<
      Pick<StorefrontAPI.Product, 'id' | 'handle' | 'title'> & {
        featuredImage?: StorefrontAPI.Maybe<
          Pick<
            StorefrontAPI.Image,
            'id' | 'altText' | 'url' | 'width' | 'height'
          >
        >;
        priceRange: {
          minVariantPrice: Pick<
            StorefrontAPI.MoneyV2,
            'amount' | 'currencyCode'
          >;
          maxVariantPrice: Pick<
            StorefrontAPI.MoneyV2,
            'amount' | 'currencyCode'
          >;
        };
        variants: {
          nodes: Array<{
            selectedOptions: Array<
              Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
            >;
          }>;
        };
      }
    >;
    pageInfo: Pick<
      StorefrontAPI.PageInfo,
      'hasPreviousPage' | 'hasNextPage' | 'startCursor' | 'endCursor'
    >;
  };
};

export type GetProductByHandleQueryVariables = StorefrontAPI.Exact<{
  handle: StorefrontAPI.Scalars['String']['input'];
}>;

export type GetProductByHandleQuery = {
  productByHandle?: StorefrontAPI.Maybe<
    Pick<
      StorefrontAPI.Product,
      'id' | 'title' | 'descriptionHtml' | 'description'
    > & {
      images: {edges: Array<{node: Pick<StorefrontAPI.Image, 'id' | 'src'>}>};
      variants: {
        edges: Array<{
          node: Pick<StorefrontAPI.ProductVariant, 'id' | 'title'> & {
            price: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
          };
        }>;
      };
    }
  >;
};

export type GetRealRegistriesQueryVariables = StorefrontAPI.Exact<{
  [key: string]: never;
}>;

export type GetRealRegistriesQuery = {
  collections: {
    nodes: Array<
      Pick<
        StorefrontAPI.Collection,
        'id' | 'title' | 'handle' | 'description'
      > & {
        image?: StorefrontAPI.Maybe<
          Pick<
            StorefrontAPI.Image,
            'id' | 'url' | 'altText' | 'width' | 'height'
          >
        >;
        readyMadeMetafield?: StorefrontAPI.Maybe<
          Pick<StorefrontAPI.Metafield, 'id' | 'value'>
        >;
        parentCollectionMetafield?: StorefrontAPI.Maybe<
          Pick<StorefrontAPI.Metafield, 'id' | 'value'>
        >;
        subCollectionMetafield?: StorefrontAPI.Maybe<
          Pick<StorefrontAPI.Metafield, 'id' | 'value'>
        >;
      }
    >;
  };
};

export type GetDashboardSubCollectionQueryVariables = StorefrontAPI.Exact<{
  id: StorefrontAPI.Scalars['ID']['input'];
}>;

export type GetDashboardSubCollectionQuery = {
  collection?: StorefrontAPI.Maybe<
    Pick<
      StorefrontAPI.Collection,
      'id' | 'title' | 'handle' | 'description'
    > & {
      image?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.Image, 'id' | 'url' | 'altText' | 'width' | 'height'>
      >;
      products: {
        edges: Array<{
          node: Pick<
            StorefrontAPI.Product,
            'id' | 'title' | 'handle' | 'description' | 'createdAt'
          > & {
            images: {
              edges: Array<{node: Pick<StorefrontAPI.Image, 'id' | 'url'>}>;
            };
            variants: {
              edges: Array<{
                node: Pick<
                  StorefrontAPI.ProductVariant,
                  'id' | 'availableForSale'
                > & {
                  priceV2: Pick<
                    StorefrontAPI.MoneyV2,
                    'amount' | 'currencyCode'
                  >;
                };
              }>;
            };
          };
        }>;
      };
    }
  >;
};

export type GetGiftCardsQueryVariables = StorefrontAPI.Exact<{
  [key: string]: never;
}>;

export type GetGiftCardsQuery = {
  collections: {
    nodes: Array<
      Pick<
        StorefrontAPI.Collection,
        'id' | 'title' | 'handle' | 'description'
      > & {
        image?: StorefrontAPI.Maybe<
          Pick<
            StorefrontAPI.Image,
            'id' | 'url' | 'altText' | 'width' | 'height'
          >
        >;
        metafield?: StorefrontAPI.Maybe<
          Pick<StorefrontAPI.Metafield, 'id' | 'value'>
        >;
        products: {
          edges: Array<{
            node: Pick<
              StorefrontAPI.Product,
              'id' | 'title' | 'handle' | 'description'
            > & {
              images: {
                edges: Array<{
                  node: Pick<
                    StorefrontAPI.Image,
                    'id' | 'url' | 'altText' | 'width' | 'height'
                  >;
                }>;
              };
              variants: {
                edges: Array<{
                  node: Pick<
                    StorefrontAPI.ProductVariant,
                    'id' | 'availableForSale'
                  > & {
                    priceV2: Pick<
                      StorefrontAPI.MoneyV2,
                      'amount' | 'currencyCode'
                    >;
                  };
                }>;
              };
            };
          }>;
        };
      }
    >;
  };
};

export type GetCashFundsForDreamFundQueryVariables = StorefrontAPI.Exact<{
  [key: string]: never;
}>;

export type GetCashFundsForDreamFundQuery = {
  collections: {
    nodes: Array<
      Pick<
        StorefrontAPI.Collection,
        'id' | 'title' | 'handle' | 'description'
      > & {
        image?: StorefrontAPI.Maybe<
          Pick<
            StorefrontAPI.Image,
            'id' | 'url' | 'altText' | 'width' | 'height'
          >
        >;
        metafield?: StorefrontAPI.Maybe<
          Pick<StorefrontAPI.Metafield, 'id' | 'value'>
        >;
        products: {
          edges: Array<{
            node: Pick<
              StorefrontAPI.Product,
              'id' | 'title' | 'handle' | 'description'
            > & {
              images: {
                edges: Array<{
                  node: Pick<
                    StorefrontAPI.Image,
                    'id' | 'url' | 'altText' | 'width' | 'height'
                  >;
                }>;
              };
              variants: {
                edges: Array<{
                  node: Pick<
                    StorefrontAPI.ProductVariant,
                    'id' | 'availableForSale'
                  > & {
                    priceV2: Pick<
                      StorefrontAPI.MoneyV2,
                      'amount' | 'currencyCode'
                    >;
                  };
                }>;
              };
            };
          }>;
        };
      }
    >;
  };
};

export type GetHomeSubCollectionQueryVariables = StorefrontAPI.Exact<{
  id: StorefrontAPI.Scalars['ID']['input'];
}>;

export type GetHomeSubCollectionQuery = {
  collection?: StorefrontAPI.Maybe<
    Pick<
      StorefrontAPI.Collection,
      'id' | 'title' | 'handle' | 'description'
    > & {
      image?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.Image, 'id' | 'url' | 'altText' | 'width' | 'height'>
      >;
      products: {
        edges: Array<{
          node: Pick<
            StorefrontAPI.Product,
            'id' | 'title' | 'handle' | 'description'
          > & {
            images: {
              edges: Array<{node: Pick<StorefrontAPI.Image, 'id' | 'url'>}>;
            };
            variants: {
              edges: Array<{
                node: Pick<
                  StorefrontAPI.ProductVariant,
                  'id' | 'availableForSale'
                > & {
                  priceV2: Pick<
                    StorefrontAPI.MoneyV2,
                    'amount' | 'currencyCode'
                  >;
                };
              }>;
            };
          };
        }>;
      };
    }
  >;
};

export type GetHomeBrandsQueryVariables = StorefrontAPI.Exact<{
  [key: string]: never;
}>;

export type GetHomeBrandsQuery = {
  collections: {
    nodes: Array<
      Pick<
        StorefrontAPI.Collection,
        'id' | 'title' | 'handle' | 'description'
      > & {
        image?: StorefrontAPI.Maybe<
          Pick<
            StorefrontAPI.Image,
            'id' | 'url' | 'altText' | 'width' | 'height'
          >
        >;
        metafield?: StorefrontAPI.Maybe<
          Pick<StorefrontAPI.Metafield, 'id' | 'value'>
        >;
      }
    >;
  };
};

export type GetAllBlogsAndArticlesForInspirationQueryVariables =
  StorefrontAPI.Exact<{[key: string]: never}>;

export type GetAllBlogsAndArticlesForInspirationQuery = {
  blogs: {
    nodes: Array<
      Pick<StorefrontAPI.Blog, 'title' | 'handle'> & {
        articles: {
          nodes: Array<
            Pick<
              StorefrontAPI.Article,
              'id' | 'title' | 'handle' | 'publishedAt' | 'contentHtml'
            > & {image?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Image, 'url'>>}
          >;
        };
      }
    >;
  };
};

export type CollectionsQueryVariables = StorefrontAPI.Exact<{
  [key: string]: never;
}>;

export type CollectionsQuery = {
  collections: {
    nodes: Array<
      Pick<StorefrontAPI.Collection, 'id' | 'title' | 'description'> & {
        image?: StorefrontAPI.Maybe<
          Pick<
            StorefrontAPI.Image,
            'id' | 'url' | 'altText' | 'width' | 'height'
          >
        >;
        metafield?: StorefrontAPI.Maybe<
          Pick<StorefrontAPI.Metafield, 'key' | 'value' | 'namespace' | 'type'>
        >;
        subCollections?: StorefrontAPI.Maybe<
          Pick<StorefrontAPI.Metafield, 'value'>
        >;
        readyMadeMetafield?: StorefrontAPI.Maybe<
          Pick<StorefrontAPI.Metafield, 'id' | 'value'>
        >;
      }
    >;
  };
};

export type GetOurBrandsQueryVariables = StorefrontAPI.Exact<{
  [key: string]: never;
}>;

export type GetOurBrandsQuery = {
  collections: {
    nodes: Array<
      Pick<
        StorefrontAPI.Collection,
        'id' | 'title' | 'handle' | 'description'
      > & {
        image?: StorefrontAPI.Maybe<
          Pick<
            StorefrontAPI.Image,
            'id' | 'url' | 'altText' | 'width' | 'height'
          >
        >;
        metafield?: StorefrontAPI.Maybe<
          Pick<StorefrontAPI.Metafield, 'id' | 'value'>
        >;
        products: {
          edges: Array<{
            node: Pick<
              StorefrontAPI.Product,
              'id' | 'title' | 'handle' | 'description'
            > & {
              images: {
                edges: Array<{
                  node: Pick<
                    StorefrontAPI.Image,
                    'id' | 'url' | 'altText' | 'width' | 'height'
                  >;
                }>;
              };
              variants: {
                edges: Array<{
                  node: Pick<
                    StorefrontAPI.ProductVariant,
                    'id' | 'availableForSale'
                  > & {
                    priceV2: Pick<
                      StorefrontAPI.MoneyV2,
                      'amount' | 'currencyCode'
                    >;
                  };
                }>;
              };
            };
          }>;
        };
      }
    >;
  };
};

export type PageQueryVariables = StorefrontAPI.Exact<{
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  handle: StorefrontAPI.Scalars['String']['input'];
}>;

export type PageQuery = {
  page?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Page, 'id' | 'title' | 'body'> & {
      seo?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.Seo, 'description' | 'title'>
      >;
    }
  >;
};

export type PolicyFragment = Pick<
  StorefrontAPI.ShopPolicy,
  'body' | 'handle' | 'id' | 'title' | 'url'
>;

export type PolicyQueryVariables = StorefrontAPI.Exact<{
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
  privacyPolicy: StorefrontAPI.Scalars['Boolean']['input'];
  refundPolicy: StorefrontAPI.Scalars['Boolean']['input'];
  shippingPolicy: StorefrontAPI.Scalars['Boolean']['input'];
  termsOfService: StorefrontAPI.Scalars['Boolean']['input'];
}>;

export type PolicyQuery = {
  shop: {
    privacyPolicy?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.ShopPolicy, 'body' | 'handle' | 'id' | 'title' | 'url'>
    >;
    shippingPolicy?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.ShopPolicy, 'body' | 'handle' | 'id' | 'title' | 'url'>
    >;
    termsOfService?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.ShopPolicy, 'body' | 'handle' | 'id' | 'title' | 'url'>
    >;
    refundPolicy?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.ShopPolicy, 'body' | 'handle' | 'id' | 'title' | 'url'>
    >;
  };
};

export type PolicyItemFragment = Pick<
  StorefrontAPI.ShopPolicy,
  'id' | 'title' | 'handle'
>;

export type PoliciesQueryVariables = StorefrontAPI.Exact<{
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
}>;

export type PoliciesQuery = {
  shop: {
    privacyPolicy?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.ShopPolicy, 'id' | 'title' | 'handle'>
    >;
    shippingPolicy?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.ShopPolicy, 'id' | 'title' | 'handle'>
    >;
    termsOfService?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.ShopPolicy, 'id' | 'title' | 'handle'>
    >;
    refundPolicy?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.ShopPolicy, 'id' | 'title' | 'handle'>
    >;
    subscriptionPolicy?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.ShopPolicyWithDefault, 'id' | 'title' | 'handle'>
    >;
  };
};

export type GetCashFundsForPorteTravelQueryVariables = StorefrontAPI.Exact<{
  [key: string]: never;
}>;

export type GetCashFundsForPorteTravelQuery = {
  collections: {
    nodes: Array<
      Pick<
        StorefrontAPI.Collection,
        'id' | 'title' | 'handle' | 'description'
      > & {
        image?: StorefrontAPI.Maybe<
          Pick<
            StorefrontAPI.Image,
            'id' | 'url' | 'altText' | 'width' | 'height'
          >
        >;
        metafield?: StorefrontAPI.Maybe<
          Pick<StorefrontAPI.Metafield, 'id' | 'value'>
        >;
        products: {
          edges: Array<{
            node: Pick<
              StorefrontAPI.Product,
              'id' | 'title' | 'handle' | 'description'
            > & {
              images: {
                edges: Array<{
                  node: Pick<
                    StorefrontAPI.Image,
                    'id' | 'url' | 'altText' | 'width' | 'height'
                  >;
                }>;
              };
              variants: {
                edges: Array<{
                  node: Pick<
                    StorefrontAPI.ProductVariant,
                    'id' | 'availableForSale'
                  > & {
                    priceV2: Pick<
                      StorefrontAPI.MoneyV2,
                      'amount' | 'currencyCode'
                    >;
                  };
                }>;
              };
            };
          }>;
        };
      }
    >;
  };
};

export type GetReadyMadeRegistriesQueryVariables = StorefrontAPI.Exact<{
  [key: string]: never;
}>;

export type GetReadyMadeRegistriesQuery = {
  collections: {
    nodes: Array<
      Pick<
        StorefrontAPI.Collection,
        'id' | 'title' | 'handle' | 'description'
      > & {
        image?: StorefrontAPI.Maybe<
          Pick<
            StorefrontAPI.Image,
            'id' | 'url' | 'altText' | 'width' | 'height'
          >
        >;
        readyMadeMetafield?: StorefrontAPI.Maybe<
          Pick<StorefrontAPI.Metafield, 'id' | 'value'>
        >;
        parentCollectionMetafield?: StorefrontAPI.Maybe<
          Pick<StorefrontAPI.Metafield, 'id' | 'value'>
        >;
        subCollectionMetafield?: StorefrontAPI.Maybe<
          Pick<StorefrontAPI.Metafield, 'id' | 'value'>
        >;
      }
    >;
  };
};

export type GetReadyMadeSubCollectionQueryVariables = StorefrontAPI.Exact<{
  id: StorefrontAPI.Scalars['ID']['input'];
}>;

export type GetReadyMadeSubCollectionQuery = {
  collection?: StorefrontAPI.Maybe<
    Pick<
      StorefrontAPI.Collection,
      'id' | 'title' | 'handle' | 'description'
    > & {
      image?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.Image, 'id' | 'url' | 'altText' | 'width' | 'height'>
      >;
      products: {
        edges: Array<{
          node: Pick<
            StorefrontAPI.Product,
            'id' | 'title' | 'handle' | 'description'
          > & {
            images: {
              edges: Array<{node: Pick<StorefrontAPI.Image, 'id' | 'url'>}>;
            };
            variants: {
              edges: Array<{
                node: Pick<
                  StorefrontAPI.ProductVariant,
                  'id' | 'availableForSale'
                > & {
                  priceV2: Pick<
                    StorefrontAPI.MoneyV2,
                    'amount' | 'currencyCode'
                  >;
                };
              }>;
            };
          };
        }>;
      };
    }
  >;
};

export type GetRegistryQueryVariables = StorefrontAPI.Exact<{
  handle: StorefrontAPI.Scalars['String']['input'];
}>;

export type GetRegistryQuery = {
  collection?: StorefrontAPI.Maybe<
    Pick<
      StorefrontAPI.Collection,
      'id' | 'title' | 'handle' | 'description'
    > & {
      image?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.Image, 'id' | 'url' | 'altText' | 'width' | 'height'>
      >;
      products: {
        edges: Array<{
          node: Pick<
            StorefrontAPI.Product,
            'id' | 'title' | 'handle' | 'description'
          > & {
            images: {
              edges: Array<{
                node: Pick<
                  StorefrontAPI.Image,
                  'id' | 'url' | 'altText' | 'width' | 'height'
                >;
              }>;
            };
            variants: {
              edges: Array<{
                node: Pick<
                  StorefrontAPI.ProductVariant,
                  'id' | 'availableForSale'
                > & {
                  priceV2: Pick<
                    StorefrontAPI.MoneyV2,
                    'amount' | 'currencyCode'
                  >;
                };
              }>;
            };
          };
        }>;
      };
    }
  >;
};

export type GetOtherRegistriesQueryVariables = StorefrontAPI.Exact<{
  [key: string]: never;
}>;

export type GetOtherRegistriesQuery = {
  collections: {
    nodes: Array<
      Pick<
        StorefrontAPI.Collection,
        'id' | 'title' | 'handle' | 'description'
      > & {
        image?: StorefrontAPI.Maybe<
          Pick<
            StorefrontAPI.Image,
            'id' | 'url' | 'altText' | 'width' | 'height'
          >
        >;
        readyMadeMetafield?: StorefrontAPI.Maybe<
          Pick<StorefrontAPI.Metafield, 'id' | 'value'>
        >;
        parentCollectionMetafield?: StorefrontAPI.Maybe<
          Pick<StorefrontAPI.Metafield, 'id' | 'value'>
        >;
      }
    >;
  };
};

export type GetCashFundsForSearchQueryVariables = StorefrontAPI.Exact<{
  [key: string]: never;
}>;

export type GetCashFundsForSearchQuery = {
  collections: {
    nodes: Array<
      Pick<
        StorefrontAPI.Collection,
        'id' | 'title' | 'handle' | 'description'
      > & {
        image?: StorefrontAPI.Maybe<
          Pick<
            StorefrontAPI.Image,
            'id' | 'url' | 'altText' | 'width' | 'height'
          >
        >;
        metafield?: StorefrontAPI.Maybe<
          Pick<StorefrontAPI.Metafield, 'id' | 'value'>
        >;
        products: {
          edges: Array<{
            node: Pick<
              StorefrontAPI.Product,
              'id' | 'title' | 'handle' | 'description'
            > & {
              images: {
                edges: Array<{
                  node: Pick<
                    StorefrontAPI.Image,
                    'id' | 'url' | 'altText' | 'width' | 'height'
                  >;
                }>;
              };
              variants: {
                edges: Array<{
                  node: Pick<
                    StorefrontAPI.ProductVariant,
                    'id' | 'availableForSale'
                  > & {
                    priceV2: Pick<
                      StorefrontAPI.MoneyV2,
                      'amount' | 'currencyCode'
                    >;
                  };
                }>;
              };
            };
          }>;
        };
      }
    >;
  };
};

export type GetAllBlogsAndArticlesForSearchQueryVariables =
  StorefrontAPI.Exact<{[key: string]: never}>;

export type GetAllBlogsAndArticlesForSearchQuery = {
  blogs: {
    nodes: Array<
      Pick<StorefrontAPI.Blog, 'title' | 'handle'> & {
        articles: {
          nodes: Array<
            Pick<
              StorefrontAPI.Article,
              'id' | 'title' | 'handle' | 'publishedAt' | 'contentHtml'
            > & {
              image?: StorefrontAPI.Maybe<
                Pick<
                  StorefrontAPI.Image,
                  'id' | 'url' | 'altText' | 'width' | 'height'
                >
              >;
              metafield?: StorefrontAPI.Maybe<
                Pick<StorefrontAPI.Metafield, 'value'>
              >;
            }
          >;
        };
      }
    >;
  };
};

interface GeneratedQueryTypes {
  '#graphql\n  fragment Shop on Shop {\n    id\n    name\n    description\n    primaryDomain {\n      url\n    }\n    brand {\n      logo {\n        image {\n          url\n        }\n      }\n    }\n  }\n  query Header(\n    $country: CountryCode\n    $headerMenuHandle: String!\n    $language: LanguageCode\n  ) @inContext(language: $language, country: $country) {\n    shop {\n      ...Shop\n    }\n    menu(handle: $headerMenuHandle) {\n      ...Menu\n    }\n  }\n  #graphql\n  fragment MenuItem on MenuItem {\n    id\n    resourceId\n    tags\n    title\n    type\n    url\n  }\n  fragment ChildMenuItem on MenuItem {\n    ...MenuItem\n  }\n  fragment ParentMenuItem on MenuItem {\n    ...MenuItem\n    items {\n      ...ChildMenuItem\n    }\n  }\n  fragment Menu on Menu {\n    id\n    items {\n      ...ParentMenuItem\n    }\n  }\n\n': {
    return: HeaderQuery;
    variables: HeaderQueryVariables;
  };
  '#graphql\n  query Footer(\n    $country: CountryCode\n    $footerMenuHandle: String!\n    $language: LanguageCode\n  ) @inContext(language: $language, country: $country) {\n    menu(handle: $footerMenuHandle) {\n      ...Menu\n    }\n  }\n  #graphql\n  fragment MenuItem on MenuItem {\n    id\n    resourceId\n    tags\n    title\n    type\n    url\n  }\n  fragment ChildMenuItem on MenuItem {\n    ...MenuItem\n  }\n  fragment ParentMenuItem on MenuItem {\n    ...MenuItem\n    items {\n      ...ChildMenuItem\n    }\n  }\n  fragment Menu on Menu {\n    id\n    items {\n      ...ParentMenuItem\n    }\n  }\n\n': {
    return: FooterQuery;
    variables: FooterQueryVariables;
  };
  '#graphql\n      query getCollectionsForNav {\n        collections(first: 250) {\n          nodes {\n            id\n            title\n            handle\n            description\n            image {\n              id\n              url\n              altText\n              width\n              height\n            }\n            parentCollectionMetafield: metafield(namespace: "parent", key: "collection") {\n              id\n              value\n            }\n            readyMadeMetafield: metafield(namespace: "custom", key: "ready_made") {\n              id\n              value\n            }\n          }\n        }\n      }\n    ': {
    return: GetCollectionsForNavQuery;
    variables: GetCollectionsForNavQueryVariables;
  };
  '#graphql\n  query StoreRobots($country: CountryCode, $language: LanguageCode)\n   @inContext(country: $country, language: $language) {\n    shop {\n      id\n    }\n  }\n': {
    return: StoreRobotsQuery;
    variables: StoreRobotsQueryVariables;
  };
  '#graphql\n        query GetSubCollections($ids: [ID!]!) {\n          nodes(ids: $ids) {\n            ... on Collection {\n              id\n              title\n              handle\n              description\n              image {\n                id\n                url\n                altText\n                width\n                height\n              }\n            }\n          }\n        }\n      ': {
    return: GetSubCollectionsQuery;
    variables: GetSubCollectionsQueryVariables;
  };
  '#graphql\n        query getNavigationBrands {\n          collections(first: 250) {\n            nodes {\n              id\n              title\n              handle\n              description\n              image {\n                id\n                url\n                altText\n                width\n                height\n              }\n              metafield(namespace: "custom", key: "brand") {\n                id\n                value\n              }\n            }\n          }\n        }\n      ': {
    return: GetNavigationBrandsQuery;
    variables: GetNavigationBrandsQueryVariables;
  };
  '#graphql\n        query getNavigationCollections {\n          collections(first: 250) {\n            nodes {\n              id\n              title\n              handle\n              description\n              image {\n                id\n                url\n                altText\n                width\n                height\n              }\n              parentCollectionMetafield: metafield(namespace: "parent", key: "collection") {\n                id\n                value\n              }\n              readyMadeMetafield: metafield(namespace: "custom", key: "ready_made") {\n                id\n                value\n              }\n            }\n          }\n        }\n      ': {
    return: GetNavigationCollectionsQuery;
    variables: GetNavigationCollectionsQueryVariables;
  };
  '#graphql\n  query Article(\n    $articleHandle: String!\n    $blogHandle: String!\n    $country: CountryCode\n    $language: LanguageCode\n  ) @inContext(language: $language, country: $country) {\n    blog(handle: $blogHandle) {\n      articleByHandle(handle: $articleHandle) {\n        title\n        contentHtml\n        publishedAt\n        author: authorV2 {\n          name\n        }\n        image {\n          id\n          altText\n          url\n          width\n          height\n        }\n        metafield(namespace: "custom", key: "userId") {\n          value\n        }\n        seo {\n          description\n          title\n        }\n      }\n    }\n  }\n': {
    return: ArticleQuery;
    variables: ArticleQueryVariables;
  };
  '#graphql\n  query Blogs(\n    $country: CountryCode\n    $endCursor: String\n    $first: Int\n    $language: LanguageCode\n    $last: Int\n    $startCursor: String\n  ) @inContext(country: $country, language: $language) {\n    blogs(\n      first: $first,\n      last: $last,\n      before: $startCursor,\n      after: $endCursor\n    ) {\n      pageInfo {\n        hasNextPage\n        hasPreviousPage\n        startCursor\n        endCursor\n      }\n      nodes {\n        title\n        handle\n        seo {\n          title\n          description\n        }\n      }\n    }\n  }\n': {
    return: BlogsQuery;
    variables: BlogsQueryVariables;
  };
  '#graphql\n  query getBrand($handle: String!) {\n    collection(handle: $handle) {\n      id\n      title\n      handle\n      description\n      image {\n        id\n        url\n        altText\n        width\n        height\n      }\n      metafield(namespace: "custom", key: "brand") {\n        id\n        value\n      }\n      products(first: 20) {\n        pageInfo {\n          hasNextPage\n          hasPreviousPage\n        }\n        edges {\n          node {\n            id\n            title\n            handle\n            description\n            images(first: 10) {\n              edges {\n                node {\n                  id\n                  url\n                  altText\n                  width\n                  height\n                }\n              }\n            }\n            variants(first: 1) {\n              edges {\n                node {\n                  id\n                  availableForSale\n                  priceV2 {\n                    amount\n                    currencyCode\n                  }\n                }\n              }\n            }\n          }\n        }\n      }\n    }\n  }\n': {
    return: GetBrandQuery;
    variables: GetBrandQueryVariables;
  };
  '#graphql\nquery getBrandsForMarquee {\n  collections(first: 250) {\n    nodes {\n      id\n      title\n      handle\n      description\n      image {\n        id\n        url\n        altText\n        width\n        height\n      }\n      metafield(namespace: "custom", key: "brand") {\n        id\n        value\n      }\n    }\n  }\n}': {
    return: GetBrandsForMarqueeQuery;
    variables: GetBrandsForMarqueeQueryVariables;
  };
  '#graphql\nquery getCashFundsForCashFunds {\n  collections(first: 250) {\n    nodes {\n      id\n      title\n      handle\n      description\n      image {\n        id\n        url\n        altText\n        width\n        height\n      }\n      metafield(namespace: "custom", key: "cashfund") {\n        id\n        value\n      }\n      products(first: 10) {\n        edges {\n          node {\n            id\n            title\n            handle\n            description\n            images(first: 10) {\n              edges {\n                node {\n                  id\n                  url\n                  altText\n                  width\n                  height\n                }\n              }\n            }\n            variants(first: 1) {\n              edges {\n                node {\n                  id\n                  availableForSale\n                  priceV2 {\n                    amount\n                    currencyCode\n                  }\n                }\n              }\n            }\n          }\n        }\n      }\n    }\n  }\n}\n': {
    return: GetCashFundsForCashFundsQuery;
    variables: GetCashFundsForCashFundsQueryVariables;
  };
  '#graphql\n  #graphql\n  fragment MoneyProductItem on MoneyV2 {\n    amount\n    currencyCode\n  }\n  fragment ProductItem on Product {\n    id\n    handle\n    title\n    featuredImage {\n      id\n      altText\n      url\n      width\n      height\n    }\n    priceRange {\n      minVariantPrice {\n        ...MoneyProductItem\n      }\n      maxVariantPrice {\n        ...MoneyProductItem\n      }\n    }\n    variants(first: 1) {\n      nodes {\n        selectedOptions {\n          name\n          value\n        }\n      }\n    }\n  }\n\n  query Collection(\n    $handle: String!\n    $country: CountryCode\n    $language: LanguageCode\n    $first: Int\n    $last: Int\n    $startCursor: String\n    $endCursor: String\n  ) @inContext(country: $country, language: $language) {\n    collection(handle: $handle) {\n      id\n      handle\n      title\n      description\n      products(\n        first: $first,\n        last: $last,\n        before: $startCursor,\n        after: $endCursor\n      ) {\n        nodes {\n          ...ProductItem\n        }\n        pageInfo {\n          hasPreviousPage\n          hasNextPage\n          endCursor\n          startCursor\n        }\n      }\n    }\n  }\n': {
    return: CollectionQuery;
    variables: CollectionQueryVariables;
  };
  '#graphql\n  fragment Collection on Collection {\n    id\n    title\n    handle\n    image {\n      id\n      url\n      altText\n      width\n      height\n    }\n  }\n  query StoreCollections(\n    $country: CountryCode\n    $endCursor: String\n    $first: Int\n    $language: LanguageCode\n    $last: Int\n    $startCursor: String\n  ) @inContext(country: $country, language: $language) {\n    collections(\n      first: $first,\n      last: $last,\n      before: $startCursor,\n      after: $endCursor\n    ) {\n      nodes {\n        ...Collection\n      }\n      pageInfo {\n        hasNextPage\n        hasPreviousPage\n        startCursor\n        endCursor\n      }\n    }\n  }\n': {
    return: StoreCollectionsQuery;
    variables: StoreCollectionsQueryVariables;
  };
  '#graphql\n  query Catalog(\n    $country: CountryCode\n    $language: LanguageCode\n    $first: Int\n    $last: Int\n    $startCursor: String\n    $endCursor: String\n  ) @inContext(country: $country, language: $language) {\n    products(first: $first, last: $last, before: $startCursor, after: $endCursor) {\n      nodes {\n        ...ProductItem\n      }\n      pageInfo {\n        hasPreviousPage\n        hasNextPage\n        startCursor\n        endCursor\n      }\n    }\n  }\n  #graphql\n  fragment MoneyProductItem on MoneyV2 {\n    amount\n    currencyCode\n  }\n  fragment ProductItem on Product {\n    id\n    handle\n    title\n    featuredImage {\n      id\n      altText\n      url\n      width\n      height\n    }\n    priceRange {\n      minVariantPrice {\n        ...MoneyProductItem\n      }\n      maxVariantPrice {\n        ...MoneyProductItem\n      }\n    }\n    variants(first: 1) {\n      nodes {\n        selectedOptions {\n          name\n          value\n        }\n      }\n    }\n  }\n\n': {
    return: CatalogQuery;
    variables: CatalogQueryVariables;
  };
  '#graphql\nquery getProductByHandle($handle: String!) {\n  productByHandle(handle: $handle) {\n    id\n    title\n    descriptionHtml\n    description\n    images(first:10) {\n            edges {\n            node {\n            id\n            src\n            }\n            }\n            }\n    variants(first: 10) {\n      edges {\n        node {\n          id\n          title\n           price {\n      amount\n      currencyCode\n    }\n        }\n      }\n    }\n  }\n}': {
    return: GetProductByHandleQuery;
    variables: GetProductByHandleQueryVariables;
  };
  '#graphql\n  query getRealRegistries {\n    collections(first: 250) {\n      nodes {\n        id\n        title\n        handle\n        description\n        image {\n          id\n          url\n          altText\n          width\n          height\n        }\n        readyMadeMetafield: metafield(namespace: "custom", key: "ready_made") {\n          id\n          value\n        }\n        parentCollectionMetafield: metafield(namespace: "parent", key: "collection") {\n          id\n          value\n        }\n        subCollectionMetafield: metafield(namespace: "sub", key: "collection") {\n          id\n          value\n        }\n      }\n    }\n  }': {
    return: GetRealRegistriesQuery;
    variables: GetRealRegistriesQueryVariables;
  };
  '#graphql\n  query getDashboardSubCollection($id: ID!) {\n    collection(id: $id) {\n      id\n      title\n      handle\n      description\n      image {\n        id\n        url\n        altText\n        width\n        height\n      }\n      products(first: 10) {\n        edges {\n          node {\n            id\n            title\n            handle\n            description\n            createdAt\n            images(first: 1) {\n              edges {\n                node {\n                  id\n                  url\n                }\n              }\n            }\n            variants(first: 1) {\n              edges {\n                node {\n                  id\n                  availableForSale\n                  priceV2 {\n                    amount\n                    currencyCode\n                  }\n                }\n              }\n            }\n          }\n        }\n      }\n    }\n  }': {
    return: GetDashboardSubCollectionQuery;
    variables: GetDashboardSubCollectionQueryVariables;
  };
  '#graphql\nquery getGiftCards {\n  collections(first: 250) {\n    nodes {\n      id\n      title\n      handle\n      description\n      image {\n        id\n        url\n        altText\n        width\n        height\n      }\n      metafield(namespace: "custom", key: "giftcard") {\n        id\n        value\n      }\n      products(first: 10) {\n        edges {\n          node {\n            id\n            title\n            handle\n            description\n            images(first: 10) {\n              edges {\n                node {\n                  id\n                  url\n                  altText\n                  width\n                  height\n                }\n              }\n            }\n            variants(first: 1) {\n              edges {\n                node {\n                  id\n                  availableForSale\n                  priceV2 {\n                    amount\n                    currencyCode\n                  }\n                }\n              }\n            }\n          }\n        }\n      }\n    }\n  }\n}\n': {
    return: GetGiftCardsQuery;
    variables: GetGiftCardsQueryVariables;
  };
  '#graphql\nquery getCashFundsForDreamFund {\n  collections(first: 250) {\n    nodes {\n      id\n      title\n      handle\n      description\n      image {\n        id\n        url\n        altText\n        width\n        height\n      }\n      metafield(namespace: "custom", key: "cashfund") {\n        id\n        value\n      }\n      products(first: 10) {\n        edges {\n          node {\n            id\n            title\n            handle\n            description\n            images(first: 10) {\n              edges {\n                node {\n                  id\n                  url\n                  altText\n                  width\n                  height\n                }\n              }\n            }\n            variants(first: 1) {\n              edges {\n                node {\n                  id\n                  availableForSale\n                  priceV2 {\n                    amount\n                    currencyCode\n                  }\n                }\n              }\n            }\n          }\n        }\n      }\n    }\n  }\n}\n': {
    return: GetCashFundsForDreamFundQuery;
    variables: GetCashFundsForDreamFundQueryVariables;
  };
  '#graphql\nquery getRealRegistries {\n  collections(first: 250) {\n    nodes {\n      id\n      title\n      handle\n      description\n      image {\n        id\n        url\n        altText\n        width\n        height\n      }\n       readyMadeMetafield: metafield(namespace: "custom", key: "ready_made") {\n        id\n        value\n      }\n       parentCollectionMetafield: metafield(namespace: "parent", key: "collection") {\n        id\n        value\n      }\n       subCollectionMetafield: metafield(namespace: "sub", key: "collection") {\n        id\n        value\n      }\n     }\n   }\n }\n': {
    return: GetRealRegistriesQuery;
    variables: GetRealRegistriesQueryVariables;
  };
  '#graphql\nquery getHomeSubCollection($id: ID!) {\n  collection(id: $id) {\n    id\n    title\n    handle\n    description\n    image {\n      id\n      url\n      altText\n      width\n      height\n    }\n    products(first: 10) {\n      edges {\n        node {\n          id\n          title\n          handle\n          description\n          images(first: 1) {\n            edges {\n              node {\n                id\n                url\n              }\n            }\n          }\n          variants(first: 1) {\n            edges {\n              node {\n                id\n                availableForSale\n                priceV2 {\n                  amount\n                  currencyCode\n                }\n              }\n            }\n          }\n        }\n      }\n    }\n  }\n}': {
    return: GetHomeSubCollectionQuery;
    variables: GetHomeSubCollectionQueryVariables;
  };
  '#graphql\nquery getHomeBrands {\n  collections(first: 250) {\n    nodes {\n      id\n      title\n      handle\n      description\n      image {\n        id\n        url\n        altText\n        width\n        height\n      }\n      metafield(namespace: "custom", key: "brand") {\n        id\n        value\n      }\n    }\n  }\n}': {
    return: GetHomeBrandsQuery;
    variables: GetHomeBrandsQueryVariables;
  };
  '#graphql\nquery GetAllBlogsAndArticlesForInspiration {\n  blogs(first: 10) {\n    nodes {\n      title\n      handle\n      articles(first: 20) {\n        nodes {\n          id\n          title\n          handle\n          publishedAt\n          contentHtml\n          image {\n            url\n          }\n        }\n      }\n    }\n  }\n}\n': {
    return: GetAllBlogsAndArticlesForInspirationQuery;
    variables: GetAllBlogsAndArticlesForInspirationQueryVariables;
  };
  '#graphql\n  query Collections {\n    collections(first: 20) {\n      nodes {\n        id\n        title\n        description\n        image {\n          id\n          url\n          altText\n          width\n          height\n        }\n        metafield(namespace: "parent", key: "collection") {\n          key\n          value\n          namespace\n          type\n        }\n        subCollections: metafield(namespace: "sub", key: "collection") {\n          value\n        }\n        readyMadeMetafield: metafield(namespace: "custom", key: "ready_made") {\n          id\n          value\n        }\n      }\n    }\n  }\n': {
    return: CollectionsQuery;
    variables: CollectionsQueryVariables;
  };
  '#graphql\nquery getOurBrands {\n  collections(first: 250) {\n    nodes {\n      id\n      title\n      handle\n      description\n      image {\n        id\n        url\n        altText\n        width\n        height\n      }\n      metafield(namespace: "custom", key: "brand") {\n        id\n        value\n      }\n      products(first: 10) {\n        edges {\n          node {\n            id\n            title\n            handle\n            description\n            images(first: 10) {\n              edges {\n                node {\n                  id\n                  url\n                  altText\n                  width\n                  height\n                }\n              }\n            }\n            variants(first: 1) {\n              edges {\n                node {\n                  id\n                  availableForSale\n                  priceV2 {\n                    amount\n                    currencyCode\n                  }\n                }\n              }\n            }\n          }\n        }\n      }\n    }\n  }\n}': {
    return: GetOurBrandsQuery;
    variables: GetOurBrandsQueryVariables;
  };
  '#graphql\n  query Page(\n    $language: LanguageCode,\n    $country: CountryCode,\n    $handle: String!\n  )\n  @inContext(language: $language, country: $country) {\n    page(handle: $handle) {\n      id\n      title\n      body\n      seo {\n        description\n        title\n      }\n    }\n  }\n': {
    return: PageQuery;
    variables: PageQueryVariables;
  };
  '#graphql\n  fragment Policy on ShopPolicy {\n    body\n    handle\n    id\n    title\n    url\n  }\n  query Policy(\n    $country: CountryCode\n    $language: LanguageCode\n    $privacyPolicy: Boolean!\n    $refundPolicy: Boolean!\n    $shippingPolicy: Boolean!\n    $termsOfService: Boolean!\n  ) @inContext(language: $language, country: $country) {\n    shop {\n      privacyPolicy @include(if: $privacyPolicy) {\n        ...Policy\n      }\n      shippingPolicy @include(if: $shippingPolicy) {\n        ...Policy\n      }\n      termsOfService @include(if: $termsOfService) {\n        ...Policy\n      }\n      refundPolicy @include(if: $refundPolicy) {\n        ...Policy\n      }\n    }\n  }\n': {
    return: PolicyQuery;
    variables: PolicyQueryVariables;
  };
  '#graphql\n  fragment PolicyItem on ShopPolicy {\n    id\n    title\n    handle\n  }\n  query Policies ($country: CountryCode, $language: LanguageCode)\n    @inContext(country: $country, language: $language) {\n    shop {\n      privacyPolicy {\n        ...PolicyItem\n      }\n      shippingPolicy {\n        ...PolicyItem\n      }\n      termsOfService {\n        ...PolicyItem\n      }\n      refundPolicy {\n        ...PolicyItem\n      }\n      subscriptionPolicy {\n        id\n        title\n        handle\n      }\n    }\n  }\n': {
    return: PoliciesQuery;
    variables: PoliciesQueryVariables;
  };
  '#graphql\nquery getCashFundsForPorteTravel {\n  collections(first: 250) {\n    nodes {\n      id\n      title\n      handle\n      description\n      image {\n        id\n        url\n        altText\n        width\n        height\n      }\n      metafield(namespace: "custom", key: "cashfund") {\n        id\n        value\n      }\n      products(first: 10) {\n        edges {\n          node {\n            id\n            title\n            handle\n            description\n            images(first: 10) {\n              edges {\n                node {\n                  id\n                  url\n                  altText\n                  width\n                  height\n                }\n              }\n            }\n            variants(first: 1) {\n              edges {\n                node {\n                  id\n                  availableForSale\n                  priceV2 {\n                    amount\n                    currencyCode\n                  }\n                }\n              }\n            }\n          }\n        }\n      }\n    }\n  }\n}\n': {
    return: GetCashFundsForPorteTravelQuery;
    variables: GetCashFundsForPorteTravelQueryVariables;
  };
  '#graphql\nquery getReadyMadeRegistries {\n  collections(first: 250) {\n    nodes {\n      id\n      title\n      handle\n      description\n      image {\n        id\n        url\n        altText\n        width\n        height\n      }\n       readyMadeMetafield: metafield(namespace: "custom", key: "ready_made") {\n        id\n        value\n      }\n       parentCollectionMetafield: metafield(namespace: "parent", key: "collection") {\n        id\n        value\n      }\n       subCollectionMetafield: metafield(namespace: "sub", key: "collection") {\n        id\n        value\n      }\n     }\n   }\n }\n': {
    return: GetReadyMadeRegistriesQuery;
    variables: GetReadyMadeRegistriesQueryVariables;
  };
  '#graphql\n query getReadyMadeSubCollection($id: ID!) {\n   collection(id: $id) {\n     id\n     title\n     handle\n     description\n     image {\n       id\n       url\n       altText\n       width\n       height\n     }\n     products(first: 250) {\n        edges {\n          node {\n            id\n            title\n            handle\n            description\n            images(first: 10) {\n              edges {\n                node {\n                  id\n                  url\n                }\n              }\n            }\n            variants(first: 1) {\n              edges {\n                node {\n                  id\n                  availableForSale\n                  priceV2 {\n                    amount\n                    currencyCode\n                }\n              }\n            }\n          }\n        }\n      }\n    }\n  }\n}\n': {
    return: GetReadyMadeSubCollectionQuery;
    variables: GetReadyMadeSubCollectionQueryVariables;
  };
  '#graphql\n query getRegistry($handle: String!) {\n   collection(handle: $handle) {\n     id\n     title\n     handle\n     description\n     image {\n       id\n       url\n       altText\n       width\n       height\n     }\n     products(first: 250) {\n       edges {\n         node {\n           id\n           title\n           handle\n           description\n           images(first: 10) {\n             edges {\n               node {\n                 id\n                 url\n                 altText\n                 width\n                 height\n               }\n             }\n           }\n           variants(first: 1) {\n             edges {\n               node {\n                 id\n                 availableForSale\n                 priceV2 {\n                   amount\n                   currencyCode\n                 }\n               }\n             }\n           }\n         }\n       }\n     }\n   }\n }\n': {
    return: GetRegistryQuery;
    variables: GetRegistryQueryVariables;
  };
  '#graphql\n query getOtherRegistries {\n   collections(first: 250) {\n     nodes {\n       id\n       title\n       handle\n       description\n       image {\n         id\n         url\n         altText\n         width\n         height\n       }\n       readyMadeMetafield: metafield(namespace: "custom", key: "ready_made") {\n         id\n         value\n       }\n       parentCollectionMetafield: metafield(namespace: "parent", key: "collection") {\n         id\n         value\n       }\n     }\n   }\n }\n': {
    return: GetOtherRegistriesQuery;
    variables: GetOtherRegistriesQueryVariables;
  };
  '#graphql\nquery getCashFundsForSearch {\n  collections(first: 100) {\n    nodes {\n    id\n    title\n      handle\n      description\n    image {\n        id\n      url\n      altText\n      width\n      height\n    }\n      metafield(namespace: "custom", key: "cashfund") {\n        id\n        value\n      }\n      products(first: 10) {\n        edges {\n          node {\n    id\n    title\n    handle\n            description\n            images(first: 10) {\n              edges {\n                node {\n                  id\n      url\n      altText\n      width\n      height\n    }\n              }\n            }\n            variants(first: 1) {\n              edges {\n                node {\n                  id\n                  availableForSale\n                  priceV2 {\n                    amount\n                    currencyCode\n                  }\n                }\n              }\n            }\n          }\n        }\n      }\n    }\n  }\n}\n': {
    return: GetCashFundsForSearchQuery;
    variables: GetCashFundsForSearchQueryVariables;
  };
  '#graphql\n  query GetAllBlogsAndArticlesForSearch {\n    blogs(first: 20) {\n      nodes {\n    title\n    handle\n        articles(first: 250) {\n          nodes {\n    id\n    title\n    handle\n            publishedAt\n            contentHtml\n            image {\n              id\n          url\n          altText\n          width\n          height\n        }\n            metafield(namespace: "custom", key: "userId") {\n              value\n            }\n          }\n        }\n      }\n    }\n  }\n': {
    return: GetAllBlogsAndArticlesForSearchQuery;
    variables: GetAllBlogsAndArticlesForSearchQueryVariables;
  };
}

interface GeneratedMutationTypes {}

declare module '@shopify/hydrogen' {
  interface StorefrontQueries extends GeneratedQueryTypes {}
  interface StorefrontMutations extends GeneratedMutationTypes {}
}
