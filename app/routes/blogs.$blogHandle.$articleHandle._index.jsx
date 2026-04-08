import React from 'react';
import {Footer} from '~/components/Footer';
import {Header} from '~/components/Header';
import {
  json,
  Link,
  useLoaderData,
  useFetcher,
  useNavigate,
} from '@remix-run/react';
import {Image} from '@shopify/hydrogen';
import lineImghead from '/assets/Images/inspirationLine.png';
import BlackLine from '/assets/Images/line.png';
import regLogo from '/assets/Images/reglogo.png';
import Heading from '~/components/Heading';
import {extractShopifyId} from '~/utils/helpers.js';
import heart from '/assets/Images/heart.png';
import lineImgWhiteHead from '/assets/Images/line.png';
import readMoreIcon from '/assets/Images/readMoreIcon.png';
import WhiteThemeButton from '~/components/WhiteThemeButton';
import {formatShopifyPrice} from '~/utils/priceFormatter';
import ImageAndText from '~/components/ImageAndText';
import teaImg from '/assets/Images/tea.png';
import lineImg3 from '/assets/Images/line.png';
import {Swiper, SwiperSlide} from 'swiper/react';
import {Navigation} from 'swiper/modules';
import nextitem from '/assets/Images/next.png';
import 'swiper/css';
import 'swiper/css/navigation';
import BlogArticle from '~/components/BlogArticle';

const BLOGS_QUERY = `#graphql
query GetBlogArticlesForMoreStories($blogHandle: String!) {
  blog(handle: $blogHandle) {
    title
    handle
    articles(first: 20, reverse: true) {
      nodes {
        id
        title
        handle
        publishedAt
        contentHtml
        image {
          url
          altText
        }
        categoryMetafield: metafield(namespace: "custom", key: "category") {
          value
        }
      }
    }
  }
}
`;

const ARTICLE_QUERY = `#graphql
  query Article(
    $articleHandle: String!
    $blogHandle: String!
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(language: $language, country: $country) {
    blog(handle: $blogHandle) {
      articleByHandle(handle: $articleHandle) {
        title
        contentHtml
        publishedAt
        author: authorV2 {
          name
        }
        image {
          id
          altText
          url
          width
          height
        }
        designerSaysMetafield: metafield(namespace: "designer", key: "says") {
          value
        }
        userIdMetafield: metafield(namespace: "custom", key: "userId") {
          value
        }
        photographerMetafield: metafield(namespace: "custom", key: "photographer") {
          value
        }
        weddingPlannerMetafield: metafield(namespace: "custom", key: "wedding_planner") {
          value
        }
        flowersMetafield: metafield(namespace: "custom", key: "flowers") {
          value
        }
        venueMetafield: metafield(namespace: "custom", key: "venue") {
          value
        }
        productsMetafield: metafield(namespace: "custom", key: "products") {
          value
        }
        coupleMetafield: metafield(namespace: "custom", key: "couple_name") {
          value
        }
        categoryMetafield: metafield(namespace: "custom", key: "category") {
          value
        }
        paraMetafield: metafield(namespace: "custom", key: "first_para") {
          value
        }
        richTextMetafield: metafield(namespace: "rich", key: "text") {
          value
        }
        createRegistryMetafield: metafield(namespace: "create", key: "registry") {
          value
        }
        eventDetailsMetafield: metafield(namespace: "event", key: "details") {
          value
        }
        seo {
          description
          title
        }
      }
    }
  }
`;

/** Strip HTML tags from a string (fallback when value is HTML) */
function stripHtml(html) {
  if (!html || typeof html !== 'string') return '';
  return html.replace(/<[^>]*>/g, '').trim();
}

/** Get plain text from a Shopify rich text node (recursive); skip link nodes when collecting paragraph text */
function getTextFromRichNode(node) {
  if (!node) return '';
  if (node.type === 'text' && node.value) return node.value;
  if (node.type === 'link') return ''; // links handled separately
  if (Array.isArray(node.children)) return node.children.map(getTextFromRichNode).join('');
  return '';
}

/** Find first node of type in tree (recursive) */
function findFirst(node, type, level) {
  if (!node) return null;
  if (node.type === type && (level == null || node.level === level)) return node;
  if (Array.isArray(node.children)) {
    for (const child of node.children) {
      const found = findFirst(child, type, level);
      if (found) return found;
    }
  }
  return null;
}

/** Collect all nodes of type in tree (recursive) */
function findAll(node, type, level, out = []) {
  if (!node) return out;
  if (node.type === type && (level == null || node.level === level)) out.push(node);
  if (Array.isArray(node.children)) {
    for (const child of node.children) findAll(child, type, level, out);
  }
  return out;
}

/** Parse Shopify rich_text_field: JSON with root.children (headings = title rows, paragraph = content, link = link) */
function parseRichTextBlock(value) {
  const empty = {title: '', content: '', linkTitle: '', linkUrl: ''};
  if (!value || typeof value !== 'string') return empty;
  const trimmed = value.trim();
  if (!trimmed) return empty;

  // Try Shopify rich text JSON (type "root", children array)
  try {
    const data = JSON.parse(trimmed);
    if (!data || data.type !== 'root' || !Array.isArray(data.children)) {
      throw new Error('Not root');
    }
    const root = data;
    const headingNodes = findAll(root, 'heading', 4);
    const title = headingNodes
      .map((n) => getTextFromRichNode(n).trim())
      .filter(Boolean)
      .join('\n');

    const titleLines = title.split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
    let content = '';
    const paragraphs = findAll(root, 'paragraph');
    for (const para of paragraphs) {
      const text = getTextFromRichNode(para).trim();
      if (text && text !== title && !titleLines.includes(text)) {
        content = text;
        break;
      }
    }

    const linkNode = findFirst(root, 'link');
    const linkUrl = linkNode?.url?.trim() ?? '';
    const linkTitle = (linkNode?.title?.trim() || getTextFromRichNode(linkNode).trim()) || '';

    return {title, content, linkTitle, linkUrl};
  } catch (_) {
    const h4Matches = [...trimmed.matchAll(/<h4[^>]*>([\s\S]*?)<\/h4>/gi)];
    const title = h4Matches.map((m) => stripHtml(m[1])).filter(Boolean).join('\n');
    const pMatch = trimmed.match(/<p[^>]*>([\s\S]*?)<\/p>/i);
    const aMatch = trimmed.match(/<a[^>]*href=["']([^"']*)["'][^>]*>([\s\S]*?)<\/a>/i);
    return {
      title,
      content: pMatch ? stripHtml(pMatch[1]) : '',
      linkUrl: aMatch ? (aMatch[1] || '').trim() : '',
      linkTitle: aMatch ? stripHtml(aMatch[2]) : '',
    };
  }
}

/** Get text and whether node contains any bold text (label) from a Shopify rich text node */
function getParagraphTextAndBold(node) {
  if (!node) return {text: '', isBold: false};
  if (node.type === 'text') return {text: node.value || '', isBold: !!node.bold};
  if ((node.type === 'paragraph' || node.type === 'heading') && Array.isArray(node.children)) {
    let text = '';
    let isBold = false;
    for (const c of node.children) {
      const r = getParagraphTextAndBold(c);
      text += r.text;
      if (r.isBold) isBold = true; // label if ANY part is bold (or is a subheading)
    }
    if (node.type === 'heading' && node.level !== 4) isBold = true; // non-H4 headings = labels
    return {text: text.trim(), isBold};
  }
  if (Array.isArray(node.children)) {
    let text = '';
    let isBold = false;
    for (const c of node.children) {
      const r = getParagraphTextAndBold(c);
      text += r.text;
      if (r.isBold) isBold = true;
    }
    return {text: text.trim(), isBold};
  }
  return {text: '', isBold: false};
}

/** Extract label/value pairs from a single paragraph whose children alternate bold (label) and normal (value) text */
function getLabelValuePairsFromParagraph(node) {
  const pairs = [];
  if (!node?.children || !Array.isArray(node.children)) return pairs;
  let pendingLabel = '';
  for (const child of node.children) {
    if (child.type === 'text') {
      const text = (child.value || '').trim();
      if (!text) continue;
      if (child.bold) {
        if (pendingLabel) pairs.push({label: pendingLabel, value: ''});
        pendingLabel = text;
      } else {
        if (pendingLabel) {
          pairs.push({label: pendingLabel, value: text});
          pendingLabel = '';
        }
      }
    } else if (Array.isArray(child.children)) {
      for (const c of child.children) {
        if (c.type === 'text') {
          const text = (c.value || '').trim();
          if (!text) continue;
          if (c.bold) {
            if (pendingLabel) pairs.push({label: pendingLabel, value: ''});
            pendingLabel = text;
          } else {
            if (pendingLabel) {
              pairs.push({label: pendingLabel, value: text});
              pendingLabel = '';
            }
          }
        }
      }
    }
  }
  if (pendingLabel) pairs.push({label: pendingLabel, value: ''});
  if (pairs.length > 0) return pairs;
  const fullText = getTextFromRichNode(node).trim();
  if (!fullText) return [];
  const blocks = fullText.split(/\n\s*\n/);
  for (const block of blocks) {
    const firstLineEnd = block.indexOf('\n');
    const firstLine = firstLineEnd >= 0 ? block.slice(0, firstLineEnd).trim() : block.trim();
    const rest = firstLineEnd >= 0 ? block.slice(firstLineEnd + 1).trim() : '';
    if (firstLine) pairs.push({label: firstLine.replace(/:$/, ''), value: rest});
  }
  return pairs;
}

/** Get top-level blocks from root in document order (paragraphs and headings only) */
function getBlocksInOrder(root) {
  if (!root?.children || !Array.isArray(root.children)) return [];
  return root.children.filter(
    (node) => node && (node.type === 'paragraph' || node.type === 'heading')
  );
}

/**
 * Parse event.details rich text: h4 = heading, then pairs of (bold/strong = label, p = value).
 * Returns { heading: string, items: Array<{ label: string, value: string }> }.
 */
function parseEventDetailsRichText(value) {
  const empty = {heading: '', items: []};
  if (!value || typeof value !== 'string') return empty;
  const trimmed = value.trim();
  if (!trimmed) return empty;
  try {
    const data = JSON.parse(trimmed);
    if (!data || data.type !== 'root' || !Array.isArray(data.children)) return empty;
    const root = data;
    const headingNodes = findAll(root, 'heading', 4);
    const heading = headingNodes
      .map((n) => getTextFromRichNode(n).trim())
      .filter(Boolean)
      .join('\n');

    const items = [];
    const blocks = getBlocksInOrder(root);
    const headingLines = heading.split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
    let pendingLabel = '';
    for (const block of blocks) {
      if (block.type === 'heading' && block.level === 4) continue; // already used as main heading
      if (block.type === 'paragraph' && block.children?.length) {
        const pairs = getLabelValuePairsFromParagraph(block);
        if (pairs.length > 0) {
          items.push(...pairs);
          continue;
        }
      }
      const {text, isBold} = getParagraphTextAndBold(block);
      if (!text) continue;
      if (text === heading || headingLines.includes(text)) continue; // skip duplicate of main heading(s)
      if (isBold) {
        if (pendingLabel) items.push({label: pendingLabel, value: ''});
        pendingLabel = text;
      } else {
        if (pendingLabel) {
          items.push({label: pendingLabel, value: text});
          pendingLabel = '';
        }
      }
    }
    if (pendingLabel) items.push({label: pendingLabel, value: ''});

    return {heading, items};
  } catch (_) {
    const h4Matches = [...trimmed.matchAll(/<h4[^>]*>([\s\S]*?)<\/h4>/gi)];
    const heading = h4Matches.map((m) => stripHtml(m[1])).filter(Boolean).join('\n');
    const items = [];
    const boldRegex = /<(?:b|strong)[^>]*>([\s\S]*?)<\/(?:b|strong)>/gi;
    const pRegex = /<p[^>]*>([\s\S]*?)<\/p>/gi;
    let m;
    const labels = [];
    while ((m = boldRegex.exec(trimmed)) !== null) labels.push(stripHtml(m[1]));
    const values = [];
    while ((m = pRegex.exec(trimmed)) !== null) values.push(stripHtml(m[1]));
    for (let i = 0; i < labels.length; i++) items.push({label: labels[i], value: values[i] || ''});
    return {heading: heading ? stripHtml(heading) : '', items};
  }
}

/** Collect runs of text with isBold in order from a paragraph node */
function getRunsFromParagraph(node) {
  const runs = [];
  if (!node?.children || !Array.isArray(node.children)) return runs;
  function walk(n) {
    if (n.type === 'text') {
      const t = (n.value || '').trim();
      if (t) runs.push({text: t, isBold: !!n.bold});
      return;
    }
    if (Array.isArray(n.children)) for (const c of n.children) walk(c);
  }
  for (const child of node.children) walk(child);
  return runs;
}

/**
 * Parse designer.says rich text: bold = label, normal = text (quote).
 * Works whether quote comes before or after the bold name.
 * Returns { label: string, text: string }.
 */
function parseDesignerSays(value) {
  const empty = {label: '', text: ''};
  if (!value || typeof value !== 'string') return empty;
  const trimmed = value.trim();
  if (!trimmed) return empty;
  try {
    const data = JSON.parse(trimmed);
    if (!data || data.type !== 'root' || !Array.isArray(data.children)) return empty;
    const root = data;
    const blocks = getBlocksInOrder(root);
    const allRuns = [];
    for (const block of blocks) {
      if (block.type === 'paragraph' && block.children?.length) {
        allRuns.push(...getRunsFromParagraph(block));
      }
    }
    if (allRuns.length === 0) return empty;
    const labelRun = allRuns.find((r) => r.isBold);
    const textParts = allRuns.filter((r) => !r.isBold).map((r) => r.text);
    const text = textParts.join(' ').trim();
    return {
      label: labelRun?.text ?? '',
      text,
    };
  } catch (_) {
    const boldMatch = trimmed.match(/<(?:b|strong)[^>]*>([\s\S]*?)<\/(?:b|strong)>/i);
    const label = boldMatch ? stripHtml(boldMatch[1]) : '';
    const withoutBold = trimmed.replace(/<(?:b|strong)[^>]*>[\s\S]*?<\/(?:b|strong)>/i, '').trim();
    const pMatch = withoutBold.match(/<p[^>]*>([\s\S]*?)<\/p>/i);
    const text = pMatch ? stripHtml(pMatch[1]) : stripHtml(withoutBold);
    return {label, text: text || ''};
  }
}

export async function loader({context, params}) {
  const {blogHandle, articleHandle} = params;

  if (!articleHandle || !blogHandle) {
    throw new Response('Not found', {status: 404});
  }

  const {blog} = await context.storefront.query(ARTICLE_QUERY, {
    variables: {blogHandle, articleHandle},
  });

  if (!blog?.articleByHandle) {
    throw new Response(null, {status: 404});
  }

  // Get user session if available (optional for non-logged in users)
  const user = context?.session?.get('@User');
  let registry = null;
  let registryProduct = null;

  // Extract metafields into a more usable format (custom.category = choice list: Real Weddings, The Planning Edit, At Home, Travel & Culture)
  const metafields = {
    userId: blog.articleByHandle.userIdMetafield?.value,
    photographer: blog.articleByHandle.photographerMetafield?.value,
    wedding_planner: blog.articleByHandle.weddingPlannerMetafield?.value,
    flowers: blog.articleByHandle.flowersMetafield?.value,
    venue: blog.articleByHandle.venueMetafield?.value,
    couple_name: blog.articleByHandle.coupleMetafield?.value,
    category: blog.articleByHandle.categoryMetafield?.value?.trim() ?? '',
    first_para: blog.articleByHandle.paraMetafield?.value,
  };

  // Parse rich text metafield (namespace "rich", key "text"): h4 → title, p → content, a → link
  const richTextBlock = parseRichTextBlock(blog.articleByHandle.richTextMetafield?.value ?? '');

  // Parse create.registry rich text for CTA block (heading, body, link)
  const createRegistryBlock = parseRichTextBlock(blog.articleByHandle.createRegistryMetafield?.value ?? '');

  // Parse event.details rich text: h4 = heading, bold = label, p = value (for Real Weddings "It's all in the details")
  const eventDetailsBlock = parseEventDetailsRichText(blog.articleByHandle.eventDetailsMetafield?.value ?? '');

  // Parse designer.says rich text: bold = label, normal = text (quote)
  const designerSaysBlock = parseDesignerSays(blog.articleByHandle.designerSaysMetafield?.value ?? '');

  // Parse products from metafield (assuming it's stored as JSON string)
  let productIds = [];
  try {
    if (blog.articleByHandle.productsMetafield?.value) {
      const parsedIds = JSON.parse(
        blog.articleByHandle.productsMetafield.value,
      );
      // Ensure we have an array of valid Shopify GIDs
      if (Array.isArray(parsedIds)) {
        productIds = parsedIds.filter(
          (id) =>
            typeof id === 'string' && id.startsWith('gid://shopify/Product/'),
        );
      }
    }
  } catch (error) {
    console.error('Error parsing products metafield:', error);
    productIds = [];
  }

  // Fetch product details from Shopify using the IDs
  let products = [];
  if (productIds && productIds.length > 0) {
    try {
      const productQueries = productIds
        .map(
          (id, index) => `
        product${index}: product(id: "${id}") {
          id
          title
          handle
          description
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
          }
          images(first: 1) {
            edges {
              node {
                id
                url
                altText
              }
            }
          }
          variants(first: 1) {
            edges {
              node {
                id
                availableForSale
                priceV2 {
                  amount
                  currencyCode
                }
              }
            }
          }
        }
      `,
        )
        .join('\n');

      const PRODUCTS_QUERY = `#graphql
        query GetProducts {
          ${productQueries}
        }
      `;

      console.log('Product IDs to fetch:', productIds);
      console.log('Generated query:', PRODUCTS_QUERY);

      const result = await context.storefront.query(PRODUCTS_QUERY);
      console.log('Query result:', result);
      
      // Convert the data object to an array, with proper null checks
      if (result) {
        // The result is directly the data object, not wrapped in a 'data' property
        products = Object.values(result).filter((product) => product !== null);
        console.log('Processed products:', products);
      } else {
        console.log('No product data returned from query');
        products = [];
      }
    } catch (error) {
      console.error('Error fetching product details:', error);
      products = [];
    }
  }

  try {
    // Fetch registry for the logged-in user (for adding products to their registry)
    if (user && user.user && user.user.id) {
      registry = await context.ClientGet(
        `registries/by-userId/${user.user.id}`,
        context,
      );
      console.log('User registry', registry?.data?.[0]?.id);

      if (registry?.data?.[0]?.id) {
        registryProduct = await context.ClientGet(
          `registryProducts/${registry.data[0].id}?type=gift`,
          context,
        );
      }
    }

    // Also fetch the article author's registry for display purposes
    let authorRegistry = null;
    if (metafields.userId) {
      authorRegistry = await context.ClientGet(
        `registries/by-userId/${metafields.userId}`,
        context,
      );
      console.log('Author registry', authorRegistry?.data?.[0]?.id);
    }
  } catch (error) {
    console.error('Error fetching registry data:', error);
    // Continue without registry data
  }


  const {blog: selectedBlog} = await context.storefront.query(BLOGS_QUERY, {
    variables: {blogHandle},
  });

  // Allowed blog categories (custom.category metafield values, case-insensitive)
  const ALLOWED_BLOG_CATEGORIES = new Set(
    ['Real Weddings', 'The Planning Edit', 'At Home', 'Travel & Culture'].map(
      (v) => v.toLowerCase(),
    ),
  );

  // Filter selected blog's articles to only allowed categories
  const filteredSelectedBlog = selectedBlog
    ? {
        ...selectedBlog,
        articles: {
          ...selectedBlog.articles,
          nodes:
            selectedBlog.articles?.nodes
              ?.filter((article) => {
                const raw = (article?.categoryMetafield?.value || '').trim();
                const normalized = raw.toLowerCase();
                return ALLOWED_BLOG_CATEGORIES.has(normalized);
              })
              .map((article) => ({
                ...article,
                image: article.image || null,
                contentHtml: article.contentHtml || '',
              })) || [],
        },
      }
    : null;

  // Ensure blogs data is properly structured
  const safeBlogs =
    (filteredSelectedBlog ? [filteredSelectedBlog] : []) || [];

  return json({
    article: blog.articleByHandle,
    metafields,
    richTextBlock,
    createRegistryBlock,
    eventDetailsBlock,
    designerSaysBlock,
    products,
    registry: registry?.data || [],
    registryProduct: registryProduct?.data || [],
    user: user || null,
    blogs: safeBlogs,
    currentArticleHandle: articleHandle,
  });
}

export async function action({request, context}) {
  const body = await request.json();
  const {payload} = body;
  try {
    const response = await context.ClientPost(
      JSON.parse(payload),
      'registryProducts',
      context,
    );
    return json({success: true, response});
  } catch (e) {
    return json({success: false, error: e.message}, {status: 400});
  }
}

const BlogDetails = () => {
  const {article, metafields, richTextBlock, createRegistryBlock, eventDetailsBlock, designerSaysBlock, products, registry, registryProduct, user, blogs, currentArticleHandle} =
    useLoaderData();
  const fetcher = useFetcher();
  const navigate = useNavigate();
  const [showAlert, setShowAlert] = React.useState(false);
  const [alertMessage, setAlertMessage] = React.useState('');
  const [alertType, setAlertType] = React.useState('success');
  const getSlidesForWidth = React.useCallback((width) => {
    if (width >= 1024) return 4;
    if (width >= 768) return 3;
    if (width > 500) return 2;
    return 1;
  }, []);
  const [activeSlidesPerView, setActiveSlidesPerView] = React.useState(() =>
    typeof window !== 'undefined' ? getSlidesForWidth(window.innerWidth || 1600) : 4,
  );

  const handleAddToRegistry = (product, quantity) => {
    try {
      // Check if user is logged in
      if (!user || !user.user || !user.user.id) {
        // User not logged in, redirect to login
        navigate('/login');
        return;
      }

      // Check if registry exists and has an id
      if (!registry || !registry[0] || !registry[0].id) {
        setAlertMessage('Registry not found. Please try again.');
        setAlertType('error');
        setShowAlert(true);
        setTimeout(() => {
          setShowAlert(false);
          setAlertMessage('');
        }, 3000);
        return;
      }

      const firstVariant = product?.variants?.edges?.[0]?.node;
      if (!firstVariant) {
        setAlertMessage('Product variant not found.');
        setAlertType('error');
        setShowAlert(true);
        setTimeout(() => {
          setShowAlert(false);
          setAlertMessage('');
        }, 3000);
        return;
      }

      const payload = {
        productId: Number(extractShopifyId(product.id)),
        amount: Number(firstVariant.priceV2.amount),
        registryId: Number(registry[0].id),
        productTypeId: 1,
        quantity: quantity,
      };

      fetcher.submit(
        {payload: JSON.stringify(payload)},
        {
          method: 'post',
          encType: 'application/json',
        },
      );

      // Show success alert
      setAlertMessage(`${product.title} has been added to your registry!`);
      setAlertType('success');
      setShowAlert(true);

      // Hide alert after 3 seconds
      setTimeout(() => {
        setShowAlert(false);
        setAlertMessage('');
      }, 3000);
    } catch (error) {
      setAlertMessage('Failed to add to registry. Please try again.');
      setAlertType('error');
      setShowAlert(true);
      setTimeout(() => {
        setShowAlert(false);
        setAlertMessage('');
      }, 3000);
    }
  };

  React.useEffect(() => {
    const updateSlides = () => setActiveSlidesPerView(getSlidesForWidth(window.innerWidth || 1600));
    updateSlides();
    window.addEventListener('resize', updateSlides);
    return () => window.removeEventListener('resize', updateSlides);
  }, [getSlidesForWidth]);

  const relatedArticles = React.useMemo(
    () =>
      blogs
        .flatMap((blog) =>
          blog.articles.nodes
            .filter((article) => article.handle !== currentArticleHandle)
            .map((article) => ({...article, blogHandle: blog.handle})),
        )
        .slice(0, 12),
    [blogs, currentArticleHandle],
  );

  const showMoreStoriesButtons = relatedArticles.length > activeSlidesPerView;
  const canSlideMoreStories = relatedArticles.length > activeSlidesPerView;


  return (
    <>
      <Header />

      <div className="w-full lg:h-[34.375vw] xl:h-[34.375vw] 2xl:h-[34.375vw] flex flex-row items-center justify-center">
        <div className="w-[50%] h-full bg-[#446184] relative max-[1025px]:h-[500px] max-[768px]:h-[360px]">
          <div className="mx-auto text-center absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] lg:w-[80%]">
            <p className="text-white text-[20px] lg:text-[1.042vw] xl:text-[1.042vw] 2xl:text-[1.042vw] lg:tracking-[0.083vw] xl:tracking-[0.083vw] 2xl:tracking-[0.083vw] font-[800] mb-[1.771vw] uppercase max-[1025px]:text-[16px]">{metafields.category || 'WEDDING STORIES'}</p>
            <h1 className='prata capitalize text-[46px] lg:text-[2.396vw] xl:text-[2.396vw] 2xl:text-[2.396vw] lg:leading-[3.125vw] xl:leading-[3.125vw] 2xl:leading-[3.125vw] font-normal text-center max-[1024px]:m-0 text-white max-[1025px]:text-[24px]'>{article.title}</h1>
            <Heading
              text=""
              classes={
                'prata text-[46px] lg:text-[2.396vw] xl:text-[2.396vw] 2xl:text-[2.396vw] lg:leading-[3.125vw] xl:leading-[3.125vw] 2xl:leading-[3.125vw] font-normal text-center max-[1024px]:m-0 text-white'
              }
              image={lineImgWhiteHead}
              imageClasses={'max-[1024px]:max-w-[330px] lg:w-[16.875vw] xl:w-[16.875vw] 2xl:w-[16.875vw] brightness-0 invert-100 max-[1025px]:w-[180px] max-[391px]:w-[100px]'}
            />
            <p className="ivyora font-[400] italic text-[32px] lg:tracking-[0.1vw] xl:tracking-[0.1vw] 2xl:tracking-[0.1vw] lg:text-[1.667vw] xl:text-[1.667vw] 2xl:text-[1.667vw] text-white leading-relaxed lg:leading-[2.29vw] xl:leading-[2.29vw] 2xl:leading-[2.29vw] mx-auto mt-10 max-[1025px]:text-[20px]">
              {metafields.first_para}
            </p>
          </div>
        </div>
        <div className="w-[50%] h-full max-[1025px]:h-[500px] max-[768px]:h-[360px]">
          {article.image?.url ? (
          <img
            src={article.image.url}
            className="w-full h-full object-cover"
            alt=""
          />
          ) : (
            <img src="/assets/Images/couple-logo.png" alt="" className="w-full h-full object-cover" />
          )}
        </div>
      </div>

      <div className="w-full flex flex-row px-[9.375vw] py-[6.927vw] gap-[6.979vw] max-[1025px]:flex-col max-[1025px]:px-[40px] max-[1025px]:py-[40px] max-[768px]:px-[20px] max-[768px]:py-[20px]">
        {/* Full Content Display */}
        <div className="w-[73.3%] max-[993px]:w-full">
          <BlogArticle article={article} processedContent={article.contentHtml} />
        </div>

        <div className="w-[26.7%] max-[993px]:w-full">

          {/* Event details block: driven solely by event.details metafield (namespace "event", key "details") */}
          {eventDetailsBlock?.heading && (
          <div className="bg-[#FAF9F6] relative px-16 py-12 max-[993px]:px-[40px] max-[993px]:py-[40px] max-[768px]:px-[30px] max-[768px]:py-[30px]">
            <div className="text-center w-full px-10 max-[1025px]:px-0">
              <p className="text-[24px] lg:text-[1.25vw] xl:text-[1.25vw] 2xl:text-[1.25vw] bastardogrotesk font-medium tracking-[8%] uppercase max-[1025px]:text-[20px]">   
                {eventDetailsBlock?.heading && (
                  (() => {
                    const heading = eventDetailsBlock.heading.trim();
                    const lines = heading.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
                    if (lines.length >= 2) {
                      return (
                        <>
                          {lines.map((line, i) => (
                            <React.Fragment key={i}>
                              {i > 0 && <br />}
                              {line}
                            </React.Fragment>
                          ))}
                        </>
                      );
                    }
                    return <>{heading}</>;
                  })()
                ) 
                }
              </p>
              <img
                src={BlackLine}
                alt=""
                className="w-[100px] h-[4px] mx-auto mb-10"
              />
              {(eventDetailsBlock.items || []).map((item, idx) => (
                <div key={idx} className="mb-14 last:mb-0">
                  <p className="text-[20px] bastardogrotesk font-semibold uppercase tracking-[8%] mb-2">
                    {item.label}
                    {item.label.endsWith(':') ? '' : ':'}
                  </p>
                  {item.value ? (
                    <p className="text-[20px] font-normal tracking-[8%]">{item.value}</p>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
          )}


          {richTextBlock.title && richTextBlock.content && metafields.category === 'The Planning Edit' && (
          <div className="h-[370px] w-full bg-[#FAF9F6] relative mx-auto">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center w-full px-10">
              <p className="text-[20px] font-bold uppercase">
                {(() => {
                  const heading = richTextBlock.title.trim();
                  const lines = heading.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
                  if (lines.length >= 2) {
                    return (
                      <>
                        {lines.map((line, i) => (
                          <React.Fragment key={i}>
                            {i > 0 && <br />}
                            {line}
                          </React.Fragment>
                        ))}
                      </>
                    );
                  }
                  return <>{heading}</>;
                })()}
              </p>
              <img
                src={BlackLine}
                alt=""
                className="w-[100px] h-[4px] mx-auto mb-10"
              />
              <p className="text-[18px] font-normal mb-7">
                {richTextBlock.content}
              </p>
              <Link to={richTextBlock.linkUrl || `/couple/single/${metafields.userId || ''}`}>
                <button className="w-[286px] h-[68px] text-[14px] font-bold bg-[#446184] hover:opacity-90 uppercase text-white text-center">
                  {richTextBlock.linkTitle}
                </button>
              </Link>
            </div>
          </div>
          )}

          {(designerSaysBlock?.text || designerSaysBlock?.label) && (
          <div className="w-full bg-[#FAF9F6] relative mx-auto py-12 lg:py-16 px-6 lg:px-10 mt-10">
            <div className="relative text-center max-w-[90%] mx-auto">
              <span className="absolute -top-2 left-0 lg:left-4 text-black font-serif text-[80px] lg:text-[6vw] leading-none select-none" aria-hidden="true">&ldquo;</span>
              <p className="text-black font-bold text-[18px] lg:text-[1.1vw] leading-[1.8] uppercase tracking-wide pt-8 lg:pt-12 px-4">
                {designerSaysBlock?.text}
              </p>
              <img
                src={BlackLine}
                alt=""
                className="w-[100px] h-[4px] mx-auto mb-10"
              />
              <p className="text-black text-[16px] lg:text-[0.9vw] font-normal">
                {designerSaysBlock?.label}
              </p>
            </div>
          </div>
          )}

          <div className="text-center mt-16">
            <p className="text-[24px] font-semibold mx-auto mb-2 uppercase mt-28 w-[90%]">
              {metafields.couple_name || 'THEIR'} FAVOURITE GIFTS
            </p>
            <img
              src={BlackLine}
              alt=""
              className="w-[100px] h-[4px] mx-auto mb-20"
            />
             <div className="flex flex-col">
               {products.slice(0, 3).map((product, index) => (
                <ProductCard
                  key={product.id || index}
                  product={product}
                  index={index}
                  onAddToRegistry={(quantity) =>
                    handleAddToRegistry(product, quantity)
                  }
                />
               ))}
             </div>
          </div>
               

          {richTextBlock.title && richTextBlock.content && metafields.category !== 'The Planning Edit' && (
          <div className="h-[370px] w-full bg-[#FAF9F6] relative mx-auto mt-14">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center w-full px-10">
              <p className="text-[20px] font-bold uppercase">
                {richTextBlock?.title && (
                  (() => {
                    const heading = richTextBlock.title.trim();
                    const lines = heading.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
                    if (lines.length >= 2) {
                      return (
                        <>
                          {lines.map((line, i) => (
                            <React.Fragment key={i}>
                              {i > 0 && <br />}
                              {line}
                            </React.Fragment>
                          ))}
                        </>
                      );
                    }
                    return <>{heading}</>;
                  })()
                ) 
                }
              </p>
              <img
                src={BlackLine}
                alt=""
                className="w-[100px] h-[4px] mx-auto mb-10"
              />
              <p className="text-[18px] font-normal mb-7">
                {richTextBlock.content}
              </p>
              <Link to={richTextBlock.linkUrl || `/couple/single/${metafields.userId || ''}`}>
                <button className="w-[286px] h-[68px] text-[14px] font-bold bg-[#446184] hover:opacity-90 uppercase text-white text-center">
                  {richTextBlock.linkTitle}
                </button>
              </Link>
            </div>
          </div>
          )}

          {/* CTA block driven by create.registry rich text when present */}
          {createRegistryBlock?.title && (
            <div className="h-max w-full bg-[#446184] relative mt-10 mx-auto">
              <div className="py-20 text-center w-full px-10">
                <img
                  src={regLogo}
                  alt=""
                  className="w-[104px] h-[92px] mx-auto mb-10"
                />
                <h2 className="text-white text-[22px] font-[500]">
                  {createRegistryBlock.title}
                </h2>
                <p className="text-white text-[18px] my-10">
                  {createRegistryBlock.content}
                </p>
                {createRegistryBlock.linkUrl && (
                  <Link to={createRegistryBlock.linkUrl}>
                    <button className="h-[68px] w-[286px] text-[14px] font-bold max-[1601px]:text-[14px] text-black bg-[#F5F2ED] border border-black hover:opacity-90 uppercase max-[1601px]:w-[200px] text-center">
                      {createRegistryBlock.linkTitle || 'Learn more'}
                    </button>
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div>
        <img src={heart} alt="" className='mx-auto w-[250px] max-[993px]:w-[200px] max-[768px]:w-[150px]'/>

        <Heading
          text="more wedding stories"
          classes={'prata text-4xl lg:text-[2.5vw] lg:leading-[1.875vw] font-normal text-center max-[1024px]:m-0 mt-10 max-[1025px]:text-3xl'}
          image={lineImghead}
          imageClasses={'max-w-[430px] max-[993px]:max-w-[250px]'}
        />

        <div className="relative items-start mt-16">
          <div className="lg:w-[100vw] max-w-[85%] mx-auto">
            {showMoreStoriesButtons && (
              <div className="swiper-button-prev-prod absolute top-0 left-[0] max-[1601px]:-left-[0%] cursor-pointer uppercase flex w-[139px] max-[1601px]:w-[90px] items-center h-[19.5vw] max-[768px]:h-[41.35vw] justify-center max-[1024px]:w-[33px] z-20">
                <img src={nextitem} alt="" className="rotate-90 w-[12px] h-[12px] lg:w-[1.042vw] lg:h-[1.042vw] xl:w-[1.042vw] xl:h-[1.042vw] 2xl:w-[1.042vw] 2xl:h-[1.042vw]" />
                <span className="-rotate-90 text-black lg:text-[1.146vw] block tracking-wider max-[1024px]:hidden">
                  more
                </span>
              </div>
            )}

            <Swiper
              spaceBetween={15}
              slidesPerView={4}
              loop={canSlideMoreStories}
              modules={[Navigation]}
              onSwiper={(swiper) => {
                const spv = Number(swiper.params?.slidesPerView) || 4;
                setActiveSlidesPerView(spv);
              }}
              onBreakpoint={(swiper) => {
                const spv = Number(swiper.params?.slidesPerView) || 4;
                setActiveSlidesPerView(spv);
              }}
              navigation={
                canSlideMoreStories
                  ? {
                      nextEl: '.swiper-button-next-prod',
                      prevEl: '.swiper-button-prev-prod',
                    }
                  : false
              }
              allowTouchMove={canSlideMoreStories}
              className=""
              breakpoints={{
                345: {
                  spaceBetween: 10,
                  slidesPerView: 1,
                  centeredSlides: false,
                },
                501: {
                  spaceBetween: 15,
                  slidesPerView: 2,
                  centeredSlides: false,
                },
                768: {
                  spaceBetween: 20,
                  slidesPerView: 3,
                  centeredSlides: false,
                },
                1024: {
                  spaceBetween: 20,
                  slidesPerView: 4,
                  centeredSlides: false,
                },
                1366: {
                  spaceBetween: 25,
                  slidesPerView: 4,
                  centeredSlides: false,
                },
                1600: {
                  spaceBetween: 30,
                  slidesPerView: 4,
                  centeredSlides: false,
                },
              }}
            >
              {relatedArticles.map((article) => (
                    <SwiperSlide key={article.id}>
                      <div className="w-full">
                        {article.image?.url ? (
                          <img src={article.image.url} alt={article.image.altText || article.title || 'Blog image'} className='w-full h-[388px] object-cover aspect-square'/>
                        ) : (
                          <img src="/assets/Images/couple-logo.png" alt="Default blog image" className='w-full h-[388px] object-contain aspect-square'/>
                        )}
                        <h4 className="text-xl lg:text-[22px] lg:leading-[1.458vw] font-semibold mt-3">
                          {article.title}
                        </h4>
                        <p className="text-sm mt-2 mb-3 ivyora italic lg:text-[20px] lg:leading-[1.1vw] font-normal">
                          {article.contentHtml?.replace(/<[^>]*>/g, '').slice(0, 95) || 'No content available'}
                          ...
                        </p>
                        <div className="flex items-center justify-start">
                          <Link to={`/blogs/${article.blogHandle}/${article.handle}`}>
                            <p className="font-bold flex items-center justify-center lg:text-[18px] uppercase gap-2">
                              Read More
                              <img src={readMoreIcon} className='w-[16px] h-[16px] pl-0.5 relative -top-[2px]' alt="" />
                            </p>
                          </Link>
                        </div>
                      </div>
                    </SwiperSlide>
                  ))}
            </Swiper>
            
            {showMoreStoriesButtons && (
              <div className="swiper-button-next-prod absolute top-0 right-[0] cursor-pointer uppercase flex w-[139px] max-[1601px]:w-[90px] items-center max-[768px]:h-[41.35vw] h-[19.5vw] justify-center text-white max-[1024px]:w-[33px] z-20">
                <span className="rotate-90 text-black block lg:text-[1.146vw] tracking-wider max-[1024px]:hidden">
                  more
                </span>
                <img src={nextitem} className="-rotate-90 w-[12px] h-[12px] lg:w-[1.042vw] lg:h-[1.042vw] xl:w-[1.042vw] xl:h-[1.042vw] 2xl:w-[1.042vw] 2xl:h-[1.042vw]" alt="" />
              </div>
            )}
          </div>
        </div>

        <div className="w-full flex flex-col items-center mt-16">
            <WhiteThemeButton Text="Back To All Stories" link="/inspiration" />
          </div>

          <div className="w-full py-16">
        <ImageAndText
          direction={'right'}
          imgBanner={teaImg}
          lineimg={lineImg3}
          title="ready?"
          description="TIMELESS GIFTS. THOUGHTFULLY CURATED. EXCEPTIONAL SERVICE."
          buttontext={'GET STARTED'}
          buttontype={'Color'}
          buttonLink={'/register'}
        />
        </div>
      </div>

      <Footer />

      {/* Alert Component */}
      {showAlert && (
        <div
          className={`fixed top-4 right-4 ${
            alertType === 'success' ? 'bg-green-500' : 'bg-red-500'
          } text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in-out`}
        >
          <div className="flex items-center">
            {alertType === 'success' && (
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M5 13l4 4L19 7"></path>
              </svg>
            )}
            {alertType === 'error' && (
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            )}
            <span>{alertMessage}</span>
          </div>
        </div>
      )}
    </>
  );
};

const ProductCard = ({product, index, onAddToRegistry}) => {
  const [quantity, setQuantity] = React.useState(1);

  const incrementQuantity = () => {
    setQuantity((prev) => prev + 1);
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  return (
    <>
      <p className="text-[72px] text-center prata">{index + 1}.</p>
      <div className="p-3 bg-white mx-auto relative group h-[460px] mb-20 last:mb-10 max-[1025px]:h-auto max-[1025px]:mb-10">
        {/* Product Image and Info */}
        <div className="relative z-0 max-[1025px]:hidden">
          {product.images?.edges?.[0]?.node?.url && (
            <img
              src={product.images.edges[0].node.url}
              alt={
                product.images.edges[0].node.altText ||
                product.title ||
                'Product'
              }
              className="w-[320px] h-[320px] object-cover rounded mb-2 mx-auto"
            />
          )}
          <p className="font-semibold text-[22px] pt-8 w-[90%] mx-auto ">
            {product.title || `Product ${index + 1}`}
          </p>
          <p className="text-[24px]">
            {formatShopifyPrice(product.priceRange?.minVariantPrice)}
          </p>
        </div>

        {/* Expanding Overlay */}
        <div className="absolute h-[35.313vw] inset-0 z-40 bg-[#FAF9F6] py-[2vw] px-[2.24vw] flex flex-col justify-between shadow-xl border opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none group-hover:pointer-events-auto transform origin-center max-[1025px]:opacity-100 max-[1025px]:h-max max-[1025px]:z-10 max-[1025px]:static max-[1025px]:border-gray-300 max-[768px]:p-5">
          <div>
            {product.images?.edges?.[0]?.node?.url && (
              <img
                src={product.images.edges[0].node.url}
                alt={
                  product.images.edges[0].node.altText ||
                  product.title ||
                  'Product'
                }
                className="w-full mx-auto object-cover mb-[20px] aspect-square rounded"
              />
            )}
            <h4 className="text-[16px] lg:text-[0.833vw] leading-[16px] lg:leading-[0.833vw] font-normal uppercase text-left m-0 mb-[10px]">
                PRODUCT
            </h4>
            <h3 className="text-[20px] lg:text-[1.146vw] lg:leading-[1.146vw] font-[500] uppercase text-left leading-[22px] m-0 max-[1025px]:text-lg">
              {product.title || `Product ${index + 1}`}
            </h3>
            <p className="text-[20px] lg:text-[1.25vw] leading-[20px] lg:leading-[1.25vw] mt-[22px] text-left max-[1025px]:mt-2.5 max-[768px]:mt-0">
              {formatShopifyPrice(product.priceRange?.minVariantPrice)}
            </p>
          </div>

          <div className="flex flex-col w-full items-center text-xs">
            {/* Quantity Selector and View Product Button */}
            <div className="flex items-center justify-around w-full mb-4 max-[1025px]:mt-4 max-[1025px]:mb-0 max-[1025px]:flex-wrap max-[1025px]:justify-center">
              <p className="text-[18px] font-[500] uppercase text-left mb-1">
                QTY
              </p>
              {/* Quantity Selector */}
              <div className="flex flex-col items-center">
                <button
                  onClick={incrementQuantity}
                  className="flex items-center justify-center bg-white transition-colors"
                >
                  <img
                    src="/assets/Images/arrowDown.png"
                    className="w-[16px] h-[16px] rotate-180"
                    alt=""
                  />
                </button>

                <input
                  value={quantity}
                  className="w-16 text-[28px] font-normal relative top-[2px] p-0 mx-0 my-[0.521vw] text-center border-none outline-none text-28px"
                  readOnly
                />

                <button
                  onClick={decrementQuantity}
                  className="flex items-center justify-center bg-white transition-colors"
                >
                  <img
                    src="/assets/Images/arrowDown.png"
                    className="w-[16px] h-[16px]"
                    alt=""
                  />
                </button>
              </div>

              {/* Add to Registry Button */}
              <button
                onClick={() => onAddToRegistry(quantity)}
                className="bg-[#446184] text-white text-[14px] leading-[20px] font-bold py-4 px-6 lg:px-0 lg:leading-[1.042vw] w-[10.156vw] h-[4.01vw] max-[1025px]:w-full max-[1025px]:mt-4 max-[1025px]:h-auto max-[1025px]:text-[12px]"
              >
                ADD TO REGISTRY
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BlogDetails;

<style jsx>{`
  @keyframes fadeInOut {
    0% {
      opacity: 0;
      transform: translateY(-20px);
    }
    10% {
      opacity: 1;
      transform: translateY(0);
    }
    90% {
      opacity: 1;
      transform: translateY(0);
    }
    100% {
      opacity: 0;
      transform: translateY(-20px);
    }
  }
  .animate-fade-in-out {
    animation: fadeInOut 3s ease-in-out;
  }
`}</style>;
