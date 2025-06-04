export function getProductsByIds(ids) {
  return `
      #graphql query getProductByIds($ids: [ID!]!) {
  nodes(ids: $ids) {
    ... on Product {
      id
      title
      descriptionHtml
      description
      images(first: 10) {
        edges {
          node {
            id
            url
          }
        }
      }
      variants(first: 10) {
        edges {
          node {
            id
            title
            priceV2 {
                    amount
                    currencyCode
                  }
          }
        }
      }
    }
  }
}
    `;
}

export async function fetchProducts(storefront, ids) {
  const query = `
      query getProductByIds($ids: [ID!]!) {
        nodes(ids: $ids) {
          ... on Product {
            id
            title
            descriptionHtml
            description
            images(first: 10) {
              edges {
                node {
                  id
                  url
                }
              }
            }
            variants(first: 10) {
              edges {
                node {
                  id
                  title
                  priceV2 {
                    amount
                    currencyCode
                  }
              }
            }
          }
        }
      }
}
    `;

  return await storefront.query(query, {
    variables: {ids},
  });
}
