const GET_COLLECTION_QUERY = `
  query {
    collection(id: "your-collection-id") {
      title
      image {
        src
      }
    }
  }
`;

// New function to get collection by ID
export function getCollectionById(id) {
  return `
    query {
      collection(id: "${id}") {
        title
        image {
          src
        }
      }
    }
  `;
}
