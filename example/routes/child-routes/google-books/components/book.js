import React from 'react';

const Book = props => {
  const { title, author } = props;

  return (
    <div>
      {title} by {author}
    </div>
  );
};

Book.propTypes = {
  title: React.PropTypes.string.isRequired,
  author: React.PropTypes.string.isRequired,
};

export default Book;
