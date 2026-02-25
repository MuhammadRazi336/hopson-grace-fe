const SHOPIFY_ADMIN_API_VERSION = '2025-01';

function toInteger(value) {
  const parsed = Number(value ?? 0);
  if (!Number.isFinite(parsed)) return 0;
  return Math.round(parsed);
}

async function shopifyAdminGraphQL(context, query, variables = {}) {
  const adminToken =
    context?.env?.SHOPIFY_ADMIN_API_ACCESS_TOKEN ||
    context?.env?.PRIVATE_STOREFRONT_API_TOKEN;
  const storeDomain = context?.env?.PUBLIC_STORE_DOMAIN;

  const endpoint = `https://${storeDomain}/admin/api/${SHOPIFY_ADMIN_API_VERSION}/graphql.json`;
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': adminToken,
    },
    body: JSON.stringify({query, variables}),
  });

  if (!response.ok) {
    throw new Error(`Shopify Admin GraphQL failed: ${response.status}`);
  }

  const payload = await response.json();
  if (payload?.errors?.length) {
    throw new Error(payload.errors.map((e) => e.message).join(', '));
  }

  return payload?.data || null;
}

export async function syncCustomerBalancesToMetafields(
  context,
  {registryId, giftBalance, cashFundBalance, email},
) {
  if (!registryId) {
    return;
  }

  const customerQuery = `
    query FindCustomerByQuery($query: String!) {
      customers(first: 25, query: $query) {
        nodes {
          id
          email
          note
          giftBalance: metafield(namespace: "custom", key: "gift_balance") {
            value
          }
          cashFundBalance: metafield(namespace: "custom", key: "cash_fund_balance") {
            value
          }
        }
      }
    }
  `;

  let customer = null;
  // Prefer email lookup first to avoid picking a wrong customer when note matches multiple records.
  if (email) {
    const byEmail = await shopifyAdminGraphQL(context, customerQuery, {
      query: `email:${email}`,
    });
    customer = byEmail?.customers?.nodes?.[0] || null;
    if (customer?.id) {
    }
  }

  const noteQueries = [
    `note:"Registry ID: ${registryId}"`,
    `note:"Registry ID:${registryId}"`,
    `note:${registryId}`,
  ];
  if (!customer) {
    for (const noteQuery of noteQueries) {
      const byNote = await shopifyAdminGraphQL(context, customerQuery, {
        query: noteQuery,
      });
      const candidates = byNote?.customers?.nodes || [];
      // Pick the candidate whose note explicitly contains this registry ID.
      customer =
        candidates.find((node) => {
          const note = String(node?.note || '');
          return new RegExp(`Registry\\s*ID\\s*:\\s*${registryId}\\b`, 'i').test(note);
        }) ||
        candidates[0] ||
        null;
      if (customer?.id) {
        break;
      }
    }
  }

  if (!customer?.id) {
    return false;
  }

  const nextGiftBalance = toInteger(giftBalance);
  const nextCashFundBalance = toInteger(cashFundBalance);
  const currentGiftBalance = toInteger(customer?.giftBalance?.value);
  const currentCashFundBalance = toInteger(customer?.cashFundBalance?.value);

  if (
    currentGiftBalance === nextGiftBalance &&
    currentCashFundBalance === nextCashFundBalance
  ) {
    return false;
  }

  const metafieldsSetMutation = `
    mutation SetCustomerBalances($metafields: [MetafieldsSetInput!]!) {
      metafieldsSet(metafields: $metafields) {
        userErrors {
          field
          message
        }
      }
    }
  `;

  const result = await shopifyAdminGraphQL(context, metafieldsSetMutation, {
    metafields: [
      {
        ownerId: customer.id,
        namespace: 'custom',
        key: 'gift_balance',
        type: 'number_integer',
        value: String(nextGiftBalance),
      },
      {
        ownerId: customer.id,
        namespace: 'custom',
        key: 'cash_fund_balance',
        type: 'number_integer',
        value: String(nextCashFundBalance),
      },
    ],
  });

  const userErrors = result?.metafieldsSet?.userErrors || [];
  if (userErrors.length) {
    throw new Error(userErrors.map((error) => error.message).join(', '));
  }
  return true;
}

export async function syncRegistryBalancesByRegistryId(
  context,
  {registryId, email},
) {
  if (!registryId) return false;
  const detailResponse = await context.ClientGet(`registries/detail/${registryId}`, context);
  const registry = detailResponse?.data;
  if (!registry) return false;
  const sessionEmail = context?.session?.get('@User')?.user?.email;
  const effectiveEmail = email || registry?.user?.email || sessionEmail;

  await syncCustomerBalancesToMetafields(context, {
    registryId,
    giftBalance: registry?.giftBalance,
    cashFundBalance: registry?.registryFundBalance,
    email: effectiveEmail,
  });
  return true;
}
