import React from 'react';
import ButtonComponent from './Button';

const PostCard = ({post, src}) => {
  return (
    <>
      <div key={post.id} className="max-w-full">
        <div className="h-60 w-full">
          {src && (
            <img
              className="object-contain h-full w-full rounded"
              alt={post.title}
              src=""
            />
          )}
        </div>
        <div className="px-5 py-3 bg-gray-200">
          <h3 className="text-2xl font-semibold">{post.title}</h3>
          <h3 className="text-lg mt-1.5">{post.authorName}</h3>
          <p className="italic mt-1.5">{post.date}</p>
          <p className="mt-1.5">{post.description}</p>
          <ButtonComponent className="w-full mt-1.5" to={`/post/${post.id}`} />
        </div>
      </div>
    </>
  );
};

export default PostCard;
