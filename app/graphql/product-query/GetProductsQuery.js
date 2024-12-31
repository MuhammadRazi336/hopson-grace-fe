export function getProductsByIds(ids) {
  return `
      #graphql query getProductByIds {
        nodes(ids: [${ids.map((id) => `"${id}"`).join(', ')}]) {
          ... on Product {
            id
            title
            descriptionHtml
            description
            images(first: 10) {
              edges {
                node {
                  id
                  src
                }
              }
            }
            variants(first: 10) {
              edges {
                node {
                  id
                  title
                  price {
                  amount,currencyCode}
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
                  src
                }
              }
            }
            variants(first: 10) {
              edges {
                node {
                  id
                  title
                  price {
                  amount,currencyCode}
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
