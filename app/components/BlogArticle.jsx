import React from 'react';

export default function BlogArticle({article, processedContent}) {
  return (
    <article className="prose prose-lg max-w-none prose-headings:font-semibold prose-h1:text-3xl prose-h2:text-2xl prose-p:leading-relaxed prose-img:rounded-xl prose-a:text-blue-600 hover:prose-a:underline">
      <div 
        className="blog-content-custom"
        dangerouslySetInnerHTML={{ __html: processedContent }} 
      />
      <style jsx>{`
        .blog-content-custom {
          line-height: 1.8;
          color: #333;
          font-family: inherit;
        }

        /* Custom H2 styling */
        .blog-content-custom h2 {
          font-size: 32px;
          margin: 2rem 0 1rem 0;
          color: #1F1D1B;
          line-height: 1.3;
          display: flex;
          flex-wrap: wrap;
          align-items: flex-start;
          gap: 10px;
          font-family: 'Prata';
        }

        /* Custom P styling */
        .blog-content-custom p {
          font-size: 26px;
          margin: 1rem 0;
          color: #1F1D1B;
          line-height: 1.7;
          font-family: 'bastardogrotesk';
        }

        /* Custom image styling */
        .blog-content-custom img {
          max-width: 100%;
          height: 400px;
          margin: 2rem 0;
          border-radius: 8px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          display: block;
          width: 100%;
          object-fit: cover;
        }

        /* For images in h2 that should be side by side */
        .blog-content-custom h2 img {
          display: inline-block;
          vertical-align: top;
          margin: 0;
          max-width: calc(50% - 5px);
          flex: 1;
          min-width: 200px;
          height: 300px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .blog-content-custom h2 img:first-child {
          margin-right: 10px;
        }

        .blog-content-custom h2 img:last-child {
          margin-right: 0;
        }

        /* If there are more than 2 images in h2, wrap to next line */
        .blog-content-custom h2 img:nth-child(n+3) {
          flex-basis: 100%;
          max-width: 100%;
          margin: 10px 0 0 0;
          height: 400px;
        }

        .blog-content-custom video {
          max-width: 100%;
          height: 400px;
          margin: 2rem 0;
          border-radius: 8px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .blog-content-custom ul, .blog-content-custom ol {
          margin: 1rem 0;
          padding-left: 2rem;
        }

        .blog-content-custom li {
          font-size: 1.125rem;
          margin: 0.5rem 0;
          color: #4a4a4a;
          line-height: 1.6;
        }

        .blog-content-custom blockquote {
          border-left: 4px solid #446184;
          padding: 1.5rem;
          margin: 2rem 0;
          font-style: italic;
          color: #666;
          background: #f9f9f9;
          border-radius: 0 8px 8px 0;
          font-size: 1.125rem;
          line-height: 1.6;
        }

        .blog-content-custom a {
          color: #446184;
          text-decoration: underline;
          transition: color 0.2s ease;
        }

        .blog-content-custom a:hover {
          color: #2d4a5c;
        }

        .blog-content-custom strong {
          font-weight: 600;
          color: #1a1a1a;
        }

        .blog-content-custom em {
          font-style: italic;
        }

        .blog-content-custom hr {
          border: none;
          height: 2px;
          background: #e5e5e5;
          margin: 3rem 0;
        }

        .blog-content-custom code {
          background: #f4f4f4;
          padding: 0.2rem 0.4rem;
          border-radius: 4px;
          font-family: 'Courier New', monospace;
          font-size: 0.9rem;
        }

        .blog-content-custom pre {
          background: #f4f4f4;
          padding: 1rem;
          border-radius: 8px;
          overflow-x: auto;
          margin: 1rem 0;
        }

        .blog-content-custom pre code {
          background: none;
          padding: 0;
        }

        /* Responsive adjustments */
        @media (max-width: 768px) {
          .blog-content-custom h2 {
            font-size: 1.75rem;
            flex-direction: column;
          }
          
          .blog-content-custom h2 img {
            max-width: 100%;
            margin: 10px 0;
          }
          
          .blog-content-custom p {
            font-size: 1rem;
          }
        }
      `}</style>
    </article>
  );
}
