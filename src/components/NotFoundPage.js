import Layout from './Layout';
import React from 'react';

const NotFoundPage = () => {
  return (
    <Layout>
      <h2 className="pt-3">Page Not Found</h2>
      <p>The page you have requested doesn&apos;t exist.</p>
    </Layout>
  );
};

export default NotFoundPage;
